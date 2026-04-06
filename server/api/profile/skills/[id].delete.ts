export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  const result = await db.query(
    'DELETE FROM profile_skills WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })
  }

  deleteSkillEmbedding(parseInt(id!), user.id)
    .catch(err => console.error('[embed] delete failed for profile/skill', id, err))

  return { deleted: true }
})
