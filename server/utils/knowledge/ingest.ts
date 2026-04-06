import { runAgent } from '../agents/runner'
import type { KnowledgeEntryRow } from './types'

interface ClaudeConversation {
  uuid: string
  name: string
  chat_messages: Array<{
    sender: string
    text: string
  }>
}

interface ExtractedEntry {
  title: string
  content: string
  category: string
  tags: string[]
  confidence: string
}

const MAX_CONVERSATION_CHARS = 80_000

function conversationToText(conversation: ClaudeConversation): string {
  return conversation.chat_messages
    .map(m => `[${m.sender}]\n${m.text}`)
    .join('\n\n')
}

function chunkConversation(text: string): string[] {
  if (text.length <= MAX_CONVERSATION_CHARS) return [text]

  const chunks: string[] = []
  const lines = text.split('\n')
  let current = ''

  for (const line of lines) {
    if (current.length + line.length > MAX_CONVERSATION_CHARS && current.length > 0) {
      chunks.push(current)
      current = ''
    }
    current += (current ? '\n' : '') + line
  }
  if (current) chunks.push(current)

  return chunks
}

function tryParseEntries(text: string): ExtractedEntry[] | null {
  try {
    const entries = JSON.parse(text)
    if (!Array.isArray(entries)) return null
    const valid = entries.filter(
      (e: any) => e.title && e.content && typeof e.title === 'string' && typeof e.content === 'string'
    )
    return valid.length > 0 ? valid : null
  } catch {
    return null
  }
}

function parseAgentResponse(text: string): ExtractedEntry[] {
  // 1. Try extracting from markdown code fence (most reliable with LLM output)
  const fenceMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
  if (fenceMatch) {
    const result = tryParseEntries(fenceMatch[1])
    if (result) return result
  }

  // 2. Try the full response as JSON
  const fullResult = tryParseEntries(text.trim())
  if (fullResult) return fullResult

  // 3. Fallback: find JSON array of objects (first [{ to last ])
  const start = text.search(/\[\s*\{/)
  if (start !== -1) {
    const end = text.lastIndexOf(']')
    if (end > start) {
      const result = tryParseEntries(text.slice(start, end + 1))
      if (result) return result
    }
  }

  console.error('[ingest] Failed to parse agent response as JSON')
  return []
}

async function saveEntry(entry: ExtractedEntry, conversationId: string, conversationTitle: string, userId: string): Promise<KnowledgeEntryRow | null> {
  const contentHash = computeContentHash(entry.title, entry.content)
  const result = await db.query(
    `INSERT INTO knowledge_entries (title, content, category, tags, confidence, source_conversation_id, source_conversation_title, content_hash, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (content_hash) WHERE content_hash IS NOT NULL DO NOTHING
     RETURNING *`,
    [
      entry.title,
      entry.content,
      entry.category || 'other',
      entry.tags || [],
      entry.confidence || 'medium',
      conversationId,
      conversationTitle,
      contentHash,
      userId,
    ]
  )
  return result.rows[0] ?? null
}

export async function runKnowledgeIngest(conversations: ClaudeConversation[], userId: string): Promise<number> {
  // Mark any stale "running" runs as failed (e.g. from a container restart)
  await db.query(
    `UPDATE agent_runs SET status = 'error', error_message = 'Interrupted by server restart', completed_at = NOW()
     WHERE agent_name = 'knowledge-ingest' AND status = 'running' AND user_id = $1`,
    [userId]
  )

  // Create agent run record
  const runResult = await db.query(
    `INSERT INTO agent_runs (agent_name, status, items_total, started_at, metadata, user_id)
     VALUES ($1, $2, $3, NOW(), $4::jsonb, $5)
     RETURNING *`,
    ['knowledge-ingest', 'running', conversations.length, JSON.stringify({ logs: [], errors: [] }), userId]
  )
  const runId = runResult.rows[0].id

  // Process in background — return run ID immediately
  processConversations(runId, conversations, userId).catch(err => {
    console.error('[ingest] Fatal pipeline error:', err)
    db.query(
      `UPDATE agent_runs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3 AND user_id = $4`,
      ['error', err.message, runId, userId]
    )
  })

  return runId
}

async function appendLog(runId: number, userId: string, log: { conversation: string; status: string; entries?: number; duplicates?: number; error?: string }) {
  await db.query(
    `UPDATE agent_runs SET metadata = jsonb_set(
      metadata,
      '{logs}',
      COALESCE(metadata->'logs', '[]'::jsonb) || $2::jsonb
    ) WHERE id = $1 AND user_id = $3`,
    [runId, JSON.stringify([log]), userId]
  )
}

async function processConversations(runId: number, conversations: ClaudeConversation[], userId: string): Promise<void> {
  let totalEntriesSaved = 0
  let totalDuplicatesSkipped = 0
  const errors: Array<{ conversation: string; error: string }> = []

  for (const conversation of conversations) {
    // Check if run was cancelled
    const runCheck = await db.query('SELECT status FROM agent_runs WHERE id = $1 AND user_id = $2', [runId, userId])
    if (runCheck.rows[0]?.status !== 'running') {
      console.log(`[ingest] Run ${runId} was cancelled, stopping.`)
      return
    }

    try {
      // Skip conversations already ingested
      const existing = await db.query(
        'SELECT 1 FROM knowledge_entries WHERE source_conversation_id = $1 AND user_id = $2 LIMIT 1',
        [conversation.uuid, userId]
      )
      if (existing.rows.length > 0) {
        await appendLog(runId, userId, { conversation: conversation.name, status: 'skipped' })
        await db.query(
          `UPDATE agent_runs SET items_processed = items_processed + 1 WHERE id = $1 AND user_id = $2`,
          [runId, userId]
        )
        continue
      }

      const text = conversationToText(conversation)
      if (!text.trim()) {
        await appendLog(runId, userId, { conversation: conversation.name, status: 'skipped' })
        await db.query(
          `UPDATE agent_runs SET items_processed = items_processed + 1 WHERE id = $1 AND user_id = $2`,
          [runId, userId]
        )
        continue
      }

      // Log that we're processing this conversation
      console.log(`[ingest] Processing: "${conversation.name}" (${text.length} chars)`)
      await appendLog(runId, userId, { conversation: conversation.name, status: 'processing' })

      const chunks = chunkConversation(text)
      console.log(`[ingest]   → ${chunks.length} chunk(s)`)
      let entriesFromConversation = 0
      let duplicatesFromConversation = 0
      for (const chunk of chunks) {
        console.log(`[ingest]   → Calling Claude CLI...`)
        const response = await runAgent('knowledge-ingest', chunk)
        console.log(`[ingest]   → Claude responded (${response.durationMs}ms)`)
        const entries = parseAgentResponse(response.text)

        for (const entry of entries) {
          const row = await saveEntry(entry, conversation.uuid, conversation.name, userId)
          if (row) {
            totalEntriesSaved++
            entriesFromConversation++

            // Fire-and-forget embedding
            upsertKnowledgeEmbedding(row, userId)
              .catch(err => console.error('[embed] failed for knowledge', row.id, err))
          } else {
            totalDuplicatesSkipped++
            duplicatesFromConversation++
          }
        }
      }

      console.log(`[ingest]   → Done: ${entriesFromConversation} entries extracted, ${duplicatesFromConversation} duplicates skipped`)
      await appendLog(runId, userId, { conversation: conversation.name, status: 'done', entries: entriesFromConversation, duplicates: duplicatesFromConversation })
      await db.query(
        `UPDATE agent_runs SET items_processed = items_processed + 1 WHERE id = $1 AND user_id = $2`,
        [runId, userId]
      )
    } catch (err: any) {
      const errorMsg = err.message || String(err)
      console.error(`[ingest] Failed to process conversation "${conversation.name}":`, errorMsg)
      errors.push({ conversation: conversation.name, error: errorMsg })
      await appendLog(runId, userId, { conversation: conversation.name, status: 'failed', error: errorMsg })
      await db.query(
        `UPDATE agent_runs SET items_failed = items_failed + 1, metadata = metadata || $3::jsonb WHERE id = $1 AND user_id = $2`,
        [runId, userId, JSON.stringify({ errors })]
      )
    }
  }

  await db.query(
    `UPDATE agent_runs SET status = $1, completed_at = NOW(), metadata = metadata || $2::jsonb WHERE id = $3 AND user_id = $4`,
    ['completed', JSON.stringify({ totalEntriesSaved, totalDuplicatesSkipped, errors }), runId, userId]
  )
}
