export default defineEventHandler(async () => {
  const logResult = await db.query(
    `INSERT INTO trading_sync_log (sync_type, status) VALUES ('balance', 'running') RETURNING *`,
  )
  const logId = logResult.rows[0].id

  try {
    const synced = await syncBalance()

    await db.query(
      `UPDATE trading_sync_log SET status = 'completed', records_synced = $1, completed_at = NOW() WHERE id = $2`,
      [synced, logId],
    )

    return { status: 'completed', recordsSynced: synced }
  } catch (err: any) {
    await db.query(
      `UPDATE trading_sync_log SET status = 'error', error_message = $1, completed_at = NOW() WHERE id = $2`,
      [err.message || String(err), logId],
    )
    throw err
  }
})
