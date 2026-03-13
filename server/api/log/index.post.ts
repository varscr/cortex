export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateLogInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO log_entries (title, content, tags, mood, entry_type, is_pinned, date)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, false), COALESCE($7::date, CURRENT_DATE))
     RETURNING *`,
    [data.title, data.content, data.tags, data.mood, data.entryType, data.isPinned ?? null, data.date ?? null]
  )

  upsertLogEmbedding(result.rows[0])
    .catch(err => console.error('[embed] failed for log', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toLogEntry(result.rows[0])
})
