export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateLogInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE log_entries
     SET title = $1, content = $2, tags = $3, mood = $4, entry_type = $5,
         is_pinned = COALESCE($6, is_pinned),
         date = COALESCE($7::date, date), updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [data.title, data.content, data.tags, data.mood, data.entryType, data.isPinned ?? null, data.date ?? null, id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  upsertLogEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for log', result.rows[0].id, err))

  return toLogEntry(result.rows[0])
})
