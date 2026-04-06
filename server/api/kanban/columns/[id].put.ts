export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateColumnInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE kanban_columns kc
     SET name = $1, color = $2
     FROM kanban_boards kb
     WHERE kc.id = $3 AND kc.board_id = kb.id AND kb.user_id = $4
     RETURNING kc.*`,
    [data.name, data.color, id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Column not found' })
  }

  return toKanbanColumn(result.rows[0])
})
