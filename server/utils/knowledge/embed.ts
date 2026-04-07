import { upsertDocument, deleteDocument } from '../embed/core'

function buildEmbedText(row: KnowledgeEntryRow): string {
  let text = `[${row.category}] ${row.title}\n`
  text += row.content
  if (row.tags?.length) text += `\nTags: ${row.tags.join(', ')}`
  if (row.confidence) text += `\nConfidence: ${row.confidence}`
  return text
}

export async function upsertKnowledgeEmbedding(row: KnowledgeEntryRow, userId: string): Promise<void> {
  await upsertDocument(`knowledge/${row.id}`, 'knowledge', buildEmbedText(row), {
    title: row.title,
    category: row.category,
    tags: row.tags ?? [],
    confidence: row.confidence,
  }, userId)
}

export async function deleteKnowledgeEmbedding(knowledgeId: number, userId: string): Promise<void> {
  await deleteDocument(`knowledge/${knowledgeId}`, userId)
}
