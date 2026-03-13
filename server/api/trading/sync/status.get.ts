export default defineEventHandler(async () => {
  const result = await db.query(
    `SELECT * FROM trading_sync_log ORDER BY started_at DESC LIMIT 10`,
  )

  return result.rows.map(toSyncLog)
})
