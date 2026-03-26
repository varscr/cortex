import { runAgent } from '../agents/runner'

interface ParsedTransaction {
  date: string
  rawDescription: string
  description: string
  amount: number
  type: string
  category: string
  runningBalance: number | null
  installmentCurrent: number | null
  installmentTotal: number | null
  metadata: Record<string, any>
}

interface ParsedStatement {
  period: { start: string; end: string }
  summary: {
    totalCredits: number
    totalDebits: number
    openingBalance: number | null
    closingBalance: number | null
  }
  transactions: ParsedTransaction[]
}

function tryParseResponse(text: string): ParsedStatement | null {
  try {
    const parsed = JSON.parse(text)
    if (parsed && parsed.transactions && Array.isArray(parsed.transactions)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function parseAgentResponse(text: string): ParsedStatement | null {
  // 1. Try extracting from markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (fenceMatch) {
    const result = tryParseResponse(fenceMatch[1])
    if (result) return result
  }

  // 2. Try the full response as JSON
  const fullResult = tryParseResponse(text.trim())
  if (fullResult) return fullResult

  // 3. Fallback: find JSON object (first { to last })
  const start = text.indexOf('{')
  if (start !== -1) {
    const end = text.lastIndexOf('}')
    if (end > start) {
      const result = tryParseResponse(text.slice(start, end + 1))
      if (result) return result
    }
  }

  console.error('[finance-ingest] Failed to parse agent response as JSON')
  return null
}

async function saveTransaction(
  tx: ParsedTransaction,
  accountId: number,
  statementId: number,
): Promise<boolean> {
  const contentHash = computeTransactionHash(accountId, tx.date, tx.rawDescription, tx.amount)

  const result = await db.query(
    `INSERT INTO finance_transactions
      (account_id, statement_id, date, raw_description, description, amount, type, category,
       running_balance, installment_current, installment_total, metadata, content_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (content_hash) WHERE content_hash IS NOT NULL DO NOTHING
     RETURNING id`,
    [
      accountId,
      statementId,
      tx.date,
      tx.rawDescription,
      tx.description,
      tx.amount,
      tx.type || 'expense',
      tx.category || 'uncategorized',
      tx.runningBalance,
      tx.installmentCurrent,
      tx.installmentTotal,
      JSON.stringify(tx.metadata || {}),
      contentHash,
    ],
  )

  return result.rowCount > 0
}

export async function runFinanceIngest(
  statementId: number,
  accountId: number,
  institution: string,
  accountType: string,
  pdfText: string,
): Promise<number> {
  // Mark any stale "running" finance-parser runs as failed
  await db.query(
    `UPDATE agent_runs SET status = 'error', error_message = 'Interrupted by server restart', completed_at = NOW()
     WHERE agent_name = 'finance-parser' AND status = 'running'`,
  )

  // Create agent run record
  const runResult = await db.query(
    `INSERT INTO agent_runs (agent_name, status, items_total, started_at, metadata)
     VALUES ($1, $2, $3, NOW(), $4::jsonb)
     RETURNING *`,
    ['finance-parser', 'running', 1, JSON.stringify({ logs: [], errors: [] })],
  )
  const runId = runResult.rows[0].id

  // Link run to statement
  await db.query(
    `UPDATE finance_statements SET status = 'processing', run_id = $1 WHERE id = $2`,
    [runId, statementId],
  )

  // Process in background
  processStatement(runId, statementId, accountId, institution, accountType, pdfText).catch(err => {
    console.error('[finance-ingest] Fatal pipeline error:', err)
    db.query(
      `UPDATE agent_runs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3`,
      ['error', err.message, runId],
    )
    db.query(
      `UPDATE finance_statements SET status = 'error', error_message = $1 WHERE id = $2`,
      [err.message, statementId],
    )
  })

  return runId
}

async function processStatement(
  runId: number,
  statementId: number,
  accountId: number,
  institution: string,
  accountType: string,
  pdfText: string,
): Promise<void> {
  try {
    // Build prompt with metadata context
    const input = `METADATA:\nInstitution: ${institution}\nAccount Type: ${accountType}\n\nSTATEMENT TEXT:\n${pdfText}`

    console.log(`[finance-ingest] Processing statement ${statementId} (${institution}, ${pdfText.length} chars)`)

    const response = await runAgent('finance-parser', input)
    console.log(`[finance-ingest] Agent responded (${response.durationMs}ms)`)

    const parsed = parseAgentResponse(response.text)
    if (!parsed) {
      throw new Error('Failed to parse agent response as structured JSON')
    }

    let saved = 0
    let duplicates = 0

    for (const tx of parsed.transactions) {
      const wasInserted = await saveTransaction(tx, accountId, statementId)
      if (wasInserted) {
        saved++
      } else {
        duplicates++
      }
    }

    console.log(`[finance-ingest] Done: ${saved} saved, ${duplicates} duplicates, ${parsed.transactions.length} total`)

    // Update statement with period and summary
    await db.query(
      `UPDATE finance_statements
       SET status = 'completed', period_start = $1, period_end = $2,
           metadata = $3::jsonb
       WHERE id = $4`,
      [
        parsed.period?.start || null,
        parsed.period?.end || null,
        JSON.stringify({
          ...parsed.summary,
          transactionsParsed: parsed.transactions.length,
          transactionsSaved: saved,
          duplicatesSkipped: duplicates,
        }),
        statementId,
      ],
    )

    // Update agent run
    await db.query(
      `UPDATE agent_runs
       SET status = 'completed', items_processed = 1, completed_at = NOW(),
           metadata = $1::jsonb
       WHERE id = $2`,
      [
        JSON.stringify({
          logs: [{ statement: statementId, status: 'done', saved, duplicates, total: parsed.transactions.length }],
          totalTransactionsSaved: saved,
          totalDuplicatesSkipped: duplicates,
        }),
        runId,
      ],
    )
  } catch (err: any) {
    const errorMsg = err.message || String(err)
    console.error(`[finance-ingest] Failed to process statement ${statementId}:`, errorMsg)

    await db.query(
      `UPDATE finance_statements SET status = 'error', error_message = $1 WHERE id = $2`,
      [errorMsg, statementId],
    )
    await db.query(
      `UPDATE agent_runs
       SET status = 'error', error_message = $1, items_failed = 1, completed_at = NOW(),
           metadata = metadata || $2::jsonb
       WHERE id = $3`,
      [errorMsg, JSON.stringify({ errors: [{ statement: statementId, error: errorMsg }] }), runId],
    )
  }
}
