export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Request body must be an array of conversations' })
  }

  if (body.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No conversations provided' })
  }

  if (body.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Too many conversations (max 500)' })
  }

  for (let i = 0; i < body.length; i++) {
    const conv = body[i]
    if (!conv || typeof conv !== 'object') {
      throw createError({ statusCode: 400, statusMessage: `conversations[${i}]: must be an object` })
    }
    if (!conv.uuid || typeof conv.uuid !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `conversations[${i}]: missing or invalid uuid` })
    }
    if (typeof conv.name !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `conversations[${i}]: missing or invalid name` })
    }
    if (!conv.name) conv.name = 'Untitled conversation'
    if (!Array.isArray(conv.chat_messages)) {
      throw createError({ statusCode: 400, statusMessage: `conversations[${i}]: missing or invalid chat_messages array` })
    }
  }

  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const runId = await runKnowledgeIngest(body, user.id)

  setResponseStatus(event, 202)
  return { runId, status: 'running' }
})
