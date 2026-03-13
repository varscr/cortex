export default defineEventHandler(async (event): Promise<TradingStats> => {
  const query = getQuery(event)

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (query.from) {
    conditions.push(`closed_at >= $${paramIndex++}`)
    params.push(query.from)
  }

  if (query.to) {
    conditions.push(`closed_at <= $${paramIndex++}`)
    params.push(query.to)
  }

  if (query.strategyId) {
    conditions.push(`strategy_id = $${paramIndex++}`)
    params.push(Number(query.strategyId))
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [totalsResult, pairResult, monthlyResult] = await Promise.all([
    db.query(
      `SELECT
         COUNT(*)::int AS total_trades,
         COALESCE(SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END), 0)::int AS winning_trades,
         COALESCE(SUM(pnl), 0)::numeric AS total_pnl
       FROM trades
       ${where}`,
      params,
    ),

    db.query(
      `SELECT
         pair,
         COUNT(*)::int AS trades,
         COALESCE(SUM(pnl), 0)::numeric AS pnl,
         CASE WHEN COUNT(*) > 0
           THEN ROUND(SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2)
           ELSE 0
         END AS win_rate
       FROM trades
       ${where}
       GROUP BY pair
       ORDER BY pnl DESC`,
      params,
    ),

    db.query(
      `SELECT
         date_trunc('month', closed_at)::date::text AS month,
         COALESCE(SUM(pnl), 0)::numeric AS pnl,
         COUNT(*)::int AS trades
       FROM trades
       ${where ? where + ' AND closed_at IS NOT NULL' : 'WHERE closed_at IS NOT NULL'}
       GROUP BY date_trunc('month', closed_at)
       ORDER BY month`,
      params,
    ),
  ])

  const totals = totalsResult.rows[0]
  const winRate = totals.total_trades > 0
    ? Math.round((totals.winning_trades / totals.total_trades) * 10000) / 100
    : 0

  return {
    totalTrades: totals.total_trades,
    winRate,
    totalPnl: parseFloat(totals.total_pnl),
    pairBreakdown: pairResult.rows.map((r: any) => ({
      pair: r.pair,
      trades: r.trades,
      pnl: parseFloat(r.pnl),
      winRate: parseFloat(r.win_rate),
    })),
    monthlyPnl: monthlyResult.rows.map((r: any) => ({
      month: r.month,
      pnl: parseFloat(r.pnl),
      trades: r.trades,
    })),
  }
})
