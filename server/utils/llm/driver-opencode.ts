import { spawn } from 'node:child_process'
import type { LlmDriver, CompletionRequest, CompletionResponse } from './types'

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

export class OpencodeDriver implements LlmDriver {
  readonly provider = 'opencode'

  complete(request: CompletionRequest): Promise<CompletionResponse> {
    const prompt = buildPrompt(request.messages)
    const args = ['run', prompt, '--format', 'json']

    if (request.model) {
      args.push('--model', request.model)
    }

    const start = Date.now()

    return new Promise((resolve, reject) => {
      const proc = spawn('opencode', args, {
        env: cleanEnv(),
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5 * 60 * 1000,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => { stdout += data.toString() })
      proc.stderr.on('data', (data) => { stderr += data.toString() })

      proc.on('error', (err) => {
        reject(new Error(`OpenCode spawn failed: ${err.message}`))
      })

      proc.on('close', (code) => {
        const durationMs = Date.now() - start

        if (code !== 0) {
          console.error('[opencode] stderr:', stderr)
          return reject(new Error(`OpenCode exited with code ${code}: ${stderr || stdout}`))
        }

        try {
          // OpenCode returns multiple JSON lines - parse each and extract text
          const lines = stdout.trim().split('\n')
          const texts: string[] = []

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const parsed = JSON.parse(line)
              if (parsed.type === 'text' && parsed.part?.text) {
                texts.push(parsed.part.text)
              }
            } catch {
              // Skip invalid JSON lines
            }
          }

          const text = texts.join('')
          resolve({
            text: text || stdout.trim(),
            usage: { inputTokens: 0, outputTokens: 0 },
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
    })
  }
}
