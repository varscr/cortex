import { runAgent } from './agent-runner'
import type { KnowledgeEntryRow } from './knowledge-types'

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

async function saveEntry(entry: ExtractedEntry, conversationId: string, conversationTitle: string): Promise<KnowledgeEntryRow> {
  const result = await db.query(
    `INSERT INTO knowledge_entries (title, content, category, tags, confidence, source_conversation_id, source_conversation_title)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      entry.title,
      entry.content,
      entry.category || 'other',
      entry.tags || [],
      entry.confidence || 'medium',
      conversationId,
      conversationTitle,
    ]
  )
  return result.rows[0]
}

export async function runKnowledgeIngest(conversations: ClaudeConversation[]): Promise<number> {
  // Create agent run record
  const runResult = await db.query(
    `INSERT INTO agent_runs (agent_name, status, items_total, started_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    ['knowledge-ingest', 'running', conversations.length]
  )
  const runId = runResult.rows[0].id

  // Process in background — return run ID immediately
  processConversations(runId, conversations).catch(err => {
    console.error('[ingest] Fatal pipeline error:', err)
    db.query(
      `UPDATE agent_runs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3`,
      ['error', err.message, runId]
    )
  })

  return runId
}

async function processConversations(runId: number, conversations: ClaudeConversation[]): Promise<void> {
  let totalEntriesSaved = 0

  for (const conversation of conversations) {
    try {
      // Skip conversations already ingested
      const existing = await db.query(
        'SELECT 1 FROM knowledge_entries WHERE source_conversation_id = $1 LIMIT 1',
        [conversation.uuid]
      )
      if (existing.rows.length > 0) {
        await db.query(
          `UPDATE agent_runs SET items_processed = items_processed + 1 WHERE id = $1`,
          [runId]
        )
        continue
      }

      const text = conversationToText(conversation)
      if (!text.trim()) {
        await db.query(
          `UPDATE agent_runs SET items_processed = items_processed + 1 WHERE id = $1`,
          [runId]
        )
        continue
      }

      const chunks = chunkConversation(text)
      for (const chunk of chunks) {
        const response = await runAgent('knowledge-ingest', chunk)
        const entries = parseAgentResponse(response.text)

        for (const entry of entries) {
          const row = await saveEntry(entry, conversation.uuid, conversation.name)
          totalEntriesSaved++

          // Fire-and-forget embedding
          upsertKnowledgeEmbedding(row)
            .catch(err => console.error('[embed] failed for knowledge', row.id, err))
        }
      }

      await db.query(
        `UPDATE agent_runs SET items_processed = items_processed + 1 WHERE id = $1`,
        [runId]
      )
    } catch (err: any) {
      console.error(`[ingest] Failed to process conversation "${conversation.name}":`, err.message)
      await db.query(
        `UPDATE agent_runs SET items_failed = items_failed + 1 WHERE id = $1`,
        [runId]
      )
    }
  }

  await db.query(
    `UPDATE agent_runs SET status = $1, completed_at = NOW(), metadata = metadata || $2::jsonb WHERE id = $3`,
    ['completed', JSON.stringify({ totalEntriesSaved }), runId]
  )
}
