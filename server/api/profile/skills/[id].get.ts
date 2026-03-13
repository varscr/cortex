export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query('SELECT * FROM profile_skills WHERE id = $1', [id])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })
  }

  return toSkill(result.rows[0])
})
