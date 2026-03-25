export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM profile_references ORDER BY created_at ASC',
  )

  return result.rows.map(toReference)
})
