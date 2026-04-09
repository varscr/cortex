import { upsertDocument, deleteDocument } from '../embed/core'
import type { NoteRow } from './types'

function buildEmbedText(row: NoteRow): string {
  let text = `[${row.type}] ${row.title}\n`
  text += row.content
  if (row.tags?.length) text += `\nTags: ${row.tags.join(', ')}`
  return text
}

export async function upsertNoteEmbedding(row: NoteRow, userId: string): Promise<void> {
  await upsertDocument(`note/${row.id}`, 'note', buildEmbedText(row), {
    title: row.title,
    type: row.type,
    tags: row.tags ?? [],
  }, userId)
}

export async function deleteNoteEmbedding(noteId: number, userId: string): Promise<void> {
  await deleteDocument(`note/${noteId}`, userId)
}
