export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM kanban_boards WHERE id = $1 RETURNING id',
    [id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  return { deleted: true }
})
