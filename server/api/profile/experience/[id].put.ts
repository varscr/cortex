export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateExperienceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_experience
     SET company = $1, role = $2, start_date = $3, end_date = $4, description = $5, is_current = $6, updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [data.company, data.role, data.startDate, data.endDate, data.description, data.isCurrent, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Experience not found' })
  }

  return toExperience(result.rows[0])
})
