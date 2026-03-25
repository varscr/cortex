export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateMonthlySummaryInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO monthly_summary (month, total_income, total_expenses, total_savings, notes)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (month) DO UPDATE SET
       total_income = COALESCE($2, monthly_summary.total_income),
       total_expenses = COALESCE($3, monthly_summary.total_expenses),
       total_savings = COALESCE($4, monthly_summary.total_savings),
       notes = COALESCE($5, monthly_summary.notes)
     RETURNING *`,
    [data.month, data.totalIncome, data.totalExpenses, data.totalSavings, data.notes],
  )

  setResponseStatus(event, 201)
  return toMonthlySummary(result.rows[0])
})
