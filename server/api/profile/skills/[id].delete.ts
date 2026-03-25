export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM profile_skills WHERE id = $1 RETURNING id',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })
  }

  deleteSkillEmbedding(parseInt(id!))
    .catch(err => console.error('[embed] delete failed for profile/skill', id, err))

  return { deleted: true }
})
