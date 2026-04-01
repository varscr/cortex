import { spawn } from 'node:child_process'
import type { LlmDriver, CompletionRequest, CompletionResponse } from './types'

function buildPrompt(messages: CompletionRequest['messages'], system?: string): string {
  let prompt = ''
  if (system) prompt += `[System]\n${system}\n\n`
  prompt += messages.map(m => {
    const label = m.role === 'user' ? '[User]' : m.role === 'assistant' ? '[Assistant]' : '[System]'
    return `${label}\n${m.content}`
  }).join('\n\n')
  return prompt
}

function parseTexts(stdout: string): string {
  const texts: string[] = []
  for (const line of stdout.trim().split('\n')) {
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
  return texts.join('') || stdout.trim()
}

export class OpencodeDriver implements LlmDriver {
  readonly provider = 'opencode'

  complete(request: CompletionRequest): Promise<CompletionResponse> {
    const prompt = buildPrompt(request.messages, request.system)
    const args = ['run', prompt, '--format', 'json']

    if (request.model) {
      args.push('--model', `opencode/${request.model}`)
    }

    const start = Date.now()

    return new Promise((resolve, reject) => {
      let resolved = false
      const proc = spawn('opencode', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: '/tmp',
        timeout: 5 * 60 * 1000,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
        // Resolve as soon as step_finish arrives — opencode keeps running after
        if (!resolved && stdout.includes('"type":"step_finish"')) {
          resolved = true
          const durationMs = Date.now() - start
          proc.kill()
          resolve({
            text: parseTexts(stdout),
            usage: { inputTokens: 0, outputTokens: 0 },
            durationMs,
          })
        }
      })

      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString() })

      proc.on('error', (err) => {
        if (!resolved) reject(new Error(`OpenCode spawn failed: ${err.message}`))
      })

      proc.on('close', (code) => {
        if (resolved) return
        const durationMs = Date.now() - start

        if (code !== 0 && code !== null && !stdout.trim()) {
          return reject(new Error(`OpenCode exited with code ${code}: ${stderr || stdout}`))
        }

        resolve({
          text: parseTexts(stdout),
          usage: { inputTokens: 0, outputTokens: 0 },
          durationMs,
        })
      })
    })
  }
}
