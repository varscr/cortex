export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const result = await db.query('DELETE FROM finance_transactions WHERE id = $1', [id])

  if (result.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return { deleted: true }
})
