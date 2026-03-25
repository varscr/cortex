export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateSkillInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_skills
     SET name = $1, category = $2, proficiency = $3, level = $4, notes = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [data.name, data.category, data.proficiency, data.level, data.notes, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })
  }

  return toSkill(result.rows[0])
})
