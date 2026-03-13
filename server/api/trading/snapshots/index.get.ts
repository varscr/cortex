export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  // Default to account-level snapshots (strategy_id IS NULL)
  if (query.strategyId) {
    conditions.push(`strategy_id = $${paramIndex++}`)
    params.push(Number(query.strategyId))
  } else {
    conditions.push('strategy_id IS NULL')
  }

  if (query.from) {
    conditions.push(`date >= $${paramIndex++}`)
    params.push(query.from)
  }

  if (query.to) {
    conditions.push(`date <= $${paramIndex++}`)
    params.push(query.to)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const result = await db.query(
    `SELECT * FROM daily_snapshots ${where} ORDER BY date DESC`,
    params,
  )

  return result.rows.map(toSnapshot)
})
