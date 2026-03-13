export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM profile_links ORDER BY position, created_at',
  )

  return result.rows.map(toLink)
})
