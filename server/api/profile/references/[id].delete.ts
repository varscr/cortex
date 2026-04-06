export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  const result = await db.query(
    'DELETE FROM profile_references WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Reference not found' })
  }

  return { deleted: true }
})
