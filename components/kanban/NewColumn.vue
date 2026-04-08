<template>
  <div class="w-72 flex-shrink-0">
    <form v-if="expanded" @submit.prevent="submit" class="linear-panel rounded-xl p-3 space-y-3">
      <input
        ref="inputRef"
        v-model="name"
        placeholder="Column name..."
        class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none"
        @keydown.escape="expanded = false"
      />
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="c in colors"
          :key="c"
          type="button"
          class="w-5 h-5 rounded-full border-2 transition-colors"
          :class="selectedColor === c ? 'border-white' : 'border-transparent'"
          :style="{ backgroundColor: c }"
          @click="selectedColor = selectedColor === c ? null : c"
        />
      </div>
      <div class="flex items-center gap-2">
        <ButtonsPrimary type="submit" label="Add" size="sm" :disabled="!name.trim()" />
        <ButtonsIcon icon="i-heroicons-x-mark" size="sm" @click="expanded = false" />
      </div>
    </form>
    <button
      v-else
      class="w-full py-3 rounded-xl border border-dashed border-white/10 text-sm text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
      @click="open"
    >
      <UIcon name="i-heroicons-plus" class="w-4 h-4" />
      Add column
    </button>
  </div>
</template>

<script setup lang="ts">
import type { KanbanColumnDetail } from '~/composables/kanban/types'

const { createColumn } = useKanbanApi()
const { board, addColumnToState } = useKanbanState()
const toast = useToast()

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

const expanded = ref(false)
const name = ref('')
const selectedColor = ref<string | null>(null)
const inputRef = ref<HTMLInputElement>()

function open() {
  expanded.value = true
  nextTick(() => inputRef.value?.focus())
}

async function submit() {
  if (!name.value.trim() || !board.value) return
  try {
    const col = await createColumn(board.value.id, {
      name: name.value.trim(),
      color: selectedColor.value,
    })
    addColumnToState({ ...col, cards: [] } as KanbanColumnDetail)
    name.value = ''
    selectedColor.value = null
    expanded.value = false
  } catch {
    toast.add({ title: 'Failed to create column', color: 'red' })
  }
}
</script>
