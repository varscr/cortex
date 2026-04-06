export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const result = await db.query('SELECT * FROM finance_accounts WHERE id = $1 AND user_id = $2', [id, user.id])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return toFinanceAccount(result.rows[0])
})
