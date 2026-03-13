export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateStrategyInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE strategies
     SET name = $1, description = $2, tags = $3, allocation_usd = $4, is_active = COALESCE($5, is_active)
     WHERE id = $6
     RETURNING *`,
    [data.name, data.description, data.tags, data.allocationUsd, data.isActive ?? null, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Strategy not found' })
  }

  return toStrategy(result.rows[0])
})
