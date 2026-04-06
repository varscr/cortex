export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)
  const months = parseInt(query.months as string) || 1
  const accountId = query.accountId ? parseInt(query.accountId as string) : null

  const dateFrom = new Date()
  dateFrom.setMonth(dateFrom.getMonth() - months)
  const dateFromStr = dateFrom.toISOString().split('T')[0]

  const accountFilter = accountId ? 'AND t.account_id = $3' : ''
  const params: any[] = [dateFromStr, user.id]
  if (accountId) params.push(accountId)

  // Summary totals
  const summaryResult = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as total_income,
       COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0) as total_expenses,
       COALESCE(SUM(t.amount), 0) as net_flow,
       COUNT(*) as transaction_count
     FROM finance_transactions t
     JOIN finance_accounts a ON a.id = t.account_id
     WHERE t.date >= $1 AND a.user_id = $2 ${accountFilter}`,
    params,
  )

  const summary = summaryResult.rows[0]

  // Top categories by spending
  const categoriesResult = await db.query(
    `SELECT t.category, SUM(ABS(t.amount)) as total, COUNT(*) as count
     FROM finance_transactions t
     JOIN finance_accounts a ON a.id = t.account_id
     WHERE t.date >= $1 AND a.user_id = $2 AND t.amount < 0 ${accountFilter}
     GROUP BY t.category
     ORDER BY total DESC
     LIMIT 10`,
    params,
  )

  // Per-account breakdown
  const accountsResult = await db.query(
    `SELECT
       t.account_id, a.name,
       COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as income,
       COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0) as expenses
     FROM finance_transactions t
     JOIN finance_accounts a ON a.id = t.account_id
     WHERE t.date >= $1 AND a.user_id = $2 ${accountFilter}
     GROUP BY t.account_id, a.name
     ORDER BY a.name`,
    params,
  )

  return {
    totalIncome: parseFloat(summary.total_income),
    totalExpenses: parseFloat(summary.total_expenses),
    netFlow: parseFloat(summary.net_flow),
    transactionCount: parseInt(summary.transaction_count),
    topCategories: categoriesResult.rows.map((r: any) => ({
      category: r.category,
      total: parseFloat(r.total),
      count: parseInt(r.count),
    })),
    byAccount: accountsResult.rows.map((r: any) => ({
      accountId: r.account_id,
      name: r.name,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
    })),
  }
})
