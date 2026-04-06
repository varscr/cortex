function buildEmbedText(row: LogEntryRow): string {
  let text = ''
  if (row.entry_type) text += `[${row.entry_type}] `
  if (row.title) text += `${row.title}\n`
  text += row.content
  if (row.tags?.length) text += `\nTags: ${row.tags.join(', ')}`
  if (row.mood) text += `\nMood: ${row.mood}`
  return text
}

export async function upsertLogEmbedding(row: LogEntryRow, userId: string): Promise<void> {
  await upsertDocument(`log/${row.id}`, 'log', buildEmbedText(row), {
    title: row.title,
    entryType: row.entry_type,
    mood: row.mood,
    tags: row.tags ?? [],
    date: row.date,
  }, userId)
}

export async function deleteLogEmbedding(logId: number, userId: string): Promise<void> {
  await deleteDocument(`log/${logId}`, userId)
}
