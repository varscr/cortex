export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const result = await db.query(
    'DELETE FROM finance_transactions WHERE id = $1 AND account_id IN (SELECT id FROM finance_accounts WHERE user_id = $2)',
    [id, user.id]
  )

  if (result.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return { deleted: true }
})
