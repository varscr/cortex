export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateColumnInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE kanban_columns
     SET name = $1, color = $2
     WHERE id = $3
     RETURNING *`,
    [data.name, data.color, id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Column not found' })
  }

  return toKanbanColumn(result.rows[0])
})
