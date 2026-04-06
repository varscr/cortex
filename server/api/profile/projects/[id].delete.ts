export default defineEventHandler(async (event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM profile_projects WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  deleteProjectEmbedding(parseInt(id!), user.id)
    .catch(err => console.error('[embed] delete failed for profile/project', id, err))

  return { deleted: true }
})
