import { spawn } from 'node:child_process'
import type { LlmDriver, CompletionRequest, CompletionResponse } from './types'

function buildPrompt(messages: CompletionRequest['messages']): string {
  return messages.map(m => {
    const label = m.role === 'user' ? '[User]' : m.role === 'assistant' ? '[Assistant]' : '[System]'
    return `${label}\n${m.content}`
  }).join('\n\n')
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
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60 * 1000,
      })

      let stdout = ''
      let stderr = ''
      let isAuthError = false

      const checkAuthError = (chunk: string) => {
        const text = chunk.toLowerCase()
        if (
          text.includes('/login') || 
          text.includes('authentication_error') || 
          text.includes('401')
        ) {
          isAuthError = true
          proc.kill()
          reject(new Error('Claude CLI Authentication Error: Not logged in. Please run "claude login" in your terminal.'))
          return true
        }
        return false
      }

      proc.stdout.on('data', (data) => { 
        const chunk = data.toString()
        stdout += chunk 
        checkAuthError(chunk)
      })

      proc.stderr.on('data', (data) => { 
        const chunk = data.toString()
        stderr += chunk
        checkAuthError(chunk)
      })

      proc.on('error', (err) => {
        if (!isAuthError) reject(new Error(`Claude CLI spawn failed: ${err.message}`))
      })

      proc.on('close', (code) => {
        if (isAuthError) return

        const durationMs = Date.now() - start

        if (code !== 0) {
          const combined = (stdout + stderr).toLowerCase()
          if (combined.includes('/login') || combined.includes('401') || combined.includes('authentication_error')) {
            return reject(new Error('Claude CLI Authentication Error: Not logged in. Please run "claude login" in your terminal.'))
          }
          return reject(new Error(`Claude CLI exited with code ${code}: ${stderr || stdout}`))
        }

        try {
          const parsed = JSON.parse(stdout)

          // Check for "Not logged in" response
          if (parsed.is_error && (parsed.result?.includes('Not logged in') || parsed.text?.includes('Not logged in'))) {
            return reject(new Error('Claude CLI Authentication Error: Not logged in.'))
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
