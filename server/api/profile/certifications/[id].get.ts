export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'SELECT * FROM profile_certifications WHERE id = $1',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Certification not found' })
  }

  return toCertification(result.rows[0])
})
