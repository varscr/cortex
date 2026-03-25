export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateExperienceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_experience
     SET company = $1, role = $2, start_date = $3, end_date = $4, description = $5, is_current = $6, location = $7, employment_type = $8, tech_stack = $9, highlights = $10, reason_for_leaving = $11, updated_at = NOW()
     WHERE id = $12
     RETURNING *`,
    [data.company, data.role, data.startDate, data.endDate, data.description, data.isCurrent, data.location, data.employmentType, data.techStack, data.highlights, data.reasonForLeaving, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Experience not found' })
  }

  upsertExperienceEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for profile/experience', result.rows[0].id, err))

  return toExperience(result.rows[0])
})
