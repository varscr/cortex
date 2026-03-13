export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateGoalInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_goals (title, description, status, target_date, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.title, data.description, data.status, data.targetDate, data.category],
  )

  setResponseStatus(event, 201)
  return toGoal(result.rows[0])
})
