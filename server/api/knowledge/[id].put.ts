export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateKnowledgeInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const contentHash = computeContentHash(data.title, data.content)

  const result = await db.query(
    `UPDATE knowledge_entries
     SET title = $1, content = $2, category = $3, tags = $4, confidence = $5,
         source_conversation_id = $6, source_conversation_title = $7,
         is_reviewed = COALESCE($8, is_reviewed), content_hash = $9, updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [data.title, data.content, data.category, data.tags, data.confidence, data.sourceConversationId, data.sourceConversationTitle, data.isReviewed ?? null, contentHash, id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Knowledge entry not found' })
  }

  upsertKnowledgeEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for knowledge', result.rows[0].id, err))

  return toKnowledgeEntry(result.rows[0])
})
