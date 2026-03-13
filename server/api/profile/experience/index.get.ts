export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM profile_experience ORDER BY start_date DESC',
  )

  return result.rows.map(toExperience)
})
