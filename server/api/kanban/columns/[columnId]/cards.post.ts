export default defineEventHandler(async (event) => {
  const columnId = getRouterParam(event, 'columnId')
  const body = await readBody(event)
  const { data, error } = validateCardInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  // Verify column exists
  const colResult = await db.query(
    'SELECT id FROM kanban_columns WHERE id = $1',
    [columnId]
  )

  if (colResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Column not found' })
  }

  // Auto-position: append to end
  const posResult = await db.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM kanban_cards WHERE column_id = $1',
    [columnId]
  )

  const result = await db.query(
    `INSERT INTO kanban_cards (column_id, title, description, tags, position, due_date)
     VALUES ($1, $2, $3, $4, $5, $6::date)
     RETURNING *`,
    [columnId, data.title, data.description, data.tags, posResult.rows[0].next_pos, data.dueDate]
  )

  setResponseStatus(event, 201)
  return toKanbanCard(result.rows[0])
})
