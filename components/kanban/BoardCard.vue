<template>
  <div
    class="linear-panel rounded-xl p-5 cursor-pointer hover:bg-white/[0.04] transition-colors group"
    @click="navigateTo(`/kanban/${board.id}`)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-white font-medium truncate">{{ board.name }}</h3>
        <p v-if="board.description" class="text-sm text-zinc-400 line-clamp-2 mt-1">{{ board.description }}</p>
      </div>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <ButtonsIcon
          icon="i-heroicons-pencil"
          size="sm"
          @click.stop="$emit('edit', board)"
        />
        <ButtonsIcon
          icon="i-heroicons-trash"
          size="sm"
          variant="danger"
          @click.stop="$emit('delete', board)"
        />
      </div>
    </div>
    <p class="text-xs text-zinc-600 mt-3">{{ formatDate(board.updatedAt) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { KanbanBoard } from '~/composables/kanban/types'

defineProps<{
  board: KanbanBoard
}>()

defineEmits<{
  edit: [board: KanbanBoard]
  delete: [board: KanbanBoard]
}>()
</script>
