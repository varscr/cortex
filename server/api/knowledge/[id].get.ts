export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  const result = await db.query(
    'SELECT * FROM knowledge_entries WHERE id = $1 AND user_id = $2',
    [id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Knowledge entry not found' })
  }

  return toKnowledgeEntry(result.rows[0])
})
