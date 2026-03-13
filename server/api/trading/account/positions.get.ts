export default defineEventHandler(async () => {
  const data = await bingxRequest<BingXPosition[]>('GET', '/openApi/swap/v2/user/positions')

  return (data || []).map((pos) => ({
    symbol: pos.symbol,
    positionId: pos.positionId,
    positionSide: pos.positionSide,
    isolated: pos.isolated,
    leverage: pos.leverage,
    avgPrice: parseFloat(pos.avgPrice),
    currentPrice: parseFloat(pos.currentPrice),
    unrealizedProfit: parseFloat(pos.unrealizedProfit),
    positionAmt: parseFloat(pos.positionAmt),
    margin: parseFloat(pos.margin),
  }))
})
