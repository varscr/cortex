export default defineEventHandler(async (event): Promise<FinanceStats> => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.from) {
    conditions.push(`t.date >= $${paramIndex++}`)
    params.push(query.from)
  }

  if (query.to) {
    conditions.push(`t.date <= $${paramIndex++}`)
    params.push(query.to)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [totalsResult, categoryResult, accountResult, trendResult] = await Promise.all([
    // Income/expense totals + transaction count
    db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
         COUNT(*)::int AS transaction_count
       FROM transactions t
       ${where}`,
      params,
    ),

    // Category breakdown
    db.query(
      `SELECT
         COALESCE(t.category, 'uncategorized') AS category,
         SUM(t.amount)::numeric AS total,
         COUNT(*)::int AS count
       FROM transactions t
       ${where}
       GROUP BY t.category
       ORDER BY total DESC`,
      params,
    ),

    // Account-level totals
    db.query(
      `SELECT
         a.id AS account_id,
         a.name AS account_name,
         COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses
       FROM accounts a
       LEFT JOIN transactions t ON t.account_id = a.id ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
       GROUP BY a.id, a.name
       ORDER BY a.name`,
      params,
    ),

    // Monthly trend
    db.query(
      `SELECT
         date_trunc('month', t.date)::date::text AS month,
         COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses
       FROM transactions t
       ${where}
       GROUP BY date_trunc('month', t.date)
       ORDER BY month`,
      params,
    ),
  ])

  return {
    totalIncome: parseFloat(totalsResult.rows[0].total_income),
    totalExpenses: parseFloat(totalsResult.rows[0].total_expenses),
    transactionCount: totalsResult.rows[0].transaction_count,
    categoryBreakdown: categoryResult.rows.map((r: any) => ({
      category: r.category,
      total: parseFloat(r.total),
      count: r.count,
    })),
    accountTotals: accountResult.rows.map((r: any) => ({
      accountId: r.account_id,
      accountName: r.account_name,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
    })),
    monthlyTrend: trendResult.rows.map((r: any) => ({
      month: r.month,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
    })),
  }
})
