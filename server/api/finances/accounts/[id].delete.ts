export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const result = await db.query('DELETE FROM finance_accounts WHERE id = $1', [id])

  if (result.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return { deleted: true }
})
