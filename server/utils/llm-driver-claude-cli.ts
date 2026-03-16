import { spawn } from 'node:child_process'
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
    const args = ['-p', '-', '--output-format', 'json', '--no-session-persistence']

    if (request.model) {
      args.push('--model', request.model)
    }

    if (request.system) {
      args.push('--system-prompt', request.system)
    }

    const start = Date.now()

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', args, {
        env: cleanEnv(),
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5 * 60 * 1000,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => { stdout += data.toString() })
      proc.stderr.on('data', (data) => { stderr += data.toString() })

      proc.on('error', (err) => {
        reject(new Error(`Claude CLI spawn failed: ${err.message}`))
      })

      proc.on('close', (code) => {
        const durationMs = Date.now() - start

        if (code !== 0) {
          console.error('[claude-cli] stderr:', stderr)
          return reject(new Error(`Claude CLI exited with code ${code}: ${stderr || stdout}`))
        }

        try {
          const parsed = JSON.parse(stdout)

          // Check for "Not logged in" response
          if (parsed.is_error && parsed.result?.includes('Not logged in')) {
            return reject(new Error('Claude CLI not logged in. Check credentials mount.'))
          }

          resolve({
            text: parsed.result ?? parsed.text ?? stdout,
            usage: {
              inputTokens: parsed.usage?.input_tokens ?? 0,
              outputTokens: parsed.usage?.output_tokens ?? 0,
            },
            durationMs,
          })
        } catch {
          resolve({
            text: stdout.trim(),
            usage: { inputTokens: 0, outputTokens: 0 },
            durationMs,
          })
        }
      })

      // Write prompt via stdin and close
      proc.stdin.write(prompt)
      proc.stdin.end()
    })
  }
}
