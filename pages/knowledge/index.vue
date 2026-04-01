<template>
  <div>
    <UiPageHeader title="Knowledge" description="Your personal knowledge base.">
      <template #actions>
        <div v-if="selectedIds.size > 0" class="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
          <span class="text-sm text-zinc-400 font-medium">{{ selectedIds.size }} selected</span>
          <UButton icon="i-heroicons-check-circle" color="green" variant="soft" @click="bulkUpdateReviewed(true)" :loading="bulkUpdating">Reviewed</UButton>
          <UButton icon="i-heroicons-clock" color="gray" variant="soft" @click="bulkUpdateReviewed(false)" :loading="bulkUpdating">Unreviewed</UButton>
          <UButton icon="i-heroicons-trash" color="red" variant="soft" @click="showBulkDelete = true" :loading="bulkDeleting">Delete</UButton>
        </div>
        <ButtonsPrimary icon="i-heroicons-arrow-up-tray" label="Import" @click="navigateTo('/knowledge/import')" />
        <UButton v-if="entries.length > 0 && selectedIds.size === 0" icon="i-heroicons-trash" color="red" variant="soft" @click="showDeleteAll = true">Delete All</UButton>
      </template>
    </UiPageHeader>

    <ModalsConfirm
      v-model="showDeleteAll"
      title="Delete All Entries"
      :message="`Are you sure you want to delete all ${total} knowledge entries? This cannot be undone.`"
      confirm-label="Delete All"
      @confirm="deleteAll"
    />

    <ModalsConfirm
      v-model="showBulkDelete"
      title="Delete Selected Entries"
      :message="`Are you sure you want to delete the ${selectedIds.size} selected entries? This cannot be undone.`"
      confirm-label="Delete Selected"
      @confirm="bulkDelete"
    />

    <!-- Filters -->
    <CardsFilter>
      <div class="flex items-center gap-3 pr-4 border-r border-white/10">
        <UCheckbox :model-value="isAllSelected" :indeterminate="isIndeterminate" @update:model-value="toggleAll" />
      </div>

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
          <!-- Selection Checkbox -->
          <div class="mt-0.5 shrink-0" @click.stop>
            <UCheckbox :model-value="selectedIds.has(entry.id)" @update:model-value="toggleSelection(entry.id)" />
          </div>

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

          <!-- Right: reviewed toggle + chevron -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click.stop="toggleReviewed(entry)"
              class="p-1 rounded hover:bg-white/10 transition-colors group/btn"
              title="Toggle review status"
            >
              <UIcon
                :name="entry.isReviewed ? 'i-heroicons-check-circle-solid' : 'i-heroicons-clock'"
                :class="['w-4 h-4 transition-colors', entry.isReviewed ? 'text-emerald-400 group-hover/btn:text-emerald-300' : 'text-zinc-600 group-hover/btn:text-zinc-400']"
              />
            </button>
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

const { data, pending, refresh } = await useFetch('/api/knowledge', {
  query: queryParams,
  watch: [queryParams],
})

const entries = computed(() => data.value?.entries ?? [])
const total = computed(() => data.value?.total ?? 0)

function contentPreview(content: string) {
  return content.replace(/\n/g, ' ').trim().slice(0, 120)
}

// -- Selection & Bulk Actions --
const selectedIds = ref(new Set<number>())

watch(entries, () => {
  // Clear selection when changing pages or filters, or just leave it.
  // We'll clear it for simplicity.
  selectedIds.value.clear()
})

const isAllSelected = computed(() => {
  if (entries.value.length === 0) return false
  return entries.value.every(e => selectedIds.value.has(e.id))
})

const isIndeterminate = computed(() => {
  return selectedIds.value.size > 0 && !isAllSelected.value
})

function toggleSelection(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleAll(value: boolean) {
  if (value) {
    const next = new Set(selectedIds.value)
    entries.value.forEach(e => next.add(e.id))
    selectedIds.value = next
  } else {
    selectedIds.value.clear()
  }
}

const bulkUpdating = ref(false)
const bulkDeleting = ref(false)
const showBulkDelete = ref(false)

async function bulkUpdateReviewed(isReviewed: boolean) {
  if (selectedIds.value.size === 0) return
  bulkUpdating.value = true
  try {
    await $fetch('/api/knowledge', {
      method: 'PUT',
      body: {
        ids: Array.from(selectedIds.value),
        isReviewed
      }
    })
    toast.add({ title: `Marked ${selectedIds.value.size} items as ${isReviewed ? 'reviewed' : 'unreviewed'}`, color: 'green' })
    refresh()
    selectedIds.value.clear()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to update items', color: 'red' })
  } finally {
    bulkUpdating.value = false
  }
}

async function bulkDelete() {
  if (selectedIds.value.size === 0) return
  bulkDeleting.value = true
  try {
    await $fetch('/api/knowledge', {
      method: 'DELETE',
      body: {
        ids: Array.from(selectedIds.value)
      }
    })
    toast.add({ title: `Deleted ${selectedIds.value.size} items`, color: 'green' })
    refresh()
    selectedIds.value.clear()
    showBulkDelete.value = false
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to delete items', color: 'red' })
  } finally {
    bulkDeleting.value = false
  }
}

// -- Quick Actions --
async function toggleReviewed(entry: any) {
  // Optimistic UI update
  const originalState = entry.isReviewed
  entry.isReviewed = !originalState

  try {
    await $fetch(`/api/knowledge/${entry.id}`, {
      method: 'PUT',
      body: {
        ...entry,
        isReviewed: entry.isReviewed
      }
    })
    toast.add({ title: entry.isReviewed ? 'Marked as reviewed' : 'Marked as unreviewed', color: 'green' })
  } catch (e: any) {
    // Revert on error
    entry.isReviewed = originalState
    toast.add({ title: 'Failed to update review status', color: 'red' })
  }
}

// -- Delete All --
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