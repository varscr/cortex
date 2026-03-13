export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`)
    params.push(query.isActive === 'true')
  }

  if (query.search) {
    conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
    params.push(`%${query.search}%`)
    paramIndex++
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await db.query(
    `SELECT * FROM strategies ${where} ORDER BY created_at DESC`,
    params,
  )

  return result.rows.map(toStrategy)
})
