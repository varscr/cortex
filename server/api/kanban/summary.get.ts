export default defineEventHandler(async (event) => {
  const user = event.context.user

  const result = await db.query(
    `SELECT
       kb.id,
       kb.name,
       kb.description,
       kb.created_at,
       kb.updated_at,
       COUNT(DISTINCT kc.id)::int AS column_count,
       COUNT(DISTINCT ka.id)::int AS card_count
     FROM kanban_boards kb
     LEFT JOIN kanban_columns kc ON kc.board_id = kb.id
     LEFT JOIN kanban_cards ka ON ka.column_id = kc.id
     WHERE kb.user_id = $1
     GROUP BY kb.id
     ORDER BY kb.updated_at DESC`,
    [user.id]
  )

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    columnCount: row.column_count,
    cardCount: row.card_count,
    updatedAt: row.updated_at,
  }))
})
