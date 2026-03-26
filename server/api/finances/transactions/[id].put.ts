export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateTransactionUpdate(body)
  if (error || !data) throw createError({ statusCode: 400, statusMessage: error })

  // Build dynamic SET clause
  const setClauses: string[] = []
  const params: any[] = []

  if (data.description !== undefined) {
    params.push(data.description)
    setClauses.push(`description = $${params.length}`)
  }
  if (data.type !== undefined) {
    params.push(data.type)
    setClauses.push(`type = $${params.length}`)
  }
  if (data.category !== undefined) {
    params.push(data.category)
    setClauses.push(`category = $${params.length}`)
  }

  params.push(id)
  const result = await db.query(
    `UPDATE finance_transactions SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params,
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return toFinanceTransaction(result.rows[0])
})
