export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query('SELECT * FROM log_entries WHERE id = $1', [id])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  return toLogEntry(result.rows[0])
})
