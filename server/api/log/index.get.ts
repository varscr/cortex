export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.type) {
    conditions.push(`entry_type = $${paramIndex++}`)
    params.push(query.type)
  }

  if (query.mood) {
    conditions.push(`mood = $${paramIndex++}`)
    params.push(query.mood)
  }

  if (query.tag) {
    conditions.push(`tags @> ARRAY[$${paramIndex++}]::text[]`)
    params.push(query.tag)
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
    conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`)
    params.push(`%${query.search}%`)
    paramIndex++
  }

  if (query.pinned !== undefined) {
    conditions.push(`is_pinned = $${paramIndex++}`)
    params.push(query.pinned === 'true')
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  const countResult = await db.query(
    `SELECT COUNT(*) FROM log_entries ${where}`,
    params
  )

  const result = await db.query(
    `SELECT * FROM log_entries ${where} ORDER BY is_pinned DESC, date DESC, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  )

  return {
    entries: result.rows.map(toLogEntry),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
