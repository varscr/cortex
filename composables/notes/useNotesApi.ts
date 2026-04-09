import type { Note } from '~/server/utils/notes/types'

export interface NoteInput {
  title: string
  content: string
  type?: string
  tags?: string[]
  isPinned?: boolean
}

export interface NotesListParams {
  type?: string
  tag?: string
  search?: string
  pinned?: boolean
  limit?: number
  offset?: number
}

export function useNotesApi() {
  function fetchNotes(params?: NotesListParams) {
    return $fetch<{ items: Note[]; total: number; limit: number; offset: number }>('/api/notes', {
      query: params,
    })
  }

  function createNote(body: NoteInput) {
    return $fetch<Note>('/api/notes', { method: 'POST', body })
  }

  function updateNote(id: number, body: NoteInput) {
    return $fetch<Note>(`/api/notes/${id}`, { method: 'PUT', body })
  }

  function deleteNote(id: number) {
    return $fetch<{ deleted: boolean }>(`/api/notes/${id}`, { method: 'DELETE' })
  }

  return { fetchNotes, createNote, updateNote, deleteNote }
}
