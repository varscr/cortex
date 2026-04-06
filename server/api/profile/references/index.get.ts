export default defineEventHandler(async (event) => {
  const { user } = event.context
  const result = await db.query(
    'SELECT * FROM profile_references WHERE user_id = $1 ORDER BY created_at ASC',
    [user.id],
  )

  return result.rows.map(toReference)
})
