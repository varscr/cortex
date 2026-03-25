export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateCertificationInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_certifications (name, institution, platform, date, url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.name, data.institution, data.platform, data.date, data.url],
  )

  upsertCertificationEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for profile/certification', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toCertification(result.rows[0])
})
