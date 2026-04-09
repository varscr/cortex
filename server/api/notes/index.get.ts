import { toNote } from '~/server/utils/notes/transform'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const user = event.context.user

  const conditions: string[] = [`user_id = $1`]
  const params: any[] = [user.id]
  let paramIndex = 2

  if (query.type) {
    conditions.push(`type = $${paramIndex++}`)
    params.push(query.type)
  }

  if (query.tag) {
    conditions.push(`tags @> ARRAY[$${paramIndex++}]::text[]`)
    params.push(query.tag)
  }

  if (query.pinned === 'true') {
    conditions.push(`is_pinned = true`)
  }

  if (query.search) {
    conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`)
    params.push(`%${query.search}%`)
    paramIndex++
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Number(query.offset) || 0

  const countResult = await db.query(
    `SELECT COUNT(*) FROM notes ${where}`,
    params
  )

  const result = await db.query(
    `SELECT * FROM notes ${where} ORDER BY is_pinned DESC, updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  )

  return {
    items: result.rows.map(toNote),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
