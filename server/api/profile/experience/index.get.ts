export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query(
    'SELECT * FROM profile_experience WHERE user_id = $1 ORDER BY start_date DESC',
    [user.id],
  )

  return result.rows.map(toExperience)
})
