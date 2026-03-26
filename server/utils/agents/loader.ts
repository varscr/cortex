import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'smol-toml'
import type { AgentConfig } from '../llm/types'

const AGENTS_DIR = join(process.cwd(), 'agents')

function substituteVariables(content: string, vars: Record<string, string>): string {
  return content.replace(/\$\{(\w+)\}/g, (_, key) => vars[key] ?? '')
}

export async function loadAgentConfig(
  name: string,
  variables?: Record<string, string>
): Promise<AgentConfig> {
  const filePath = join(AGENTS_DIR, `${name}.toml`)
  let content = await readFile(filePath, 'utf-8')

  if (variables) {
    content = substituteVariables(content, variables)
  }

  const config = parse(content) as unknown as AgentConfig
  return config
}

export async function listAgents(): Promise<string[]> {
  try {
    const files = await readdir(AGENTS_DIR)
    return files
      .filter(f => f.endsWith('.toml'))
      .map(f => f.replace('.toml', ''))
  } catch {
    return []
  }
}
