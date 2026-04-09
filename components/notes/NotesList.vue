<template>
  <div class="flex flex-col h-full">
    <!-- Search -->
    <div class="p-3 border-b border-white/5">
      <div class="relative">
        <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          v-model="search"
          placeholder="Search notes..."
          class="w-full bg-white/5 text-sm text-zinc-300 placeholder-zinc-600 rounded-lg pl-9 pr-3 py-1.5 border border-white/5 focus:outline-none focus:border-white/10 transition-colors"
        />
      </div>
    </div>

    <!-- Type filter -->
    <div class="px-3 py-2 border-b border-white/5">
      <FiltersFilter v-model="filterType" :options="typeOptions" placeholder="All types" />
    </div>

    <!-- Notes list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="pending" class="p-4 text-center text-zinc-600 text-sm">Loading...</div>
      <div v-else-if="notes.length === 0" class="p-6 text-center">
        <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-zinc-700 mx-auto mb-2" />
        <p class="text-zinc-600 text-sm">No notes yet</p>
      </div>
      <div v-else>
        <div
          v-for="note in notes"
          :key="note.id"
          class="w-full px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5 cursor-pointer"
          :class="selectedId === note.id ? 'bg-white/5' : ''"
          @click="$emit('select', note)"
        >
          <div class="flex items-center gap-2 mb-0.5">
            <UIcon v-if="note.isPinned" name="i-heroicons-map-pin-solid" class="w-3 h-3 text-amber-400 shrink-0" />
            <span class="text-sm font-medium text-zinc-200 truncate">{{ note.title }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-1.5 py-0.5 rounded-full" :class="typeColor(note.type)">{{ note.type }}</span>
            <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="text-xs text-zinc-600">#{{ tag }}</span>
            <ClientOnly>
              <span class="text-xs text-zinc-600 ml-auto shrink-0">{{ timeAgo(note.updatedAt) }}</span>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/server/utils/notes/types'

const props = defineProps<{
  selectedId?: number | null
}>()

defineEmits<{
  select: [note: Note]
}>()

const search = ref('')
const filterType = ref('')

const typeOptions = [
  { value: 'general', label: 'General' },
  { value: 'project', label: 'Project' },
  { value: 'job', label: 'Job' },
  { value: 'technical', label: 'Technical' },
]

const queryParams = computed(() => {
  const p: Record<string, string> = {}
  if (search.value) p.search = search.value
  if (filterType.value) p.type = filterType.value
  return p
})

const { data, pending, refresh } = await useFetch<{ items: Note[]; total: number; limit: number; offset: number }>('/api/notes', {
  query: queryParams,
  watch: [queryParams],
})

const notes = computed(() => data.value?.items ?? [])

defineExpose({ refresh })

function typeColor(type: string) {
  const map: Record<string, string> = {
    general: 'bg-zinc-800 text-zinc-400',
    project: 'bg-blue-900/50 text-blue-400',
    job: 'bg-green-900/50 text-green-400',
    technical: 'bg-purple-900/50 text-purple-400',
  }
  return map[type] ?? 'bg-zinc-800 text-zinc-400'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
</script>
