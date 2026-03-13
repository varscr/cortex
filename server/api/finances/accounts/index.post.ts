export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateAccountInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO accounts (name, type, currency, is_active)
     VALUES ($1, $2, $3, COALESCE($4, true))
     RETURNING *`,
    [data.name, data.type, data.currency, data.isActive ?? null],
  )

  setResponseStatus(event, 201)
  return toAccount(result.rows[0])
})
