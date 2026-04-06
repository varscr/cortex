export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateBoardInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE kanban_boards
     SET name = $1, description = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [data.name, data.description, id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  return toKanbanBoard(result.rows[0])
})
