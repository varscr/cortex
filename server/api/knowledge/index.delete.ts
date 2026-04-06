export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const ids = body?.ids
  const user = event.context.user

  if (Array.isArray(ids) && ids.length > 0) {
    const result = await db.query(
      `DELETE FROM knowledge_entries WHERE id = ANY($1::int[]) AND user_id = $2 RETURNING id`,
      [ids, user.id]
    )
    for (const row of result.rows) {
      deleteKnowledgeEmbedding(row.id, user.id).catch(err => console.error('[embed] delete failed', row.id, err))
    }
    return { deleted: result.rowCount ?? 0 }
  }

  const result = await db.query('DELETE FROM knowledge_entries WHERE user_id = $1 RETURNING id', [user.id])

  db.query("DELETE FROM documents WHERE user_id = $1 AND source LIKE 'knowledge/%'", [user.id])
    .catch(err => console.error('[embed] delete all failed', err))

  return { deleted: result.rowCount ?? 0 }
})
