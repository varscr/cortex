<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton to="/finances" icon="i-heroicons-arrow-left" variant="ghost" color="gray" />
      <h2 class="text-2xl font-bold text-white">Import Statement</h2>
    </div>

    <!-- Upload Zone -->
    <Cards class="mb-8">
      <!-- Account selector -->
      <div class="mb-4">
        <label class="text-xs text-zinc-400 mb-1 block">Account</label>
        <select v-model="selectedAccountId" class="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-white/20">
          <option value="" disabled>Select an account</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name }} ({{ acc.institution }})
          </option>
        </select>
        <p v-if="accounts.length === 0" class="text-xs text-amber-400 mt-1">
          No accounts found. <NuxtLink to="/finances" class="underline">Create one first</NuxtLink>.
        </p>
      </div>

      <!-- Drop zone -->
      <div
        class="border-2 border-dashed rounded-xl p-10 text-center transition-colors"
        :class="dragging ? 'border-white/20 bg-white/5' : 'border-white/5'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="handleDrop"
      >
        <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 text-zinc-500 mx-auto mb-3" />
        <p class="text-zinc-300 text-sm mb-1">
          Drag & drop a bank statement, or
          <button class="text-white underline underline-offset-2" @click="fileInput?.click()">browse</button>
        </p>
        <p class="text-zinc-600 text-xs">Accepts .pdf files (NU or Bancolombia statements)</p>
        <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileSelect" />
      </div>

      <!-- Selected file -->
      <div v-if="selectedFile" class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-zinc-400" />
          <div>
            <p class="text-sm text-zinc-200">{{ selectedFile.name }}</p>
            <p class="text-xs text-zinc-500">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <ButtonsSecondary size="sm" @click="clearFile">Clear</ButtonsSecondary>
          <ButtonsPrimary icon="i-heroicons-arrow-up-tray" size="sm" :loading="uploading" :disabled="!selectedAccountId || hasActiveRun" @click="startUpload">
            {{ hasActiveRun ? 'Processing...' : 'Upload & Process' }}
          </ButtonsPrimary>
        </div>
      </div>

      <!-- Error -->
      <div v-if="uploadError" class="mt-4 text-sm text-red-400 flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0" />
        {{ uploadError }}
      </div>
    </Cards>

    <!-- Import History -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">Import History</h3>
      <span class="text-xs text-zinc-500">{{ statementsTotal }} statements</span>
    </div>

    <Cards v-if="statements.length > 0" class="!p-0">
      <div class="divide-y divide-white/5">
        <div v-for="stmt in statements" :key="stmt.id" class="px-5 py-4">
          <div class="flex items-center gap-4">
            <UIcon
              :name="statusIcon(stmt.status)"
              :class="['w-5 h-5 shrink-0', statusColor(stmt.status), stmt.status === 'processing' ? 'animate-spin' : '']"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm text-zinc-200">{{ stmt.fileName }}</span>
                <UBadge :color="statusBadgeColor(stmt.status)" variant="subtle" size="xs">{{ stmt.status }}</UBadge>
                <span class="text-xs text-zinc-600">{{ stmt.accountName }}</span>
              </div>
              <div class="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                <span v-if="stmt.periodStart && stmt.periodEnd">{{ stmt.periodStart }} to {{ stmt.periodEnd }}</span>
                <span v-if="stmt.metadata?.transactionsSaved">{{ stmt.metadata.transactionsSaved }} transactions saved</span>
                <span v-if="stmt.metadata?.duplicatesSkipped" class="text-amber-400">{{ stmt.metadata.duplicatesSkipped }} duplicates</span>
              </div>
            </div>
            <div v-if="stmt.errorMessage" class="text-xs text-red-400 max-w-[200px] truncate" :title="stmt.errorMessage">
              {{ stmt.errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </Cards>

    <Cards v-else class="text-center">
      <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-zinc-600 mx-auto mb-3" />
      <p class="text-zinc-400 text-sm">No imports yet.</p>
    </Cards>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()

// Accounts
const { data: accountsData } = await useFetch('/api/finances/accounts')
const accounts = computed(() => accountsData.value?.accounts ?? [])
const selectedAccountId = ref('')

// File upload
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploadError = ref('')
const dragging = ref(false)
const uploading = ref(false)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) selectFile(file)
}

function handleDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) selectFile(file)
}

function selectFile(file: File) {
  uploadError.value = ''
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    uploadError.value = 'Only .pdf files are supported.'
    return
  }
  selectedFile.value = file
}

function clearFile() {
  selectedFile.value = null
  uploadError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function startUpload() {
  if (!selectedFile.value || !selectedAccountId.value) return

  uploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('accountId', selectedAccountId.value)

    await $fetch('/api/finances/statements/upload', {
      method: 'POST',
      body: formData,
    })

    toast.add({ title: 'Statement uploaded, processing started', color: 'green' })
    clearFile()
    refreshStatements()
    startPolling()
  } catch (e: any) {
    uploadError.value = e.data?.statusMessage || 'Upload failed'
    toast.add({ title: uploadError.value, color: 'red' })
  } finally {
    uploading.value = false
  }
}

// Statements list
const { data: statementsData, refresh: refreshStatements } = await useFetch('/api/finances/statements', {
  query: { limit: 20 },
})

const statements = computed(() => statementsData.value?.statements ?? [])
const statementsTotal = computed(() => statementsData.value?.total ?? 0)

const hasActiveRun = computed(() => statements.value.some((s: any) => s.status === 'processing'))

// Poll while processing
let pollInterval: ReturnType<typeof setInterval> | null = null

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(() => {
    refreshStatements()
    if (!hasActiveRun.value) stopPolling()
  }, 3000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onMounted(() => {
  if (hasActiveRun.value) startPolling()
})

onUnmounted(() => stopPolling())

// Status helpers
function statusIcon(status: string) {
  switch (status) {
    case 'processing': return 'i-heroicons-arrow-path'
    case 'completed': return 'i-heroicons-check-circle-solid'
    case 'error': return 'i-heroicons-exclamation-circle-solid'
    default: return 'i-heroicons-clock'
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'processing': return 'text-blue-400'
    case 'completed': return 'text-emerald-400'
    case 'error': return 'text-red-400'
    default: return 'text-zinc-500'
  }
}

function statusBadgeColor(status: string) {
  switch (status) {
    case 'processing': return 'blue'
    case 'completed': return 'green'
    case 'error': return 'red'
    default: return 'gray'
  }
}
</script>
