export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateKnowledgeInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const contentHash = computeContentHash(data.title, data.content)

  let result
  try {
    result = await db.query(
      `INSERT INTO knowledge_entries (title, content, category, tags, confidence, source_conversation_id, source_conversation_title, is_reviewed, content_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, false), $9)
       RETURNING *`,
      [data.title, data.content, data.category, data.tags, data.confidence, data.sourceConversationId, data.sourceConversationTitle, data.isReviewed ?? null, contentHash]
    )
  } catch (err: any) {
    if (err.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A knowledge entry with identical content already exists' })
    }
    throw err
  }

  upsertKnowledgeEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for knowledge', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toKnowledgeEntry(result.rows[0])
})
