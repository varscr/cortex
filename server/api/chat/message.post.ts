import { buildSystemPrompt } from '../../utils/chat/context'
import { loadAgentConfig } from '../../utils/agents/loader'
import { createDriver } from '../../utils/llm/driver-factory'
import { buildChatContext } from '../../utils/chat/rag'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateMessageInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  // 1. Get or create session
  let session: ChatSessionRow
  if (data.sessionId) {
    const r = await db.query('SELECT * FROM chat_sessions WHERE id = $1', [data.sessionId])
    if (r.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Session not found' })
    session = r.rows[0]
  } else {
    const provider = data.provider ?? DEFAULT_PROVIDER
    const model = data.model ?? DEFAULT_MODEL
    const r = await db.query(
      'INSERT INTO chat_sessions (model_provider, model_name) VALUES ($1, $2) RETURNING *',
      [provider, model],
    )
    session = r.rows[0]
  }

  // 2. Save user message
  await db.query(
    'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
    [session.id, 'user', data.content],
  )

  // 3. Build RAG context
  const { contextText, sources } = await buildChatContext(data.content)

  // 4. Load conversation history (last 20 messages)
  const historyResult = await db.query(
    `SELECT role, content FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [session.id],
  )
  const history = historyResult.rows
    .reverse()
    .map((r: { role: string; content: string }) => ({ role: r.role as 'user' | 'assistant', content: r.content }))

  // 5. Load agent config with provider/model variables
  const config = await loadAgentConfig('chat', {
    PROVIDER: session.model_provider,
    MODEL: session.model_name,
  })
  const systemPrompt = buildSystemPrompt(config.model.system_prompt, contextText)

  // 6. Call LLM
  const driver = createDriver(session.model_provider)
  const start = Date.now()
  const response = await driver.complete({
    messages: history,
    system: systemPrompt,
    model: session.model_name,
    maxTokens: config.model.max_tokens,
    temperature: config.model.temperature,
  })
  const durationMs = Date.now() - start

  // 7. Save assistant message
  const msgResult = await db.query(
    `INSERT INTO chat_messages (session_id, role, content, sources, token_count, duration_ms)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      session.id,
      'assistant',
      response.text,
      JSON.stringify(sources),
      response.usage.outputTokens || null,
      durationMs,
    ],
  )

  // 8. Auto-title on first message (fire-and-forget)
  if (!session.title) {
    const title = data.content.slice(0, 60).trim()
    db.query('UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2', [title, session.id])
      .catch(err => console.error('[chat] auto-title failed', session.id, err))
  }

  // 9. Refresh session for response
  const updatedSession = await db.query('SELECT * FROM chat_sessions WHERE id = $1', [session.id])

  return {
    message: toChatMessage(msgResult.rows[0]),
    session: toChatSession(updatedSession.rows[0]),
  }
})
