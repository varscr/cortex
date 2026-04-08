<template>
  <div
    class="rounded-lg p-3 cursor-pointer bg-zinc-800/60 hover:bg-zinc-800 border-l-4 transition-colors"
    :style="{ borderLeftColor: card.color ?? 'transparent' }"
    @click="$emit('select', card)"
  >
    <p class="text-sm font-medium text-zinc-200">{{ card.title }}</p>

    <p v-if="card.description" class="text-xs text-zinc-500 mt-1 line-clamp-2">{{ card.description }}</p>

    <!-- Task progress -->
    <div v-if="card.tasks.length" class="mt-2 flex items-center gap-2">
      <div class="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          :class="tasksDone === card.tasks.length ? 'bg-emerald-400' : 'bg-zinc-400'"
          :style="{ width: `${taskProgress}%` }"
        />
      </div>
      <span class="text-xs flex-shrink-0 text-zinc-500">
        {{ tasksDone }}/{{ card.tasks.length }}
      </span>
    </div>

    <div v-if="card.tags.length || card.dueDate" class="mt-2 flex flex-wrap items-center gap-1.5">
      <span
        v-for="tag in card.tags.slice(0, 3)"
        :key="tag"
        class="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400"
      >
        {{ tag }}
      </span>
      <span v-if="card.tags.length > 3" class="text-xs text-zinc-600">
        +{{ card.tags.length - 3 }}
      </span>
      <span v-if="card.dueDate" :class="dueDateColor" class="text-xs flex items-center gap-1 ml-auto">
        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
        {{ dueDateLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KanbanCard } from '~/composables/kanban/types'

const props = defineProps<{
  card: KanbanCard
}>()

defineEmits<{
  select: [card: KanbanCard]
}>()

const tasksDone = computed(() => props.card.tasks.filter(t => t.finished).length)
const taskProgress = computed(() => {
  if (!props.card.tasks.length) return 0
  return Math.round((tasksDone.value / props.card.tasks.length) * 100)
})

const dueDateLabel = computed(() => {
  if (!props.card.dueDate) return ''
  const d = new Date(props.card.dueDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const dueDateColor = computed(() => {
  if (!props.card.dueDate) return 'text-zinc-500'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(props.card.dueDate)
  const diff = due.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  if (days < 0) return 'text-red-400'
  if (days <= 1) return 'text-amber-400'
  return 'text-zinc-500'
})
</script>
