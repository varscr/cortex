export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateBoardInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO kanban_boards (name, description, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.description, user.id]
  )

  setResponseStatus(event, 201)
  return toKanbanBoard(result.rows[0])
})
