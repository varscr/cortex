export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateEducationInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_education
     SET institution = $1, degree = $2, field_of_study = $3, start_date = $4, end_date = $5, description = $6, is_current = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [data.institution, data.degree, data.fieldOfStudy, data.startDate, data.endDate, data.description, data.isCurrent, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Education not found' })
  }

  upsertEducationEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for profile/education', result.rows[0].id, err))

  return toEducation(result.rows[0])
})
