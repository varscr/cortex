export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM profile_projects ORDER BY is_featured DESC, created_at DESC',
  )

  return result.rows.map(toProject)
})
