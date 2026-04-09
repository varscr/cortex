<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <UiPageHeader title="Notes" description="Your personal notes and references.">
      <template #actions>
        <ButtonsPrimary icon="i-heroicons-plus" label="New Note" @click="handleNew" />
      </template>
    </UiPageHeader>

    <!-- Two-panel layout -->
    <div class="flex-1 flex gap-0 overflow-hidden mt-4 rounded-xl border border-white/5 linear-panel">
      <!-- Left: Notes list -->
      <div class="w-72 shrink-0 border-r border-white/5 overflow-hidden flex flex-col">
        <NotesList
          ref="listRef"
          :selected-id="selectedNote?.id ?? null"
          @select="handleSelect"
        />
      </div>

      <!-- Right: Editor -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <NotesNoteEditor
          :note="selectedNote"
          :is-new="isNew"
          @saved="handleSaved"
          @deleted="handleDeleted"
          @new="handleNew"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/server/utils/notes/types'

const { selectedNote, isNew, selectNote, startNewNote, updateNoteInState, removeNoteFromState } = useNotesState()
const listRef = ref<any>(null)

function handleSelect(note: Note) {
  selectNote(note)
}

function handleNew() {
  startNewNote()
}

function handleSaved(note: Note) {
  updateNoteInState(note)
  listRef.value?.refresh()
}

function handleDeleted(id: number) {
  removeNoteFromState(id)
  listRef.value?.refresh()
}
</script>
