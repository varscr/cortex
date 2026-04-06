export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (typeof body.isPinned !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'isPinned must be a boolean' })
  }

  const result = await db.query(
    `UPDATE log_entries SET is_pinned = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`,
    [body.isPinned, id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  return toLogEntry(result.rows[0])
})
