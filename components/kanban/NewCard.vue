<template>
  <div class="px-2 pb-2">
    <button
      class="w-full text-left text-xs text-zinc-500 hover:text-zinc-300 py-1.5 px-1 rounded transition-colors flex items-center gap-1"
      @click="openCreate(props.columnId)"
    >
      <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
      Add card
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  columnId: number
}>()

const { openCreate } = useKanbanState()
</script>
