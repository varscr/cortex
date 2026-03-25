export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateCertificationInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_certifications
     SET name = $1, institution = $2, platform = $3, date = $4, url = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [data.name, data.institution, data.platform, data.date, data.url, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Certification not found' })
  }

  return toCertification(result.rows[0])
})
