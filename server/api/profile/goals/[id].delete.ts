export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM profile_goals WHERE id = $1 RETURNING id',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Goal not found' })
  }

  deleteGoalEmbedding(parseInt(id!))
    .catch(err => console.error('[embed] delete failed for profile/goal', id, err))

  return { deleted: true }
})
