import OpenAI from 'openai'

const MODEL = 'text-embedding-3-small'

let _client: OpenAI | null = null
let _warned = false

export interface SearchResult {
  id: number
  source: string
  sourceType: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

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

export async function upsertDocument(
  source: string,
  sourceType: string,
  content: string,
  metadata: Record<string, unknown>
): Promise<void> {
  if (!isEnabled()) return

  const embedding = await embedText(content)
  const embeddingStr = `[${embedding.join(',')}]`

  await db.query('DELETE FROM documents WHERE source = $1', [source])
  await db.query(
    `INSERT INTO documents (content, embedding, source, source_type, chunk_index, metadata)
     VALUES ($1, $2::vector, $3, $4, 0, $5)`,
    [content, embeddingStr, source, sourceType, JSON.stringify(metadata)]
  )
}

export async function deleteDocument(source: string): Promise<void> {
  await db.query('DELETE FROM documents WHERE source = $1', [source])
}

export async function searchDocuments(
  query: string,
  opts?: { sourceTypes?: string[]; limit?: number }
): Promise<SearchResult[]> {
  if (!isEnabled()) return []

  const embedding = await embedText(query)
  const embeddingStr = `[${embedding.join(',')}]`
  const limit = Math.min(opts?.limit ?? 10, 100)
  const sourceTypes = opts?.sourceTypes?.length ? opts.sourceTypes : null

  const result = await db.query(
    `SELECT id, source, source_type, content, metadata,
            1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     WHERE embedding IS NOT NULL
       AND ($2::text[] IS NULL OR source_type = ANY($2::text[]))
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [embeddingStr, sourceTypes, limit]
  )

  return result.rows.map((row) => ({
    id: row.id,
    source: row.source,
    sourceType: row.source_type,
    content: row.content,
    metadata: row.metadata ?? {},
    similarity: parseFloat(row.similarity),
  }))
}
