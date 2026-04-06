export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { ids, isReviewed } = body

  if (!Array.isArray(ids) || typeof isReviewed !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  if (ids.length === 0) return { updated: 0 }

  const result = await db.query(
    `UPDATE knowledge_entries
     SET is_reviewed = $1, updated_at = NOW()
     WHERE id = ANY($2::int[]) AND user_id = $3
     RETURNING *`,
    [isReviewed, ids, user.id]
  )

  for (const row of result.rows) {
    upsertKnowledgeEmbedding(row, user.id)
      .catch(err => console.error('[embed] failed for knowledge', row.id, err))
  }

  return { updated: result.rowCount ?? 0 }
})