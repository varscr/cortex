export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query('SELECT * FROM profile_about WHERE user_id = $1', [user.id])

  if (result.rows.length === 0) return null

  return toAbout(result.rows[0])
})
