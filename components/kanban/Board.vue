<template>
  <div v-if="board" class="flex-1 flex overflow-x-auto overflow-y-hidden p-4 md:p-6">
    <draggable
      :list="board.columns"
      item-key="id"
      group="columns"
      handle=".column-drag-handle"
      class="flex gap-4 items-start"
      @end="onColumnReorder"
    >
      <template #item="{ element }">
        <KanbanColumn :column="element" @select-card="selectCard" />
      </template>
    </draggable>
    <div class="ml-4 flex-shrink-0">
      <KanbanNewColumn />
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

const { board, selectCard } = useKanbanState()
const { reorderColumns } = useKanbanApi()
const toast = useToast()

async function onColumnReorder() {
  if (!board.value) return
  const orderedIds = board.value.columns.map(c => c.id)
  try {
    await reorderColumns(board.value.id, orderedIds)
  } catch {
    toast.add({ title: 'Failed to reorder columns', color: 'red' })
  }
}
</script>
