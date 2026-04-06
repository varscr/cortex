export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const offset = parseInt(query.offset as string) || 0

  const conditions: string[] = ['a.user_id = $1']
  const params: any[] = [user.id]

  if (query.accountId) {
    params.push(query.accountId)
    conditions.push(`s.account_id = $${params.length}`)
  }
  if (query.status) {
    params.push(query.status)
    conditions.push(`s.status = $${params.length}`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const countResult = await db.query(
    `SELECT COUNT(*) FROM finance_statements s JOIN finance_accounts a ON a.id = s.account_id ${where}`,
    params,
  )

  const result = await db.query(
    `SELECT s.*, a.name as account_name, a.institution
     FROM finance_statements s
     JOIN finance_accounts a ON a.id = s.account_id
     ${where}
     ORDER BY s.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  )

  return {
    statements: result.rows.map((row: any) => ({
      ...toFinanceStatement(row),
      accountName: row.account_name,
      institution: row.institution,
    })),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
