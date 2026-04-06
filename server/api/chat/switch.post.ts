import { buildSystemPrompt } from '../../utils/chat/context'
import { loadAgentConfig } from '../../utils/agents/loader'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { sessionId, newProvider, newModel, pendingMessage } = body

  if (!sessionId || !newProvider || !newModel) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // 1. Get current session
  const currentSession = await db.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [sessionId, user.id])
  if (currentSession.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  // 2. Update session with new provider/model (keep same session)
  await db.query(
    'UPDATE chat_sessions SET model_provider = $1, model_name = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4',
    [newProvider, newModel, sessionId, user.id]
  )

  // 3. Get updated session
  const updatedSession = await db.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [sessionId, user.id])

  // 4. If there's a pending message, send it to the new LLM
  if (pendingMessage) {
    // Build RAG context
    const { contextText, sources } = await buildChatContext(pendingMessage, user.id)

    // Load agent config with new provider/model
    const config = await loadAgentConfig('chat', {
      PROVIDER: newProvider,
      MODEL: newModel,
    })
    const systemPrompt = buildSystemPrompt(config.model.system_prompt, contextText)

    // Save user message
    await db.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [sessionId, 'user', pendingMessage]
    )

    // Call new LLM
    const driver = createDriver(newProvider)
    const start = Date.now()
    const response = await driver.complete({
      messages: [{ role: 'user' as const, content: pendingMessage }],
      system: systemPrompt,
      model: newModel,
      maxTokens: config.model.max_tokens,
      temperature: config.model.temperature,
    })
    const durationMs = Date.now() - start

    // Save assistant response
    const msgResult = await db.query(
      `INSERT INTO chat_messages (session_id, role, content, sources, token_count, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        sessionId,
        'assistant',
        response.text,
        JSON.stringify(sources),
        response.usage.outputTokens || null,
        durationMs,
      ],
    )

    return {
      session: toChatSession(updatedSession.rows[0]),
      message: toChatMessage(msgResult.rows[0]),
    }
  }

  return {
    session: toChatSession(updatedSession.rows[0]),
  }
})
