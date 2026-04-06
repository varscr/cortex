export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const user = event.context.user

  const conditions: string[] = [`user_id = $1`]
  const params: any[] = [user.id]
  let paramIndex = 2

  if (query.category) {
    conditions.push(`category = $${paramIndex++}`)
    params.push(query.category)
  }

  if (query.confidence) {
    conditions.push(`confidence = $${paramIndex++}`)
    params.push(query.confidence)
  }

  if (query.tag) {
    conditions.push(`tags @> ARRAY[$${paramIndex++}]::text[]`)
    params.push(query.tag)
  }

  if (query.search) {
    conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`)
    params.push(`%${query.search}%`)
    paramIndex++
  }

  if (query.isReviewed !== undefined) {
    conditions.push(`is_reviewed = $${paramIndex++}`)
    params.push(query.isReviewed === 'true')
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  const countResult = await db.query(
    `SELECT COUNT(*) FROM knowledge_entries ${where}`,
    params
  )

  const result = await db.query(
    `SELECT * FROM knowledge_entries ${where} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  )

  return {
    entries: result.rows.map(toKnowledgeEntry),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
