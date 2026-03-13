export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateSkillInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_skills (name, category, proficiency)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.category, data.proficiency],
  )

  setResponseStatus(event, 201)
  return toSkill(result.rows[0])
})
