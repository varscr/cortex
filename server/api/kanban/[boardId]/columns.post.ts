export default defineEventHandler(async (event) => {
  const boardId = getRouterParam(event, 'boardId')
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateColumnInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  // Verify board exists and belongs to user
  const boardResult = await db.query(
    'SELECT id FROM kanban_boards WHERE id = $1 AND user_id = $2',
    [boardId, user.id]
  )

  if (boardResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  // Auto-position: append to end
  const posResult = await db.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM kanban_columns WHERE board_id = $1',
    [boardId]
  )

  const result = await db.query(
    `INSERT INTO kanban_columns (board_id, name, position, color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [boardId, data.name, posResult.rows[0].next_pos, data.color]
  )

  setResponseStatus(event, 201)
  return toKanbanColumn(result.rows[0])
})
