export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const boardResult = await db.query(
    'SELECT * FROM kanban_boards WHERE id = $1',
    [id]
  )

  if (boardResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  const columnsResult = await db.query(
    'SELECT * FROM kanban_columns WHERE board_id = $1 ORDER BY position',
    [id]
  )

  const columnIds = columnsResult.rows.map((c: any) => c.id)

  let cards: any[] = []
  if (columnIds.length > 0) {
    const cardsResult = await db.query(
      `SELECT * FROM kanban_cards WHERE column_id = ANY($1) ORDER BY position`,
      [columnIds]
    )
    cards = cardsResult.rows
  }

  const board = toKanbanBoard(boardResult.rows[0])
  const columns = columnsResult.rows.map((col: any) => ({
    ...toKanbanColumn(col),
    cards: cards
      .filter((card: any) => card.column_id === col.id)
      .map(toKanbanCard),
  }))

  return { ...board, columns }
})
