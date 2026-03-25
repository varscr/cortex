export default defineEventHandler(async () => {
  const result = await db.query(
    'SELECT * FROM chat_sessions ORDER BY created_at DESC',
  )
  return result.rows.map(toChatSession)
})
