export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  // Get column to know board_id and position for recompacting, and verify board ownership
  const colResult = await db.query(
    `SELECT kc.* FROM kanban_columns kc
     JOIN kanban_boards kb ON kc.board_id = kb.id
     WHERE kc.id = $1 AND kb.user_id = $2`,
    [id, user.id]
  )

  if (colResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Column not found' })
  }

  const column = colResult.rows[0]

  // Delete column (cards cascade)
  await db.query('DELETE FROM kanban_columns WHERE id = $1', [id])

  // Recompact positions for remaining columns in this board
  await db.query(
    `UPDATE kanban_columns
     SET position = position - 1
     WHERE board_id = $1 AND position > $2`,
    [column.board_id, column.position]
  )

  return { deleted: true }
})
