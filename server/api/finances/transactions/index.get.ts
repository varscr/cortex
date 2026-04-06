export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const offset = parseInt(query.offset as string) || 0

  const conditions: string[] = ['a.user_id = $1']
  const params: any[] = [user.id]

  if (query.accountId) {
    params.push(query.accountId)
    conditions.push(`t.account_id = $${params.length}`)
  }
  if (query.statementId) {
    params.push(query.statementId)
    conditions.push(`t.statement_id = $${params.length}`)
  }
  if (query.type) {
    params.push(query.type)
    conditions.push(`t.type = $${params.length}`)
  }
  if (query.category) {
    params.push(query.category)
    conditions.push(`t.category = $${params.length}`)
  }
  if (query.search) {
    params.push(`%${query.search}%`)
    conditions.push(`t.description ILIKE $${params.length}`)
  }
  if (query.dateFrom) {
    params.push(query.dateFrom)
    conditions.push(`t.date >= $${params.length}`)
  }
  if (query.dateTo) {
    params.push(query.dateTo)
    conditions.push(`t.date <= $${params.length}`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const countResult = await db.query(
    `SELECT COUNT(*) FROM finance_transactions t JOIN finance_accounts a ON a.id = t.account_id ${where}`,
    params,
  )

  const result = await db.query(
    `SELECT t.*, a.name as account_name, a.institution
     FROM finance_transactions t
     JOIN finance_accounts a ON a.id = t.account_id
     ${where}
     ORDER BY t.date DESC, t.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  )

  return {
    transactions: result.rows.map((row: any) => ({
      ...toFinanceTransaction(row),
      accountName: row.account_name,
      institution: row.institution,
    })),
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  }
})
