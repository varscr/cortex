export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    `SELECT t.*, a.name as account_name, a.institution
     FROM finance_transactions t
     JOIN finance_accounts a ON a.id = t.account_id
     WHERE t.id = $1`,
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  const row = result.rows[0]
  return {
    ...toFinanceTransaction(row),
    accountName: row.account_name,
    institution: row.institution,
  }
})
