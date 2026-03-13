export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.accountId) {
    conditions.push(`account_id = $${paramIndex++}`)
    params.push(Number(query.accountId))
  }

  if (query.type) {
    conditions.push(`type = $${paramIndex++}`)
    params.push(query.type)
  }

  if (query.category) {
    conditions.push(`category = $${paramIndex++}`)
    params.push(query.category)
  }

  if (query.from) {
    conditions.push(`date >= $${paramIndex++}`)
    params.push(query.from)
  }

  if (query.to) {
    conditions.push(`date <= $${paramIndex++}`)
    params.push(query.to)
  }

  if (query.search) {
    conditions.push(`description ILIKE $${paramIndex}`)
    params.push(`%${query.search}%`)
    paramIndex++
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  const countResult = await db.query(
    `SELECT COUNT(*) FROM transactions ${where}`,
    params,
  )

  const result = await db.query(
    `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  )

  return {
    transactions: result.rows.map(toTransaction),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
