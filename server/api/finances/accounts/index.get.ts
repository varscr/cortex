export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query(
    'SELECT * FROM finance_accounts WHERE user_id = $1 ORDER BY created_at',
    [user.id]
  )
  return { accounts: result.rows.map(toFinanceAccount) }
})
