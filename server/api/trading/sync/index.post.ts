export default defineEventHandler(async () => {
  const logResult = await db.query(
    `INSERT INTO trading_sync_log (sync_type, status) VALUES ('full', 'running') RETURNING *`,
  )
  const logId = logResult.rows[0].id

  try {
    const balanceSynced = await syncBalance()
    const tradesSynced = await syncTrades()
    const total = balanceSynced + tradesSynced

    await db.query(
      `UPDATE trading_sync_log SET status = 'completed', records_synced = $1, completed_at = NOW() WHERE id = $2`,
      [total, logId],
    )

    return { status: 'completed', recordsSynced: total }
  } catch (err: any) {
    await db.query(
      `UPDATE trading_sync_log SET status = 'error', error_message = $1, completed_at = NOW() WHERE id = $2`,
      [err.message || String(err), logId],
    )
    throw err
  }
})
