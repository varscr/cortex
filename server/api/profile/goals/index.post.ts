export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateGoalInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_goals (user_id, title, description, status, target_date, category)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user.id, data.title, data.description, data.status, data.targetDate, data.category],
  )

  upsertGoalEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/goal', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toGoal(result.rows[0])
})
