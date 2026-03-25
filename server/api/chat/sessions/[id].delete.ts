export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM chat_sessions WHERE id = $1 RETURNING id',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  return { deleted: true }
})
