export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Get card to know column_id and position for recompacting
  const cardResult = await db.query(
    'SELECT * FROM kanban_cards WHERE id = $1',
    [id]
  )

  if (cardResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' })
  }

  const card = cardResult.rows[0]

  await db.query('DELETE FROM kanban_cards WHERE id = $1', [id])

  // Recompact positions for remaining cards in this column
  await db.query(
    `UPDATE kanban_cards
     SET position = position - 1
     WHERE column_id = $1 AND position > $2`,
    [card.column_id, card.position]
  )

  return { deleted: true }
})
