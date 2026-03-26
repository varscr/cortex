<template>
  <div>
    <UiPageHeader title="Finances" description="Track income, expenses, and monthly summaries">
      <template #actions>
        <ButtonsPrimary icon="i-heroicons-plus" size="sm" @click="showAccountModal = true">Account</ButtonsPrimary>
        <ButtonsPrimary to="/finances/import" icon="i-heroicons-arrow-up-tray" size="sm">Import</ButtonsPrimary>
      </template>
    </UiPageHeader>

    <!-- Account Cards -->
    <div v-if="accounts.length > 0" class="flex gap-4 mb-8 overflow-x-auto pb-2">
      <Cards v-for="acc in accounts" :key="acc.id" class="min-w-[220px] flex-shrink-0">
        <div class="flex items-center gap-3 mb-3">
          <UIcon :name="getAccountTypeIcon(acc.type)" :class="['w-5 h-5', getAccountTypeColor(acc.type)]" />
          <div>
            <p class="text-sm font-medium text-white">{{ acc.name }}</p>
            <p class="text-xs text-zinc-500">{{ getInstitutionLabel(acc.institution) }} <span v-if="acc.accountNumberLast4">· {{ acc.accountNumberLast4 }}</span></p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-zinc-500">{{ getAccountTypeLabel(acc.type) }}</span>
          <div class="flex gap-1">
            <button class="text-zinc-500 hover:text-white transition-colors" @click="editAccount(acc)">
              <UIcon name="i-heroicons-pencil" class="w-3.5 h-3.5" />
            </button>
            <button class="text-zinc-500 hover:text-red-400 transition-colors" @click="confirmDeleteAccount(acc)">
              <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Cards>
    </div>

    <!-- Empty state: no accounts -->
    <Cards v-if="accounts.length === 0" class="text-center mb-8">
      <UIcon name="i-heroicons-building-library" class="w-10 h-10 text-zinc-600 mx-auto mb-3" />
      <p class="text-zinc-400 text-sm mb-3">No accounts yet. Add your bank accounts to start tracking.</p>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" @click="showAccountModal = true">Add Account</ButtonsPrimary>
    </Cards>

    <!-- Stats Grid -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Cards>
        <p class="text-xs text-zinc-500 mb-1">Income</p>
        <p class="text-lg font-semibold text-emerald-400">{{ formatCOP(stats.totalIncome) }}</p>
      </Cards>
      <Cards>
        <p class="text-xs text-zinc-500 mb-1">Expenses</p>
        <p class="text-lg font-semibold text-red-400">{{ formatCOP(stats.totalExpenses) }}</p>
      </Cards>
      <Cards>
        <p class="text-xs text-zinc-500 mb-1">Net Flow</p>
        <p class="text-lg font-semibold" :class="stats.netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'">{{ formatCOP(stats.netFlow) }}</p>
      </Cards>
      <Cards>
        <p class="text-xs text-zinc-500 mb-1">Transactions</p>
        <p class="text-lg font-semibold text-white">{{ stats.transactionCount }}</p>
      </Cards>
    </div>

    <!-- Top Categories -->
    <div v-if="stats?.topCategories?.length" class="mb-8">
      <h3 class="text-sm font-medium text-zinc-400 mb-3">Top Spending Categories</h3>
      <Cards class="!p-0">
        <div class="divide-y divide-white/5">
          <div v-for="cat in stats.topCategories" :key="cat.category" class="flex items-center gap-3 px-4 py-3">
            <UIcon :name="getCategoryIcon(cat.category)" :class="['w-4 h-4', getCategoryColor(cat.category)]" />
            <span class="text-sm text-zinc-300 flex-1">{{ getCategoryLabel(cat.category) }}</span>
            <span class="text-xs text-zinc-500">{{ cat.count }} txns</span>
            <span class="text-sm font-medium text-red-400">{{ formatCOP(cat.total) }}</span>
          </div>
        </div>
      </Cards>
    </div>

    <!-- Recent Transactions -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-zinc-400">Recent Transactions</h3>
        <NuxtLink v-if="recentTransactions.length > 0" to="/finances/transactions" class="text-xs text-zinc-500 hover:text-white transition-colors">
          View all →
        </NuxtLink>
      </div>

      <Cards v-if="recentTransactions.length > 0" class="!p-0">
        <div class="divide-y divide-white/5">
          <div v-for="tx in recentTransactions" :key="tx.id" class="flex items-center gap-3 px-4 py-3 linear-hover">
            <UIcon :name="getCategoryIcon(tx.category)" :class="['w-4 h-4 shrink-0', getCategoryColor(tx.category)]" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-zinc-200 truncate">{{ tx.description }}</p>
              <p class="text-xs text-zinc-500">{{ formatDate(tx.date) }} · {{ tx.accountName }}</p>
            </div>
            <span v-if="tx.installmentCurrent && tx.installmentTotal" class="text-xs text-zinc-500">
              {{ tx.installmentCurrent }}/{{ tx.installmentTotal }}
            </span>
            <span class="text-sm font-medium tabular-nums" :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ formatCOP(tx.amount) }}
            </span>
          </div>
        </div>
      </Cards>

      <Cards v-else class="text-center">
        <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p class="text-zinc-400 text-sm">No transactions yet. <NuxtLink to="/finances/import" class="text-white underline underline-offset-2">Import a statement</NuxtLink> to get started.</p>
      </Cards>
    </div>

    <!-- Account Modal -->
    <UiFormModal
      v-model="showAccountModal"
      :title="editingAccount ? 'Edit Account' : 'Add Account'"
      :loading="savingAccount"
      @submit="saveAccount"
    >
      <div class="space-y-4">
        <div>
          <label class="text-xs text-zinc-400 mb-1 block">Name</label>
          <input v-model="accountForm.name" type="text" placeholder="e.g. Bancolombia Savings" class="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-zinc-400 mb-1 block">Institution</label>
            <select v-model="accountForm.institution" class="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-white/20">
              <option value="" disabled>Select</option>
              <option v-for="opt in INSTITUTION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-zinc-400 mb-1 block">Type</label>
            <select v-model="accountForm.type" class="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-white/20">
              <option value="" disabled>Select</option>
              <option v-for="opt in ACCOUNT_TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs text-zinc-400 mb-1 block">Last 4 digits (optional)</label>
          <input v-model="accountForm.accountNumberLast4" type="text" maxlength="4" placeholder="0147" class="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20" />
        </div>
      </div>
    </UiFormModal>

    <!-- Delete Confirmation -->
    <UiConfirmModal
      v-model="showDeleteModal"
      title="Delete Account"
      :message="`Delete '${deletingAccount?.name}'? This will also delete all statements and transactions for this account.`"
      confirm-label="Delete"
      confirm-color="red"
      @confirm="deleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/composables/useFormatDate'

const toast = useToast()
const {
  getCategoryIcon, getCategoryColor, getCategoryLabel,
  getAccountTypeIcon, getAccountTypeColor, getAccountTypeLabel,
  getInstitutionLabel,
} = useFinanceHelpers()

// Data
const { data: accountsData, refresh: refreshAccounts } = await useFetch('/api/finances/accounts')
const { data: statsData } = await useFetch('/api/finances/stats', { query: { months: 1 } })
const { data: txData } = await useFetch('/api/finances/transactions', { query: { limit: 10 } })

const accounts = computed(() => accountsData.value?.accounts ?? [])
const stats = computed(() => statsData.value)
const recentTransactions = computed(() => txData.value?.transactions ?? [])

// Account modal
const showAccountModal = ref(false)
const editingAccount = ref<any>(null)
const savingAccount = ref(false)
const accountForm = reactive({
  name: '',
  type: '',
  institution: '',
  accountNumberLast4: '',
})

function resetForm() {
  accountForm.name = ''
  accountForm.type = ''
  accountForm.institution = ''
  accountForm.accountNumberLast4 = ''
  editingAccount.value = null
}

function editAccount(acc: any) {
  editingAccount.value = acc
  accountForm.name = acc.name
  accountForm.type = acc.type
  accountForm.institution = acc.institution
  accountForm.accountNumberLast4 = acc.accountNumberLast4 || ''
  showAccountModal.value = true
}

watch(showAccountModal, (val) => {
  if (!val) resetForm()
})

async function saveAccount() {
  savingAccount.value = true
  try {
    if (editingAccount.value) {
      await $fetch(`/api/finances/accounts/${editingAccount.value.id}`, {
        method: 'PUT',
        body: accountForm,
      })
      toast.add({ title: 'Account updated', color: 'green' })
    } else {
      await $fetch('/api/finances/accounts', {
        method: 'POST',
        body: accountForm,
      })
      toast.add({ title: 'Account created', color: 'green' })
    }
    showAccountModal.value = false
    refreshAccounts()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save account', color: 'red' })
  } finally {
    savingAccount.value = false
  }
}

// Delete account
const showDeleteModal = ref(false)
const deletingAccount = ref<any>(null)

function confirmDeleteAccount(acc: any) {
  deletingAccount.value = acc
  showDeleteModal.value = true
}

async function deleteAccount() {
  if (!deletingAccount.value) return
  try {
    await $fetch(`/api/finances/accounts/${deletingAccount.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Account deleted', color: 'green' })
    refreshAccounts()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to delete account', color: 'red' })
  }
}
</script>
