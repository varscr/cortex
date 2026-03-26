<template>
  <div>
    <UiPageHeader 
      title="Dashboard" 
      description="Overview of your log entries and financial activity."
    >
      <template #actions>
        <ButtonsPrimary icon="i-heroicons-plus" label="New Entry" @click="navigateTo('/log/new')" />
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UiCard>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-zinc-400 mb-2">This Month</span>
          <span class="text-4xl font-semibold text-white">{{ stats?.logThisMonth ?? 0 }}</span>
        </div>
      </UiCard>
      
      <UiCard>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-zinc-400 mb-2">Total Entries</span>
          <span class="text-4xl font-semibold text-white">{{ stats?.logTotal ?? 0 }}</span>
        </div>
      </UiCard>
      
      <UiCard class="flex items-center justify-center group cursor-pointer hover:border-white/20 transition-colors" @click="navigateTo('/log/new')">
        <div class="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
          <UIcon name="i-heroicons-book-open" class="w-8 h-8" />
          <span class="text-sm font-medium">Write Log</span>
        </div>
      </UiCard>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium text-white">Recent Activity</h3>
      <NuxtLink to="/log" class="text-sm text-zinc-400 hover:text-white transition-colors">View all →</NuxtLink>
    </div>

    <UiCard class="!p-0">
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
    </UiCard>
  </div>
</template>

<script setup lang="ts">
const { moodIcon, moodIconColor, moodBadgeColor } = useEntryHelpers()

const { data } = await useFetch('/api/log', { query: { limit: 5 } })

const recent = computed(() => data.value?.entries ?? [])

const stats = computed(() => {
  if (!data.value) return null
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const thisMonth = (data.value.entries ?? []).filter((e: any) => e.date >= monthStart).length
  return {
    logTotal: data.value.total,
    logThisMonth: thisMonth,
  }
})

</script>
