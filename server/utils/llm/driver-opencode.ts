import type { LlmDriver, CompletionRequest, CompletionResponse } from './types'

const OPENCODE_URL = process.env.OPENCODE_URL || 'http://localhost:4096'

function buildPrompt(messages: CompletionRequest['messages'], system?: string): string {
  let prompt = ''
  if (system) prompt += `[System]\n${system}\n\n`
  prompt += messages.map(m => {
    const label = m.role === 'user' ? '[User]' : m.role === 'assistant' ? '[Assistant]' : '[System]'
    return `${label}\n${m.content}`
  }).join('\n\n')
  return prompt
}

export class OpencodeDriver implements LlmDriver {
  readonly provider = 'opencode'

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const prompt = buildPrompt(request.messages, request.system)
    const start = Date.now()

    // 1. Create session
    let sessionId: string
    try {
      const res = await fetch(`${OPENCODE_URL}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Failed to create session (${res.status}): ${body}`)
      }
      const data = await res.json()
      sessionId = data.id
    } catch (err: any) {
      if (err?.cause?.code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED')) {
        throw new Error(`OpenCode server not reachable at ${OPENCODE_URL}. Ensure 'opencode serve' is running.`)
      }
      throw err
    }

    // 2. Send message
    try {
      const res = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: {
            providerID: 'opencode',
            modelID: request.model,
          },
          parts: [{ type: 'text', text: prompt }],
        }),
        signal: AbortSignal.timeout(4 * 60 * 1000),
      })

      const rawBody = await res.text()
      if (!res.ok) {
        throw new Error(`OpenCode message failed (${res.status}): ${rawBody}`)
      }

      if (!rawBody) {
        throw new Error('OpenCode returned empty response')
      }

      const data = JSON.parse(rawBody)
      const durationMs = Date.now() - start

      // 3. Extract text from parts
      const texts: string[] = []
      if (data.parts && Array.isArray(data.parts)) {
        for (const part of data.parts) {
          if (part.type === 'text' && part.text) {
            texts.push(part.text)
          }
        }
      }
      const text = texts.join('') || JSON.stringify(data)

      // 4. Cleanup session (fire-and-forget)
      fetch(`${OPENCODE_URL}/session/${sessionId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10_000),
      }).catch(() => {})

      return {
        text,
        usage: { inputTokens: 0, outputTokens: 0 },
        durationMs,
      }
    } catch (err) {
      // Cleanup on error too
      fetch(`${OPENCODE_URL}/session/${sessionId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10_000),
      }).catch(() => {})
      throw err
    }
  }
}
