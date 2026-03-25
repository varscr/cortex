export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateExperienceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_experience (company, role, start_date, end_date, description, is_current, location, employment_type, tech_stack, highlights, reason_for_leaving)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [data.company, data.role, data.startDate, data.endDate, data.description, data.isCurrent, data.location, data.employmentType, data.techStack, data.highlights, data.reasonForLeaving],
  )

  upsertExperienceEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for profile/experience', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toExperience(result.rows[0])
})
