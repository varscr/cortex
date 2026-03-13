export default defineEventHandler(async () => {
  const data = await bingxRequest<{ balance: BingXBalance }>('GET', '/openApi/swap/v3/user/balance')

  const bal = data.balance
  return {
    balance: parseFloat(bal.balance),
    equity: parseFloat(bal.equity),
    unrealizedProfit: parseFloat(bal.unrealizedProfit),
    availableMargin: parseFloat(bal.availableMargin),
    usedMargin: parseFloat(bal.usedMargin),
  }
})
