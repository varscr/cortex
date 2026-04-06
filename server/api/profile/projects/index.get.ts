export default defineEventHandler(async (event) => {
  const { user } = event.context
  const result = await db.query(
    'SELECT * FROM profile_projects WHERE user_id = $1 ORDER BY is_featured DESC, created_at DESC',
    [user.id],
  )

  return result.rows.map(toProject)
})
