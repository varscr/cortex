export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateBoardInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO kanban_boards (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [data.name, data.description]
  )

  setResponseStatus(event, 201)
  return toKanbanBoard(result.rows[0])
})
