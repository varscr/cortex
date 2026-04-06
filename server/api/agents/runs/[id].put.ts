export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const user = event.context.user

  if (!body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Status is required' })
  }

  const result = await db.query(
    `UPDATE agent_runs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *`,
    [body.status, body.errorMessage || null, id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Run not found' })
  }

  return result.rows[0]
})
