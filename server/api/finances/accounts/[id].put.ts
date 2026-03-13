export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateAccountInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE accounts
     SET name = $1, type = $2, currency = $3, is_active = COALESCE($4, is_active)
     WHERE id = $5
     RETURNING *`,
    [data.name, data.type, data.currency, data.isActive ?? null, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return toAccount(result.rows[0])
})
