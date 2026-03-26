export function buildSystemPrompt(basePrompt: string, contextText: string): string {
  const date = new Date().toISOString().split('T')[0]
  let prompt = `${basePrompt}\n\nToday's date: ${date}`
  if (contextText) prompt += `\n\n${contextText}`
  return prompt
}
