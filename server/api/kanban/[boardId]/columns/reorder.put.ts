export default defineEventHandler(async (event) => {
  const boardId = getRouterParam(event, 'boardId')
  const body = await readBody(event)
  const { data, error } = validateReorderInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  // Verify board exists
  const boardResult = await db.query(
    'SELECT id FROM kanban_boards WHERE id = $1',
    [boardId]
  )

  if (boardResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  // Update each column's position
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    for (let i = 0; i < data.orderedIds.length; i++) {
      await client.query(
        'UPDATE kanban_columns SET position = $1 WHERE id = $2 AND board_id = $3',
        [i, data.orderedIds[i], boardId]
      )
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  // Return updated columns
  const result = await db.query(
    'SELECT * FROM kanban_columns WHERE board_id = $1 ORDER BY position',
    [boardId]
  )

  return result.rows.map(toKanbanColumn)
})
