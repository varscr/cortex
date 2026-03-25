export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body?.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }

  const result = await db.query(
    'UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [body.title.trim(), id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  return toChatSession(result.rows[0])
})
