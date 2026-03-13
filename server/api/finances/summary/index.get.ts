export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.from) {
    conditions.push(`month >= $${paramIndex++}`)
    params.push(query.from)
  }

  if (query.to) {
    conditions.push(`month <= $${paramIndex++}`)
    params.push(query.to)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await db.query(
    `SELECT * FROM monthly_summary ${where} ORDER BY month DESC`,
    params,
  )

  return result.rows.map(toMonthlySummary)
})
