export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const provider = body?.provider ?? DEFAULT_PROVIDER
  const model = body?.model ?? DEFAULT_MODEL

  if (!isValidProviderModel(provider, model)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid provider/model: ${provider}/${model}` })
  }

  const result = await db.query(
    'INSERT INTO chat_sessions (user_id, model_provider, model_name) VALUES ($1, $2, $3) RETURNING *',
    [user.id, provider, model],
  )

  setResponseStatus(event, 201)
  return toChatSession(result.rows[0])
})
