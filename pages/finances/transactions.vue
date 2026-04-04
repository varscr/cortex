<template>
  <div>
    <UiPageHeader title="Transactions" description="All transactions across your accounts">
      <template #actions>
        <ButtonsPrimary to="/finances/import" icon="i-heroicons-arrow-up-tray" size="sm">Import</ButtonsPrimary>
      </template>
    </UiPageHeader>

    <!-- Filters -->
    <Cards class="mb-6">
      <div class="flex flex-wrap gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Search transactions..."
          class="flex-1 min-w-[200px] px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
        />
        <FiltersFilter v-model="filterAccount" :options="accountFilterOptions" placeholder="All accounts" />
        <FiltersFilter v-model="filterType" :options="typeFilterOptions" placeholder="All types" />
        <FiltersFilter v-model="filterCategory" :options="categoryFilterOptions" placeholder="All categories" />
        <input
          v-model="dateFrom"
          type="date"
          class="px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-white/20"
        />
        <input
          v-model="dateTo"
          type="date"
          class="px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-white/20"
        />
      </div>
      <p class="text-xs text-zinc-500 mt-2">{{ total }} transactions</p>
    </Cards>

    <!-- Transaction List -->
    <Cards v-if="transactions.length > 0" class="!p-0 mb-6">
      <div class="divide-y divide-white/5">
        <div v-for="tx in transactions" :key="tx.id" class="flex items-center gap-3 px-4 py-3 linear-hover">
          <UIcon :name="getCategoryIcon(tx.category)" :class="['w-4 h-4 shrink-0', getCategoryColor(tx.category)]" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-zinc-200 truncate">{{ tx.description }}</p>
            <p class="text-xs text-zinc-500">{{ formatDate(tx.date) }} · {{ tx.accountName }}</p>
          </div>

          <!-- Inline category selector -->
          <select
            :value="tx.category"
            class="px-2 py-1 bg-zinc-800 border border-white/5 rounded text-xs text-zinc-400 focus:outline-none focus:border-white/20 cursor-pointer"
            @change="updateCategory(tx.id, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="cat in FINANCE_CATEGORY_OPTIONS" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>

          <span v-if="tx.installmentCurrent && tx.installmentTotal" class="text-xs text-zinc-500 whitespace-nowrap">
            {{ tx.installmentCurrent }}/{{ tx.installmentTotal }}
          </span>
          <span class="text-sm font-medium tabular-nums whitespace-nowrap" :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'">
            {{ formatCOP(tx.amount) }}
          </span>
        </div>
      </div>
    </Cards>

    <!-- Empty state -->
    <Cards v-else class="text-center mb-6">
      <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-zinc-600 mx-auto mb-3" />
      <p class="text-zinc-400 text-sm">No transactions found. <NuxtLink to="/finances/import" class="text-white underline underline-offset-2">Import a statement</NuxtLink> to get started.</p>
    </Cards>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model="page" :page-count="limit" :total="total" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/composables/useFormatDate'

const toast = useToast()
const { getCategoryIcon, getCategoryColor } = useFinanceHelpers()

// Filters
const search = ref('')
const filterAccount = ref('')
const filterType = ref('')
const filterCategory = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const limit = 20

// Filter options
const { data: accountsData } = await useFetch('/api/finances/accounts')
const accountFilterOptions = computed(() => [
  { value: '', label: 'All accounts' },
  ...(accountsData.value?.accounts ?? []).map((a: any) => ({ value: String(a.id), label: a.name })),
])
const typeFilterOptions = [
  { value: '', label: 'All types' },
  ...FINANCE_TRANSACTION_TYPE_OPTIONS,
]
const categoryFilterOptions = [
  { value: '', label: 'All categories' },
  ...FINANCE_CATEGORY_OPTIONS,
]

// Query params
const queryParams = computed(() => ({
  limit,
  offset: (page.value - 1) * limit,
  ...(search.value && { search: search.value }),
  ...(filterAccount.value && { accountId: filterAccount.value }),
  ...(filterType.value && { type: filterType.value }),
  ...(filterCategory.value && { category: filterCategory.value }),
  ...(dateFrom.value && { dateFrom: dateFrom.value }),
  ...(dateTo.value && { dateTo: dateTo.value }),
}))

// Reset page on filter change
watch([search, filterAccount, filterType, filterCategory, dateFrom, dateTo], () => {
  page.value = 1
})

// Data
const { data, refresh } = await useFetch('/api/finances/transactions', {
  query: queryParams,
  watch: [queryParams],
})

const transactions = computed(() => data.value?.transactions ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / limit))

// Inline category update
async function updateCategory(txId: number, category: string) {
  try {
    await $fetch(`/api/finances/transactions/${txId}`, {
      method: 'PUT',
      body: { category },
    })
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to update category', color: 'red' })
  }
}
</script>
