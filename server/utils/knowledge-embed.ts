import OpenAI from 'openai'
import type { KnowledgeEntryRow } from './knowledge-types'

const MODEL = 'text-embedding-3-small'

let _client: OpenAI | null = null
let _warned = false

function isEnabled(): boolean {
  if (process.env.OPENAI_API_KEY) return true
  if (!_warned) {
    console.warn('[embed] OPENAI_API_KEY not set — embeddings disabled')
    _warned = true
  }
  return false
}

function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

async function embedText(text: string): Promise<number[]> {
  const res = await getClient().embeddings.create({ model: MODEL, input: text })
  return res.data[0].embedding
}

function buildEmbedText(row: KnowledgeEntryRow): string {
  let text = `[${row.category}] ${row.title}\n`
  text += row.content
  if (row.tags?.length) text += `\nTags: ${row.tags.join(', ')}`
  if (row.confidence) text += `\nConfidence: ${row.confidence}`
  return text
}

export async function upsertKnowledgeEmbedding(row: KnowledgeEntryRow): Promise<void> {
  if (!isEnabled()) return

  const text = buildEmbedText(row)
  const embedding = await embedText(text)
  const embeddingStr = `[${embedding.join(',')}]`
  const source = `knowledge/${row.id}`

  await db.query('DELETE FROM documents WHERE source = $1', [source])
  await db.query(
    `INSERT INTO documents (content, embedding, source, source_type, chunk_index, metadata)
     VALUES ($1, $2::vector, $3, $4, $5, $6)`,
    [
      text,
      embeddingStr,
      source,
      'knowledge',
      0,
      JSON.stringify({
        title: row.title,
        category: row.category,
        tags: row.tags || [],
        confidence: row.confidence,
      }),
    ]
  )
}

export async function deleteKnowledgeEmbedding(knowledgeId: number): Promise<void> {
  if (!isEnabled()) return
  await db.query('DELETE FROM documents WHERE source = $1', [`knowledge/${knowledgeId}`])
}
