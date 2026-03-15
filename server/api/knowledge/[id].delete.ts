export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM knowledge_entries WHERE id = $1 RETURNING id',
    [id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Knowledge entry not found' })
  }

  deleteKnowledgeEmbedding(parseInt(id as string))
    .catch(err => console.error('[embed] delete failed for knowledge', id, err))

  return { deleted: true }
})
