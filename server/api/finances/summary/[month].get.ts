export default defineEventHandler(async (event) => {
  const month = getRouterParam(event, 'month')

  const result = await db.query(
    'SELECT * FROM monthly_summary WHERE month = $1',
    [month],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Monthly summary not found' })
  }

  return toMonthlySummary(result.rows[0])
})
