export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query(
    'SELECT * FROM profile_links WHERE user_id = $1 ORDER BY position, created_at',
    [user.id],
  )

  return result.rows.map(toLink)
})
