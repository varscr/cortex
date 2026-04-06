export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateLogInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO log_entries (user_id, title, content, tags, mood, entry_type, is_pinned, date)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, false), COALESCE($8::date, CURRENT_DATE))
     RETURNING *`,
    [user.id, data.title, data.content, data.tags, data.mood, data.entryType, data.isPinned ?? null, data.date ?? null]
  )

  upsertLogEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for log', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toLogEntry(result.rows[0])
})
