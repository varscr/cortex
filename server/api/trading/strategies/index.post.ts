export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateStrategyInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO strategies (name, description, tags, allocation_usd, is_active)
     VALUES ($1, $2, $3, $4, COALESCE($5, true))
     RETURNING *`,
    [data.name, data.description, data.tags, data.allocationUsd, data.isActive ?? null],
  )

  setResponseStatus(event, 201)
  return toStrategy(result.rows[0])
})
