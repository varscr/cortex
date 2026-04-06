export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateCardInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE kanban_cards kc
     SET title = $1, description = $2, tags = $3, due_date = $4::date, updated_at = NOW()
     FROM kanban_columns kcol
     JOIN kanban_boards kb ON kcol.board_id = kb.id
     WHERE kc.id = $5 AND kc.column_id = kcol.id AND kb.user_id = $6
     RETURNING kc.*`,
    [data.title, data.description, data.tags, data.dueDate, id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' })
  }

  return toKanbanCard(result.rows[0])
})
