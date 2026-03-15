<template>
  <div>
    <UiPageHeader title="Log" description="Your personal entries and reflections.">
      <template #actions>
        <UiButton icon="i-heroicons-plus" @click="navigateTo('/log/new')">New Entry</UiButton>
      </template>
    </UiPageHeader>

    <!-- Filters -->
    <div class="linear-panel rounded-xl p-3 mb-6 flex flex-wrap items-center gap-3">
      <div class="relative">
        <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          v-model="search"
          placeholder="Search entries..."
          class="w-64 bg-white/5 text-sm text-zinc-300 placeholder-zinc-600 rounded-lg pl-9 pr-3 py-1.5 border border-white/5 focus:outline-none focus:border-white/10 transition-colors"
        />
      </div>
      <UiFilterDropdown v-model="filterType" :options="TYPE_OPTIONS" placeholder="All types" />
      <UiFilterDropdown v-model="filterMood" :options="MOOD_OPTIONS" placeholder="All moods">
        <template #option="{ option, isActive }">
          <span class="flex items-center gap-2">
            <UIcon v-if="option.value" :name="moodIcon(option.value)" :class="['w-3.5 h-3.5', moodIconColor(option.value)]" />
            {{ option.label }}
          </span>
        </template>
      </UiFilterDropdown>
      <span class="ml-auto text-xs text-zinc-500">{{ total }} entries</span>
    </div>

    <!-- Entry list -->
    <UiCard v-if="entries.length > 0" class="!p-0">
      <div class="divide-y divide-white/5">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="group px-5 py-4 flex items-start gap-4 cursor-pointer rounded-lg transition-colors hover:bg-white/5"
          @click="navigateTo(`/log/${entry.id}`)"
        >
          <!-- Type icon -->
          <UIcon :name="entryIcon(entry.entryType)" :class="['w-5 h-5 mt-0.5 shrink-0', typeIconColor(entry.entryType)]" />

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-zinc-200 truncate">{{ entry.title || 'Untitled Entry' }}</span>
              <UIcon v-if="entry.isPinned" name="i-heroicons-map-pin-solid" class="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span class="text-zinc-600">·</span>
              <span class="text-xs text-zinc-500">{{ typeLabel(entry.entryType) }}</span>
              <span v-for="tag in (entry.tags ?? []).slice(0, 3)" :key="tag" class="text-xs text-zinc-600">#{{ tag }}</span>
              <span class="text-xs text-zinc-600 shrink-0">{{ formatDate(entry.date) }}</span>
            </div>
            <p v-if="entry.content" class="text-sm text-zinc-500 truncate mt-0.5">{{ contentPreview(entry.content) }}</p>
          </div>

          <!-- Right: mood + chevron -->
          <div class="flex items-center gap-2 shrink-0">
            <UIcon v-if="entry.mood" :name="moodIcon(entry.mood)" :class="['w-4 h-4', moodIconColor(entry.mood)]" />
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Empty state -->
    <UiCard v-else-if="!pending" class="!p-0">
      <div class="p-8 text-center flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-book-open" class="w-10 h-10 text-zinc-600 mb-3" />
        <p class="text-zinc-400 text-sm">No log entries yet.</p>
        <UiButton variant="ghost" class="mt-4" @click="navigateTo('/log/new')">Write your first entry</UiButton>
      </div>
    </UiCard>

    <!-- Pagination -->
    <div v-if="total > limit" class="flex justify-center mt-6">
      <UPagination v-model="page" :page-count="limit" :total="total" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/composables/useFormatDate'
import { TYPE_OPTIONS, MOOD_OPTIONS } from '~/composables/useEntryHelpers'

const { entryIcon, typeLabel, typeIconColor, moodIcon, moodIconColor } = useEntryHelpers()

const search = ref('')
const filterType = ref('')
const filterMood = ref('')

const page = ref(1)
const limit = 20

const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    limit,
    offset: (page.value - 1) * limit,
  }
  if (search.value) params.search = search.value
  if (filterType.value) params.type = filterType.value
  if (filterMood.value) params.mood = filterMood.value
  return params
})

const { data, pending } = await useFetch('/api/log', {
  query: queryParams,
  watch: [queryParams],
})

const entries = computed(() => data.value?.entries ?? [])
const total = computed(() => data.value?.total ?? 0)

function contentPreview(content: string) {
  return content.replace(/\n/g, ' ').trim().slice(0, 120)
}
</script>
