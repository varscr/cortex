export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateAccountInput(body)
  if (error || !data) throw createError({ statusCode: 400, statusMessage: error })

  const result = await db.query(
    `INSERT INTO finance_accounts (name, type, institution, currency, account_number_last4, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.name, data.type, data.institution, data.currency, data.accountNumberLast4, JSON.stringify(data.metadata || {})],
  )

  setResponseStatus(event, 201)
  return toFinanceAccount(result.rows[0])
})
