import { buildSystemPrompt } from '../../utils/chat/context'
import { loadAgentConfig } from '../../utils/agents/loader'
import { createDriver } from '../../utils/llm/driver-factory'
import { buildChatContext } from '../../utils/chat/rag'
import type { CompletionResponse } from '../../utils/llm/types'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateMessageInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  // 1. Get or create session
  let session: ChatSessionRow
  if (data.sessionId) {
    const r = await db.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [data.sessionId, user.id])
    if (r.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Session not found' })
    session = r.rows[0]
  } else {
    const provider = data.provider ?? DEFAULT_PROVIDER
    const model = data.model ?? DEFAULT_MODEL
    const r = await db.query(
      'INSERT INTO chat_sessions (user_id, model_provider, model_name) VALUES ($1, $2, $3) RETURNING *',
      [user.id, provider, model],
    )
    session = r.rows[0]
  }

  // 2. Save user message
  await db.query(
    'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
    [session.id, 'user', data.content],
  )

  // 3. Build RAG context
  const { contextText, sources } = await buildChatContext(data.content, user.id)

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
    // FILTER: Ensure system-generated error messages are not sent to the LLM
    // as they break the expected conversation flow and cause "ghost" errors.
    .filter((r: { role: string; content: string }) => {
      if (r.role !== 'assistant') return true
      const text = r.content.toLowerCase()
      if (text.startsWith('claude cli authentication required')) return false
      if (text.includes('authentication_error') || text.includes('api error: 401') || text.includes('invalid authentication credentials')) return false
      return true
    })
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
  let response: CompletionResponse
  
  try {
    response = await driver.complete({
      messages: history,
      system: systemPrompt,
      model: session.model_name,
      maxTokens: config.model.max_tokens,
      temperature: config.model.temperature,
    })
  } catch (err: any) {
    console.error('[chat] driver error:', err.message)
    
    // If it's an auth error, return a helpful assistant message instead of crashing
    if (err.message.includes('Authentication Error')) {
      const authMessage = 'Claude CLI Authentication Required: Please run "claude login" in your terminal to authenticate, then try again.'
      
      const msgResult = await db.query(
        `INSERT INTO chat_messages (session_id, role, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [session.id, 'assistant', authMessage]
      )
      
      const updatedSession = await db.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [session.id, user.id])
      
      return {
        message: toChatMessage(msgResult.rows[0]),
        session: toChatSession(updatedSession.rows[0]),
      }
    }
    throw err
  }
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
    db.query('UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [title, session.id, user.id])
      .catch(err => console.error('[chat] auto-title failed', session.id, err))
  }

  // 9. Refresh session for response
  const updatedSession = await db.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [session.id, user.id])

  return {
    message: toChatMessage(msgResult.rows[0]),
    session: toChatSession(updatedSession.rows[0]),
  }
})
