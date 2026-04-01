export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const ids = body?.ids

  if (Array.isArray(ids) && ids.length > 0) {
    const result = await db.query(
      `DELETE FROM knowledge_entries WHERE id = ANY($1::int[]) RETURNING id`,
      [ids]
    )
    for (const row of result.rows) {
      deleteKnowledgeEmbedding(row.id).catch(err => console.error('[embed] delete failed', row.id, err))
    }
    return { deleted: result.rowCount ?? 0 }
  }

  const result = await db.query('DELETE FROM knowledge_entries RETURNING id')

  db.query("DELETE FROM documents WHERE source LIKE 'knowledge/%'")
    .catch(err => console.error('[embed] delete all failed', err))

  return { deleted: result.rowCount ?? 0 }
})
