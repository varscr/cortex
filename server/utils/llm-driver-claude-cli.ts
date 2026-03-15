import { execFile } from 'node:child_process'
import type { LlmDriver, CompletionRequest, CompletionResponse } from './llm-types'

const SENSITIVE_ENV_KEYS = ['OPENAI_API_KEY', 'BINGX_API_KEY', 'BINGX_SECRET_KEY']

function buildPrompt(messages: CompletionRequest['messages']): string {
  return messages.map(m => {
    const label = m.role === 'user' ? '[User]' : m.role === 'assistant' ? '[Assistant]' : '[System]'
    return `${label}\n${m.content}`
  }).join('\n\n')
}

function cleanEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && !SENSITIVE_ENV_KEYS.includes(key)) {
      env[key] = value
    }
  }
  return env
}

export class ClaudeCliDriver implements LlmDriver {
  readonly provider = 'claude-code'

  complete(request: CompletionRequest): Promise<CompletionResponse> {
    const prompt = buildPrompt(request.messages)
    const args = ['-p', prompt, '--output-format', 'json', '--no-session-persistence']

    if (request.model) {
      args.push('--model', request.model)
    }

    if (request.system) {
      args.push('--system-prompt', request.system)
    }

    if (request.maxTokens) {
      args.push('--max-tokens', String(request.maxTokens))
    }

    const start = Date.now()

    return new Promise((resolve, reject) => {
      execFile('claude', args, {
        env: cleanEnv(),
        maxBuffer: 10 * 1024 * 1024,
        timeout: 5 * 60 * 1000,
      }, (error, stdout, stderr) => {
        const durationMs = Date.now() - start

        if (error) {
          console.error('[claude-cli] stderr:', stderr)
          return reject(new Error(`Claude CLI failed: ${error.message}`))
        }

        try {
          const parsed = JSON.parse(stdout)
          resolve({
            text: parsed.result ?? parsed.text ?? stdout,
            usage: {
              inputTokens: parsed.usage?.input_tokens ?? 0,
              outputTokens: parsed.usage?.output_tokens ?? 0,
            },
            durationMs,
          })
        } catch {
          // If JSON parsing fails, the raw output is the result
          resolve({
            text: stdout.trim(),
            usage: { inputTokens: 0, outputTokens: 0 },
            durationMs,
          })
        }
      })
    })
  }
}
