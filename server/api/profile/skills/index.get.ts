export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM profile_skills ORDER BY category, name',
  )

  return result.rows.map(toSkill)
})
