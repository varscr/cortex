export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM kanban_boards ORDER BY created_at DESC'
  )

  return result.rows.map(toKanbanBoard)
})
