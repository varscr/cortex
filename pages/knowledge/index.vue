<template>
  <div>
    <UiPageHeader title="Knowledge" description="Your personal knowledge base.">
      <template #actions>
        <ButtonsPrimary icon="i-heroicons-arrow-up-tray" label="Import" @click="navigateTo('/knowledge/import')" />
        <UButton v-if="entries.length > 0" icon="i-heroicons-trash" color="red" variant="soft" @click="showDeleteAll = true">Delete All</UButton>
      </template>
    </UiPageHeader>

    <ModalsConfirm
      v-model="showDeleteAll"
      title="Delete All Entries"
      :message="`Are you sure you want to delete all ${total} knowledge entries? This cannot be undone.`"
      confirm-label="Delete All"
      @confirm="deleteAll"
    />

    <!-- Filters -->
    <CardsFilter>
      <div class="relative">
        <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          v-model="search"
          placeholder="Search knowledge..."
          class="w-64 bg-white/5 text-sm text-zinc-300 placeholder-zinc-600 rounded-lg pl-9 pr-3 py-1.5 border border-white/5 focus:outline-none focus:border-white/10 transition-colors"
        />
      </div>
      <FiltersFilter v-model="filterCategory" :options="CATEGORY_OPTIONS" placeholder="All categories">
        <template #option="{ option, isActive }">
          <span class="flex items-center gap-2">
            <UIcon v-if="option.value" :name="categoryIcon(option.value)" :class="['w-3.5 h-3.5', categoryColor(option.value)]" />
            {{ option.label }}
          </span>
        </template>
      </FiltersFilter>
      <FiltersFilter v-model="filterConfidence" :options="CONFIDENCE_OPTIONS" placeholder="All confidence">
        <template #option="{ option, isActive }">
          <span class="flex items-center gap-2">
            <UIcon v-if="option.value" :name="confidenceIcon(option.value)" :class="['w-3.5 h-3.5', confidenceColor(option.value)]" />
            {{ option.label }}
          </span>
        </template>
      </FiltersFilter>
      <FiltersFilter v-model="filterReviewed" :options="REVIEWED_OPTIONS" placeholder="All entries" />
        <span class="ml-auto text-xs text-zinc-500">{{ total }} entries</span>
    </CardsFilter>

    <!-- Entry list -->
    <Cards :padding="false" v-if="entries.length > 0">
      <div class="divide-y divide-white/5">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="group px-5 py-4 flex items-start gap-4 cursor-pointer rounded-lg transition-colors hover:bg-white/5"
          @click="navigateTo(`/knowledge/${entry.id}`)"
        >
          <!-- Category icon -->
          <UIcon :name="categoryIcon(entry.category)" :class="['w-5 h-5 mt-0.5 shrink-0', categoryColor(entry.category)]" />

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-zinc-200 truncate">{{ entry.title }}</span>
              <UBadge :color="categoryBadgeColor(entry.category)" variant="subtle" size="xs">
                {{ categoryLabel(entry.category) }}
              </UBadge>
              <UBadge :color="confidenceBadgeColor(entry.confidence)" variant="subtle" size="xs">
                {{ confidenceLabel(entry.confidence) }}
              </UBadge>
              <span v-for="tag in (entry.tags ?? []).slice(0, 3)" :key="tag" class="text-xs text-zinc-600">#{{ tag }}</span>
              <span class="text-xs text-zinc-600 shrink-0">{{ formatDate(entry.createdAt) }}</span>
            </div>
            <p v-if="entry.content" class="text-sm text-zinc-500 truncate mt-0.5">{{ contentPreview(entry.content) }}</p>
          </div>

          <!-- Right: reviewed + chevron -->
          <div class="flex items-center gap-2 shrink-0">
            <UIcon
              :name="entry.isReviewed ? 'i-heroicons-check-circle-solid' : 'i-heroicons-clock'"
              :class="['w-4 h-4', entry.isReviewed ? 'text-emerald-400' : 'text-zinc-600']"
            />
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Cards>

    <!-- Empty state -->
    <Cards :padding="false" v-else-if="!pending">
      <div class="p-8 text-center flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-academic-cap" class="w-10 h-10 text-zinc-600 mb-3" />
        <p class="text-zinc-400 text-sm">No knowledge entries yet.</p>
        <ButtonsSecondary variant="ghost" label="Import from Claude" @click="navigateTo('/knowledge/import')" />
      </div>
    </Cards>

    <!-- Pagination -->
    <div v-if="total > limit" class="flex justify-center mt-6">
      <UPagination v-model="page" :page-count="limit" :total="total" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/composables/useFormatDate'
import { CATEGORY_OPTIONS, CONFIDENCE_OPTIONS, REVIEWED_OPTIONS } from '~/composables/useKnowledgeHelpers'

const { categoryIcon, categoryColor, categoryBadgeColor, categoryLabel, confidenceIcon, confidenceColor, confidenceBadgeColor, confidenceLabel } = useKnowledgeHelpers()

const search = ref('')
const filterCategory = ref('')
const filterConfidence = ref('')
const filterReviewed = ref('')

const page = ref(1)
const limit = 20

const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    limit,
    offset: (page.value - 1) * limit,
  }
  if (search.value) params.search = search.value
  if (filterCategory.value) params.category = filterCategory.value
  if (filterConfidence.value) params.confidence = filterConfidence.value
  if (filterReviewed.value) params.isReviewed = filterReviewed.value
  return params
})

const { data, pending } = await useFetch('/api/knowledge', {
  query: queryParams,
  watch: [queryParams],
})

const entries = computed(() => data.value?.entries ?? [])
const total = computed(() => data.value?.total ?? 0)

function contentPreview(content: string) {
  return content.replace(/\n/g, ' ').trim().slice(0, 120)
}

const showDeleteAll = ref(false)
const deleting = ref(false)
const toast = useToast()

async function deleteAll() {
  deleting.value = true
  try {
    await $fetch('/api/knowledge', { method: 'DELETE' })
    toast.add({ title: 'All entries deleted', color: 'green' })
    showDeleteAll.value = false
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to delete', color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>
