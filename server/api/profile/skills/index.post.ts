export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateSkillInput(body)
  const user = event.context.user

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_skills (user_id, name, category, proficiency, level, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user.id, data.name, data.category, data.proficiency, data.level, data.notes],
  )

  upsertSkillEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/skill', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toSkill(result.rows[0])
})
