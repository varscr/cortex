export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query(
    'SELECT * FROM kanban_boards WHERE user_id = $1 ORDER BY created_at DESC',
    [user.id]
  )

  return result.rows.map(toKanbanBoard)
})
