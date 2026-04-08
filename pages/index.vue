<template>
  <div>
    <UiPageHeader
      title="Dashboard"
      description="Overview of your log entries and kanban boards."
    >
      <template #actions>
        <ButtonsPrimary icon="i-heroicons-plus" label="New Entry" @click="navigateTo('/log/new')" />
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Cards>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-zinc-400 mb-2">This Month</span>
          <span class="text-4xl font-semibold text-white">{{ stats?.logThisMonth ?? 0 }}</span>
        </div>
      </Cards>

      <Cards>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-zinc-400 mb-2">Total Entries</span>
          <span class="text-4xl font-semibold text-white">{{ stats?.logTotal ?? 0 }}</span>
        </div>
      </Cards>

      <Cards class="flex items-center justify-center group cursor-pointer hover:border-white/20 transition-colors" @click="navigateTo('/log/new')">
        <div class="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
          <UIcon name="i-heroicons-book-open" class="w-8 h-8" />
          <span class="text-sm font-medium">Write Log</span>
        </div>
      </Cards>
    </div>

    <!-- Kanban Boards -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium text-white">Kanban Boards</h3>
      <NuxtLink to="/kanban" class="text-sm text-zinc-400 hover:text-white transition-colors">View all →</NuxtLink>
    </div>

    <div v-if="boards?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Cards
        v-for="board in boards"
        :key="board.id"
        class="cursor-pointer hover:border-white/20 transition-colors"
        @click="navigateTo(`/kanban/${board.id}`)"
      >
        <div class="flex flex-col gap-3">
          <div class="flex items-start justify-between gap-2">
            <span class="font-medium text-zinc-200 leading-snug">{{ board.name }}</span>
            <UIcon name="i-heroicons-view-columns" class="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
          </div>
          <p v-if="board.description" class="text-xs text-zinc-500 line-clamp-2">{{ board.description }}</p>
          <div class="flex items-center gap-4 text-xs text-zinc-500">
            <span>{{ board.columnCount }} column{{ board.columnCount !== 1 ? 's' : '' }}</span>
            <span>{{ board.cardCount }} card{{ board.cardCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </Cards>
    </div>

    <Cards v-else-if="boards !== null" :padding="false" class="!p-0 mb-8">
      <div class="p-8 text-center flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-view-columns" class="w-10 h-10 text-zinc-600 mb-3" />
        <p class="text-zinc-400 text-sm">No boards yet.</p>
        <ButtonsSecondary variant="ghost" label="Create a board" @click="navigateTo('/kanban')" />
      </div>
    </Cards>

    <!-- Recent Log Activity -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium text-white">Recent Activity</h3>
      <NuxtLink to="/log" class="text-sm text-zinc-400 hover:text-white transition-colors">View all →</NuxtLink>
    </div>

    <Cards :padding="false" class="!p-0">
      <div v-if="recent?.length" class="divide-y divide-white/5">
        <div v-for="entry in recent" :key="entry.id"
             class="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors"
             @click="navigateTo(`/log/${entry.id}`)">
          <div class="flex flex-col gap-1">
            <span class="font-medium text-zinc-200">{{ entry.title || 'Untitled Entry' }}</span>
            <span class="text-xs text-zinc-500">{{ entry.date }} · {{ entry.entryType }}</span>
          </div>
          <UBadge v-if="entry.mood" :color="moodBadgeColor(entry.mood)" variant="subtle" size="xs" class="flex items-center gap-1">
            <UIcon :name="moodIcon(entry.mood)" :class="['w-3 h-3', moodIconColor(entry.mood)]" />
            {{ entry.mood }}
          </UBadge>
        </div>
      </div>

      <div v-else class="p-8 text-center flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-zinc-600 mb-3" />
        <p class="text-zinc-400 text-sm">No activity recorded yet.</p>
        <ButtonsSecondary variant="ghost" label="Create first entry" @click="navigateTo('/log/new')" />
      </div>
    </Cards>
  </div>
</template>

<script setup lang="ts">
const { moodIcon, moodIconColor, moodBadgeColor } = useEntryHelpers()

const [{ data: logData }, { data: boardsData }] = await Promise.all([
  useFetch('/api/log', { query: { limit: 5 } }),
  useFetch('/api/kanban/summary'),
])

const recent = computed(() => logData.value?.entries ?? [])
const boards = computed(() => boardsData.value ?? null)

const stats = computed(() => {
  if (!logData.value) return null
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const thisMonth = (logData.value.entries ?? []).filter((e: any) => e.date >= monthStart).length
  return {
    logTotal: logData.value.total,
    logThisMonth: thisMonth,
  }
})
</script>
