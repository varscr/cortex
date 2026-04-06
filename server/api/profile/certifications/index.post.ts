export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateCertificationInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_certifications (user_id, name, institution, platform, date, url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user.id, data.name, data.institution, data.platform, data.date, data.url],
  )

  upsertCertificationEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/certification', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toCertification(result.rows[0])
})
