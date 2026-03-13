interface BingXBalanceResponse {
  balance: { balance: string; equity: string; unrealizedProfit: string }
}

export async function syncBalance(): Promise<number> {
  const data = await bingxRequest<BingXBalanceResponse>('GET', '/openApi/swap/v3/user/balance')
  const bal = data.balance

  const today = new Date().toISOString().slice(0, 10)
  const equity = parseFloat(bal.equity)
  const balance = parseFloat(bal.balance)
  const pnl = parseFloat(bal.unrealizedProfit)

  await db.query(
    `INSERT INTO daily_snapshots (strategy_id, date, balance, equity, pnl)
     VALUES (NULL, $1, $2, $3, $4)
     ON CONFLICT (date) WHERE strategy_id IS NULL
     DO UPDATE SET balance = $2, equity = $3, pnl = $4`,
    [today, balance, equity, pnl],
  )

  return 1
}

export async function syncTrades(): Promise<number> {
  let totalSynced = 0
  let lastPositionId = ''
  const pageSize = 100

  // Paginate through position history
  while (true) {
    const params: Record<string, string> = {
      pageSize: pageSize.toString(),
    }
    if (lastPositionId) {
      params.lastPositionId = lastPositionId
    }

    const data = await bingxRequest<{ positionHistoryList: BingXPositionHistory[] }>(
      'GET',
      '/openApi/swap/v2/trade/positionHistory',
      params,
    )

    const positions = data.positionHistoryList
    if (!positions || positions.length === 0) break

    for (const pos of positions) {
      const result = await db.query(
        `INSERT INTO trades (
          bingx_position_id, pair, direction, entry_price, exit_price,
          quantity, pnl, fee, leverage, margin, funding_fee,
          opened_at, closed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (bingx_position_id) DO NOTHING`,
        [
          pos.positionId,
          pos.symbol,
          pos.positionSide.toLowerCase(),
          parseFloat(pos.openAvgPrice),
          parseFloat(pos.closeAvgPrice),
          Math.abs(parseFloat(pos.positionAmt)),
          parseFloat(pos.profit),
          parseFloat(pos.commission),
          pos.leverage,
          parseFloat(pos.margin),
          parseFloat(pos.fundingFee),
          new Date(pos.openTime).toISOString(),
          new Date(pos.closeTime).toISOString(),
        ],
      )

      if (result.rowCount && result.rowCount > 0) {
        totalSynced++
      }
    }

    if (positions.length < pageSize) break
    lastPositionId = positions[positions.length - 1].positionId
  }

  return totalSynced
}
