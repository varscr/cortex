export default defineEventHandler(async () => {
  const result = await db.query('DELETE FROM knowledge_entries RETURNING id')

  db.query("DELETE FROM documents WHERE source LIKE 'knowledge/%'")
    .catch(err => console.error('[embed] delete all failed', err))

  return { deleted: result.rowCount ?? 0 }
})
