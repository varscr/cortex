export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'SELECT * FROM profile_references WHERE id = $1',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Reference not found' })
  }

  return toReference(result.rows[0])
})
