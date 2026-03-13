export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateExperienceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_experience (company, role, start_date, end_date, description, is_current)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.company, data.role, data.startDate, data.endDate, data.description, data.isCurrent],
  )

  setResponseStatus(event, 201)
  return toExperience(result.rows[0])
})
