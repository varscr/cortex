export default defineEventHandler(async (event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id')

  const result = await db.query('SELECT * FROM profile_projects WHERE id = $1 AND user_id = $2', [id, user.id])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  return toProject(result.rows[0])
})
