export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateAccountInput(body)
  if (error || !data) throw createError({ statusCode: 400, statusMessage: error })

  const result = await db.query(
    `UPDATE finance_accounts
     SET name = $1, type = $2, institution = $3, currency = $4, account_number_last4 = $5, metadata = $6, updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [data.name, data.type, data.institution, data.currency, data.accountNumberLast4, JSON.stringify(data.metadata || {}), id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return toFinanceAccount(result.rows[0])
})
