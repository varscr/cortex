export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM profile_links WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Link not found' })
  }

  return { deleted: true }
})
