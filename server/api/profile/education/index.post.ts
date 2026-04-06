export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateEducationInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_education (user_id, institution, degree, field_of_study, start_date, end_date, description, is_current)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user.id, data.institution, data.degree, data.fieldOfStudy, data.startDate, data.endDate, data.description, data.isCurrent],
  )

  upsertEducationEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/education', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toEducation(result.rows[0])
})
