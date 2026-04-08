export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  // Get card to know column_id and position for recompacting, and verify board ownership
  const cardResult = await db.query(
    `SELECT kc.* FROM kanban_cards kc
     JOIN kanban_columns kcol ON kc.column_id = kcol.id
     JOIN kanban_boards kb ON kcol.board_id = kb.id
     WHERE kc.id = $1 AND kb.user_id = $2`,
    [id, user.id]
  )

  if (cardResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' })
  }

  const card = cardResult.rows[0]

  await db.query('DELETE FROM kanban_cards WHERE id = $1', [id])

  deleteKanbanEmbedding(Number(id), user.id)
    .catch(err => console.error('[embed] kanban card delete', id, err))

  // Recompact positions for remaining cards in this column
  await db.query(
    `UPDATE kanban_cards
     SET position = position - 1
     WHERE column_id = $1 AND position > $2`,
    [card.column_id, card.position]
  )

  return { deleted: true }
})
