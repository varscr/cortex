export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query('SELECT * FROM transactions WHERE id = $1', [id])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return toTransaction(result.rows[0])
})
