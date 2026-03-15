export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateKnowledgeInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO knowledge_entries (title, content, category, tags, confidence, source_conversation_id, source_conversation_title, is_reviewed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, false))
     RETURNING *`,
    [data.title, data.content, data.category, data.tags, data.confidence, data.sourceConversationId, data.sourceConversationTitle, data.isReviewed ?? null]
  )

  upsertKnowledgeEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for knowledge', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toKnowledgeEntry(result.rows[0])
})
