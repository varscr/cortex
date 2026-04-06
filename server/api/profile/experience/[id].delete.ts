export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM profile_experience WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Experience not found' })
  }

  deleteExperienceEmbedding(parseInt(id!), user.id)
    .catch(err => console.error('[embed] delete failed for profile/experience', id, err))

  return { deleted: true }
})
