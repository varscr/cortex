export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Status is required' })
  }

  const result = await db.query(
    `UPDATE agent_runs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3 RETURNING *`,
    [body.status, body.errorMessage || null, id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Run not found' })
  }

  return result.rows[0]
})
