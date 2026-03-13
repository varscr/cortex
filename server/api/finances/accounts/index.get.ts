export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.type) {
    conditions.push(`type = $${paramIndex++}`)
    params.push(query.type)
  }

  if (query.isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`)
    params.push(query.isActive === 'true')
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await db.query(
    `SELECT * FROM accounts ${where} ORDER BY name`,
    params,
  )

  return result.rows.map(toAccount)
})
