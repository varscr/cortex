export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM finance_accounts ORDER BY created_at',
  )
  return { accounts: result.rows.map(toFinanceAccount) }
})
