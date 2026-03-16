<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton to="/knowledge" icon="i-heroicons-arrow-left" variant="ghost" color="gray" />
      <h2 class="text-2xl font-bold text-white">Import Knowledge</h2>
    </div>

    <!-- Upload Zone -->
    <UiCard class="mb-8">
      <div
        class="border-2 border-dashed rounded-xl p-10 text-center transition-colors"
        :class="dragging ? 'border-white/20 bg-white/5' : 'border-white/5'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="handleDrop"
      >
        <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 text-zinc-500 mx-auto mb-3" />
        <p class="text-zinc-300 text-sm mb-1">
          Drag & drop a Claude export file, or
          <button class="text-white underline underline-offset-2" @click="fileInput?.click()">browse</button>
        </p>
        <p class="text-zinc-600 text-xs">Accepts .json files (Claude.ai conversation exports)</p>
        <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleFileSelect" />
      </div>

      <!-- Selected file -->
      <div v-if="selectedFile" class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-zinc-400" />
          <div>
            <p class="text-sm text-zinc-200">{{ selectedFile.name }}</p>
            <p class="text-xs text-zinc-500">{{ formatFileSize(selectedFile.size) }} · {{ conversationCount }} conversations found</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="ghost" size="sm" @click="clearFile">Clear</UiButton>
          <UiButton icon="i-heroicons-arrow-up-tray" size="sm" :loading="importing" :disabled="hasActiveRun" @click="startImport">
            {{ hasActiveRun ? 'Import running...' : 'Import' }}
          </UiButton>
        </div>
      </div>

      <!-- Parse error -->
      <div v-if="parseError" class="mt-4 text-sm text-red-400 flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0" />
        {{ parseError }}
      </div>
    </UiCard>

    <!-- Active & Past Imports -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">Import History</h3>
      <span class="text-xs text-zinc-500">{{ runsTotal }} runs</span>
    </div>

    <UiCard v-if="runs.length > 0" class="!p-0">
      <div class="divide-y divide-white/5">
        <div v-for="run in runs" :key="run.id" class="px-5 py-4">
          <div class="flex items-center gap-4">
            <!-- Status icon -->
            <UIcon
              :name="statusIcon(run.status)"
              :class="['w-5 h-5 shrink-0', statusColor(run.status), run.status === 'running' ? 'animate-spin' : '']"
            />

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm text-zinc-200">{{ run.agentName }}</span>
                <UBadge :color="statusBadgeColor(run.status)" variant="subtle" size="xs">{{ run.status }}</UBadge>
                <span class="text-xs text-zinc-600">{{ formatDate(run.startedAt) }}</span>
              </div>

              <!-- Progress -->
              <div class="mt-1.5 flex items-center gap-3">
                <div class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-xs">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="run.itemsFailed > 0 && run.itemsProcessed === 0 ? 'bg-red-500' : 'bg-emerald-500'"
                    :style="{ width: progressPercent(run) + '%' }"
                  />
                </div>
                <span class="text-xs text-zinc-500">
                  {{ run.itemsProcessed }}/{{ run.itemsTotal }} conversations
                  <span v-if="run.itemsFailed > 0" class="text-red-400">({{ run.itemsFailed }} failed)</span>
                </span>
                <span v-if="run.metadata?.totalEntriesSaved" class="text-xs text-emerald-400">
                  {{ run.metadata.totalEntriesSaved }} entries saved
                </span>
                <span v-if="run.metadata?.totalDuplicatesSkipped" class="text-xs text-amber-400">
                  {{ run.metadata.totalDuplicatesSkipped }} duplicates skipped
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <button
                v-if="run.metadata?.logs?.length || run.errorMessage || run.metadata?.errors?.length"
                class="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                @click="toggleLogs(run.id)"
              >
                <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
                {{ expandedRun === run.id ? 'Hide' : 'Logs' }}
              </button>
              <button
                v-if="run.status === 'running'"
                class="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                @click="markFailed(run.id)"
              >
                <UIcon name="i-heroicons-x-circle" class="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>

          <!-- Logs (expandable) -->
          <div v-if="expandedRun === run.id" class="mt-3 ml-9 space-y-2">
            <!-- Fatal error -->
            <div v-if="run.errorMessage" class="text-sm text-red-400 bg-red-950/30 rounded-lg px-3 py-2">
              {{ run.errorMessage }}
            </div>
            <!-- Processing logs -->
            <div v-if="run.metadata?.logs?.length" class="bg-zinc-900/50 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <div
                v-for="(log, i) in run.metadata.logs.slice(-(showAllLogs === run.id ? 999 : 10))"
                :key="i"
                class="px-3 py-1.5 text-xs border-b border-white/5 last:border-0 flex items-center gap-2"
              >
                <UIcon
                  :name="logIcon(run.status === 'running' ? log.status : (log.status === 'processing' ? 'failed' : log.status))"
                  :class="['w-3 h-3 shrink-0', logColor(run.status === 'running' ? log.status : (log.status === 'processing' ? 'failed' : log.status))]"
                />
                <span class="text-zinc-300 truncate flex-1">{{ log.conversation }}</span>
                <span v-if="log.entries" class="text-emerald-400">+{{ log.entries }}</span>
                <span v-if="log.duplicates" class="text-amber-400">{{ log.duplicates }} dup</span>
                <span v-if="log.error" class="text-red-400 truncate max-w-[200px]" :title="log.error">{{ log.error }}</span>
              </div>
              <button
                v-if="run.metadata.logs.length > 10 && showAllLogs !== run.id"
                class="w-full px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
                @click="showAllLogs = run.id"
              >
                Show all {{ run.metadata.logs.length }} entries
              </button>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard v-else class="!p-0">
      <div class="p-8 text-center">
        <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p class="text-zinc-400 text-sm">No imports yet.</p>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/composables/useFormatDate'

const toast = useToast()

// File upload
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const parsedConversations = ref<any[] | null>(null)
const parseError = ref('')
const dragging = ref(false)
const importing = ref(false)

const conversationCount = computed(() => parsedConversations.value?.length ?? 0)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function processFile(file: File) {
  parseError.value = ''
  parsedConversations.value = null

  if (!file.name.endsWith('.json')) {
    parseError.value = 'Only .json files are supported.'
    return
  }

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // Handle both array of conversations and single conversation
    const conversations = Array.isArray(data) ? data : [data]

    // Validate structure
    const valid = conversations.filter(
      (c: any) => c && typeof c === 'object' && c.uuid && c.name && Array.isArray(c.chat_messages)
    )

    if (valid.length === 0) {
      parseError.value = 'No valid conversations found. Expected Claude.ai export format with uuid, name, and chat_messages.'
      return
    }

    selectedFile.value = file
    parsedConversations.value = valid
  } catch {
    parseError.value = 'Failed to parse JSON file.'
  }
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function handleDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processFile(file)
}

function clearFile() {
  selectedFile.value = null
  parsedConversations.value = null
  parseError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function startImport() {
  if (!parsedConversations.value) return

  importing.value = true
  try {
    const result = await $fetch('/api/agents/ingest', {
      method: 'POST',
      body: parsedConversations.value,
    })
    toast.add({ title: `Import started (${conversationCount.value} conversations)`, color: 'green' })
    clearFile()
    refreshRuns()
    // Start polling for updates
    startPolling()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to start import', color: 'red' })
  } finally {
    importing.value = false
  }
}

// Import history
const { data: runsData, refresh: refreshRuns } = await useFetch('/api/agents/runs', {
  query: { agentName: 'knowledge-ingest', limit: 20 },
})

const runs = computed(() => runsData.value?.runs ?? [])
const runsTotal = computed(() => runsData.value?.total ?? 0)

const hasActiveRun = computed(() => runs.value.some((r: any) => r.status === 'running'))

// Poll while there are active runs
let pollInterval: ReturnType<typeof setInterval> | null = null

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(() => {
    refreshRuns()
    if (!hasActiveRun.value) stopPolling()
  }, 3000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// Start polling if there's an active run on mount (client-only)
onMounted(() => {
  if (hasActiveRun.value) startPolling()
})

onUnmounted(() => stopPolling())

// Logs display
const expandedRun = ref<number | null>(null)
const showAllLogs = ref<number | null>(null)

function toggleLogs(runId: number) {
  if (expandedRun.value === runId) {
    expandedRun.value = null
    showAllLogs.value = null
  } else {
    expandedRun.value = runId
  }
}

async function markFailed(runId: number) {
  try {
    await $fetch(`/api/agents/runs/${runId}`, {
      method: 'PUT',
      body: { status: 'error', errorMessage: 'Cancelled by user' },
    })
    refreshRuns()
  } catch (e: any) {
    toast.add({ title: 'Failed to cancel run', color: 'red' })
  }
}

// Status helpers
function statusIcon(status: string) {
  switch (status) {
    case 'running': return 'i-heroicons-arrow-path'
    case 'completed': return 'i-heroicons-check-circle-solid'
    case 'error': return 'i-heroicons-exclamation-circle-solid'
    default: return 'i-heroicons-clock'
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'running': return 'text-blue-400'
    case 'completed': return 'text-emerald-400'
    case 'error': return 'text-red-400'
    default: return 'text-zinc-500'
  }
}

function statusBadgeColor(status: string) {
  switch (status) {
    case 'running': return 'blue'
    case 'completed': return 'green'
    case 'error': return 'red'
    default: return 'gray'
  }
}

function logIcon(status: string) {
  switch (status) {
    case 'processing': return 'i-heroicons-arrow-path'
    case 'done': return 'i-heroicons-check'
    case 'skipped': return 'i-heroicons-forward'
    case 'failed': return 'i-heroicons-x-mark'
    default: return 'i-heroicons-minus'
  }
}

function logColor(status: string) {
  switch (status) {
    case 'processing': return 'text-blue-400'
    case 'done': return 'text-emerald-400'
    case 'skipped': return 'text-zinc-500'
    case 'failed': return 'text-red-400'
    default: return 'text-zinc-500'
  }
}

function progressPercent(run: any) {
  if (!run.itemsTotal) return 0
  return Math.round((run.itemsProcessed / run.itemsTotal) * 100)
}
</script>
