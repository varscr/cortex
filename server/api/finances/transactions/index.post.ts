export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateTransactionInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO transactions (account_id, type, category, amount, description, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.accountId, data.type, data.category, data.amount, data.description, data.date],
  )

  setResponseStatus(event, 201)
  return toTransaction(result.rows[0])
})
