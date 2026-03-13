export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.pair) {
    conditions.push(`pair = $${paramIndex++}`)
    params.push(query.pair)
  }

  if (query.direction) {
    conditions.push(`direction = $${paramIndex++}`)
    params.push(query.direction)
  }

  if (query.strategyId) {
    conditions.push(`strategy_id = $${paramIndex++}`)
    params.push(Number(query.strategyId))
  }

  if (query.from) {
    conditions.push(`closed_at >= $${paramIndex++}`)
    params.push(query.from)
  }

  if (query.to) {
    conditions.push(`closed_at <= $${paramIndex++}`)
    params.push(query.to)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  const countResult = await db.query(
    `SELECT COUNT(*) FROM trades ${where}`,
    params,
  )

  const result = await db.query(
    `SELECT * FROM trades ${where} ORDER BY closed_at DESC NULLS LAST, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  )

  return {
    trades: result.rows.map(toTrade),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
