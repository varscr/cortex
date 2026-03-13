export default defineEventHandler(async () => {
  const result = await db.query(
    `SELECT * FROM daily_snapshots WHERE strategy_id IS NULL ORDER BY date DESC LIMIT 1`,
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'No account snapshot found' })
  }

  return toSnapshot(result.rows[0])
})
