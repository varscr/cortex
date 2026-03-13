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
      <div class="relative" ref="typeDropdownRef">
        <button
          class="w-40 bg-white/5 text-sm text-zinc-400 rounded-lg px-3 py-1.5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between"
          @click="showTypeDropdown = !showTypeDropdown"
        >
          <span :class="filterType ? 'text-zinc-300' : ''">{{ filterType ? typeOptions.find(o => o.value === filterType)?.label : 'All types' }}</span>
          <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5" />
        </button>
        <div v-if="showTypeDropdown" class="absolute top-full left-0 mt-1 w-44 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            class="w-full text-left px-3 py-1.5 text-sm transition-colors"
            :class="filterType === opt.value ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'"
            @click="filterType = opt.value; showTypeDropdown = false"
          >{{ opt.label }}</button>
        </div>
      </div>
      <div class="relative" ref="moodDropdownRef">
        <button
          class="w-40 bg-white/5 text-sm text-zinc-400 rounded-lg px-3 py-1.5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between"
          @click="showMoodDropdown = !showMoodDropdown"
        >
          <span :class="filterMood ? 'text-zinc-300' : ''">{{ filterMood ? moodOptions.find(o => o.value === filterMood)?.label : 'All moods' }}</span>
          <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5" />
        </button>
        <div v-if="showMoodDropdown" class="absolute top-full left-0 mt-1 w-44 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          <button
            v-for="opt in moodOptions"
            :key="opt.value"
            class="w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2"
            :class="filterMood === opt.value ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'"
            @click="filterMood = opt.value; showMoodDropdown = false"
          >
            <UIcon v-if="opt.value" :name="moodIcon(opt.value)" :class="['w-3.5 h-3.5', moodIconColor(opt.value)]" />
            {{ opt.label }}
          </button>
        </div>
      </div>
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
const { entryIcon, typeLabel, typeColor, typeIconColor, moodIcon, moodIconColor } = useEntryHelpers()

const search = ref('')
const filterType = ref('')
const filterMood = ref('')
const showTypeDropdown = ref(false)
const showMoodDropdown = ref(false)
const typeDropdownRef = ref<HTMLElement>()
const moodDropdownRef = ref<HTMLElement>()

function onClickOutside(event: MouseEvent) {
  if (typeDropdownRef.value && !typeDropdownRef.value.contains(event.target as Node)) {
    showTypeDropdown.value = false
  }
  if (moodDropdownRef.value && !moodDropdownRef.value.contains(event.target as Node)) {
    showMoodDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
const page = ref(1)
const limit = 20

const typeOptions = [
  { label: 'All types', value: '' },
  { label: 'Journal', value: 'journal' },
  { label: 'Reflection', value: 'reflection' },
  { label: 'Decision', value: 'decision' },
  { label: 'Therapy', value: 'therapy' },
]

const moodOptions = [
  { label: 'All moods', value: '' },
  { label: 'Great', value: 'great' },
  { label: 'Good', value: 'good' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Low', value: 'low' },
  { label: 'Bad', value: 'bad' },
]

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

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
}

</script>

