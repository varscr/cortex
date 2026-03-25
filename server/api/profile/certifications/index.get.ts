export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM profile_certifications ORDER BY date DESC NULLS LAST, created_at DESC',
  )

  return result.rows.map(toCertification)
})
