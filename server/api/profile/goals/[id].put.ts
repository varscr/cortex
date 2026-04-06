export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateGoalInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_goals
     SET title = $1, description = $2, status = $3, target_date = $4, category = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [data.title, data.description, data.status, data.targetDate, data.category, id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Goal not found' })
  }

  upsertGoalEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/goal', result.rows[0].id, err))

  return toGoal(result.rows[0])
})
