export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateCardInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE kanban_cards
     SET title = $1, description = $2, tags = $3, due_date = $4::date, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [data.title, data.description, data.tags, data.dueDate, id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' })
  }

  return toKanbanCard(result.rows[0])
})
