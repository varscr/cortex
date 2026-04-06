export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query(
    'SELECT * FROM profile_certifications WHERE user_id = $1 ORDER BY date DESC NULLS LAST, created_at DESC',
    [user.id]
  )

  return result.rows.map(toCertification)
})
