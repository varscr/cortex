export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query('SELECT * FROM trades WHERE id = $1', [id])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Trade not found' })
  }

  return toTrade(result.rows[0])
})
