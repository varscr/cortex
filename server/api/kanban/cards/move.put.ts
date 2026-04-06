export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = event.context.user
  const { data, error } = validateCardMoveInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // Get current card and verify board ownership
    const cardResult = await client.query(
      `SELECT kc.* FROM kanban_cards kc
       JOIN kanban_columns kcol ON kc.column_id = kcol.id
       JOIN kanban_boards kb ON kcol.board_id = kb.id
       WHERE kc.id = $1 AND kb.user_id = $2`,
      [data.cardId, user.id]
    )

    if (cardResult.rows.length === 0) {
      await client.query('ROLLBACK')
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const card = cardResult.rows[0]

    // Verify target column exists and belongs to user's board
    const colResult = await client.query(
      `SELECT kcol.id FROM kanban_columns kcol
       JOIN kanban_boards kb ON kcol.board_id = kb.id
       WHERE kcol.id = $1 AND kb.user_id = $2`,
      [data.targetColumnId, user.id]
    )

    if (colResult.rows.length === 0) {
      await client.query('ROLLBACK')
      throw createError({ statusCode: 404, statusMessage: 'Target column not found' })
    }

    const sourceColumnId = card.column_id
    const sourcePosition = card.position

    // 1. Close position gap in source column
    await client.query(
      `UPDATE kanban_cards
       SET position = position - 1
       WHERE column_id = $1 AND position > $2`,
      [sourceColumnId, sourcePosition]
    )

    // 2. Open position gap in target column
    await client.query(
      `UPDATE kanban_cards
       SET position = position + 1
       WHERE column_id = $1 AND position >= $2`,
      [data.targetColumnId, data.position]
    )

    // 3. Update card's column_id + position
    const result = await client.query(
      `UPDATE kanban_cards
       SET column_id = $1, position = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [data.targetColumnId, data.position, data.cardId]
    )

    await client.query('COMMIT')

    return toKanbanCard(result.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
