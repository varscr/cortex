export default defineEventHandler(async (event) => {
  const user = event.context.user

  const result = await db.query(
    'SELECT * FROM profile_skills WHERE user_id = $1 ORDER BY category, name',
    [user.id],
  )

  return result.rows.map(toSkill)
})
