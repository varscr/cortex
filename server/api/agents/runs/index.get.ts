export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.agentName) {
    conditions.push(`agent_name = $${paramIndex++}`)
    params.push(query.agentName)
  }

  if (query.status) {
    conditions.push(`status = $${paramIndex++}`)
    params.push(query.status)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  const countResult = await db.query(
    `SELECT COUNT(*) FROM agent_runs ${where}`,
    params
  )

  const result = await db.query(
    `SELECT * FROM agent_runs ${where} ORDER BY started_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  )

  return {
    runs: result.rows.map(toAgentRun),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
