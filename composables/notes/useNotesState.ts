import type { Note } from '~/server/utils/notes/types'

export function useNotesState() {
  const notes = useState<Note[]>('notes-list', () => [])
  const selectedNote = useState<Note | null>('notes-selected', () => null)
  const isNew = useState<boolean>('notes-is-new', () => false)

  function selectNote(note: Note) {
    selectedNote.value = { ...note }
    isNew.value = false
  }

  function startNewNote() {
    selectedNote.value = null
    isNew.value = true
  }

  function updateNoteInState(updated: Note) {
    const idx = notes.value.findIndex(n => n.id === updated.id)
    if (idx !== -1) {
      notes.value[idx] = updated
    } else {
      notes.value.unshift(updated)
    }
    selectedNote.value = updated
    isNew.value = false
  }

  function removeNoteFromState(id: number) {
    notes.value = notes.value.filter(n => n.id !== id)
    if (selectedNote.value?.id === id) {
      selectedNote.value = null
      isNew.value = false
    }
  }

  return { notes, selectedNote, isNew, selectNote, startNewNote, updateNoteInState, removeNoteFromState }
}
