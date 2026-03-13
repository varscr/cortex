export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateTransactionInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE transactions
     SET account_id = $1, type = $2, category = $3, amount = $4, description = $5, date = $6
     WHERE id = $7
     RETURNING *`,
    [data.accountId, data.type, data.category, data.amount, data.description, data.date, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return toTransaction(result.rows[0])
})
