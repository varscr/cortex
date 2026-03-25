export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const [sessionResult, messagesResult] = await Promise.all([
    db.query('SELECT * FROM chat_sessions WHERE id = $1', [id]),
    db.query('SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC', [id]),
  ])

  if (sessionResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  const session = toChatSession(sessionResult.rows[0])
  const messages = messagesResult.rows.map(toChatMessage)

  return { ...session, messages } satisfies ChatSessionDetail
})
