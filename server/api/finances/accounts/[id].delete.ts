export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const result = await db.query('DELETE FROM finance_accounts WHERE id = $1 AND user_id = $2', [id, user.id])

  if (result.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return { deleted: true }
})
