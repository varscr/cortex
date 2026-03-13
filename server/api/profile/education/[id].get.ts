export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'SELECT * FROM profile_education WHERE id = $1',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Education not found' })
  }

  return toEducation(result.rows[0])
})
