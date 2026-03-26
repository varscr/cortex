export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    `SELECT s.*, a.name as account_name, a.institution,
       (SELECT COUNT(*) FROM finance_transactions t WHERE t.statement_id = s.id) as transaction_count
     FROM finance_statements s
     JOIN finance_accounts a ON a.id = s.account_id
     WHERE s.id = $1`,
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Statement not found' })
  }

  const row = result.rows[0]
  return {
    ...toFinanceStatement(row),
    accountName: row.account_name,
    institution: row.institution,
    transactionCount: parseInt(row.transaction_count),
  }
})
