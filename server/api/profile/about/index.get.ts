export default defineEventHandler(async () => {
  const result = await db.query('SELECT * FROM profile_about WHERE id = 1')

  if (result.rows.length === 0) return null

  return toAbout(result.rows[0])
})
