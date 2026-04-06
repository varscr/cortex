export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateSkillInput(body)
  const user = event.context.user

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_skills
     SET name = $1, category = $2, proficiency = $3, level = $4, notes = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [data.name, data.category, data.proficiency, data.level, data.notes, id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })
  }

  upsertSkillEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/skill', result.rows[0].id, err))

  return toSkill(result.rows[0])
})
