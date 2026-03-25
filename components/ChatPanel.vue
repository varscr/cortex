<template>
  <!-- Panel — participates in flex layout, shrinks main content -->
  <div
    class="h-full flex-shrink-0 flex flex-col border-l border-white/5 bg-zinc-950/98 backdrop-blur-md transition-all duration-300 overflow-hidden"
    :style="{ width: isOpen ? width + 'px' : '0px' }"
  >
    <!-- Resize handle (left edge) -->
    <div
      class="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-white/10 active:bg-white/20 transition-colors z-10"
      @mousedown="startResize"
    />

    <!-- Header -->
    <div class="h-16 flex items-center gap-2 px-4 border-b border-white/5 flex-shrink-0">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-zinc-300 truncate">
          {{ view === 'history' ? 'Conversations' : (sessionDetail?.title ?? 'New Chat') }}
        </p>
        <div class="flex items-center gap-1 mt-0.5">
          <UIcon name="i-heroicons-cpu-chip" class="w-3 h-3 text-zinc-600" />
          <select
            v-model="activeModel"
            :disabled="!!activeSessionId"
            class="bg-transparent text-xs text-zinc-500 focus:outline-none cursor-pointer disabled:cursor-default appearance-none"
            :title="activeSessionId ? 'Model locked for this session' : 'Model for next chat'"
          >
            <option
              v-for="m in currentModels"
              :key="m.id"
              :value="m.id"
              class="bg-zinc-900 text-zinc-300"
            >{{ providerName }} · {{ m.name }}</option>
          </select>
          <UIcon v-if="!activeSessionId" name="i-heroicons-chevron-down" class="w-3 h-3 text-zinc-600 pointer-events-none" />
        </div>
      </div>

      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          :class="view === 'history' ? 'text-zinc-300 bg-white/5' : ''"
          :title="view === 'history' ? 'Back to chat' : 'Conversations'"
          @click="toggleView"
        >
          <UIcon name="i-heroicons-clock" class="w-4 h-4" />
        </button>

        <button
          class="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          title="New chat"
          @click="newChat"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
        </button>

        <button
          class="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          title="Close"
          @click="toggle"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- History view -->
    <div v-if="view === 'history'" class="flex-1 overflow-y-auto">
      <div v-if="!sessions?.length" class="flex flex-col items-center justify-center h-full text-zinc-600 text-sm gap-2">
        <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-8 h-8" />
        <p>No conversations yet</p>
      </div>
      <div v-else class="py-2">
        <button
          v-for="s in sessions"
          :key="s.id"
          class="w-full text-left px-4 py-3 group flex items-center gap-3 hover:bg-white/5 transition-colors"
          :class="activeSessionId === s.id ? 'bg-white/5' : ''"
          @click="selectSession(s.id)"
        >
          <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-zinc-600 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-zinc-300 truncate">{{ s.title ?? 'New conversation' }}</p>
            <p class="text-xs text-zinc-600 mt-0.5">
              {{ modelShortLabel(s.modelProvider, s.modelName) }} · {{ formatDate(s.createdAt) }}
            </p>
          </div>
          <button
            class="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-red-400 transition-all"
            @click.stop="deleteSession(s.id)"
          >
            <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
          </button>
        </button>
      </div>
    </div>

    <!-- Chat view -->
    <template v-else>
      <!-- Empty state -->
      <div v-if="!activeSessionId" class="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
        <UIcon name="i-heroicons-chat-bubble-left-right" class="w-10 h-10 text-zinc-700" />
        <div>
          <p class="text-sm text-zinc-400 font-medium mb-1">Ask anything</p>
          <p class="text-xs text-zinc-600">Searches your log, knowledge, and profile automatically.</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-zinc-300 transition-colors"
          @click="newChat"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          Start conversation
        </button>
      </div>

      <!-- Messages -->
      <div v-else ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
        >
          <div :class="msg.role === 'user' ? 'max-w-[85%]' : 'w-full'">
            <div
              :class="[
                'rounded-xl px-3 py-2.5 text-sm whitespace-pre-wrap leading-relaxed',
                msg.role === 'user' ? 'bg-zinc-700 text-zinc-200' : 'linear-panel text-zinc-300',
              ]"
            >{{ msg.content }}</div>

            <div v-if="msg.role === 'assistant' && msg.sources?.length" class="mt-1">
              <button
                class="text-xs text-zinc-700 hover:text-zinc-500 flex items-center gap-1 transition-colors"
                @click="toggleSources(msg.id)"
              >
                <UIcon
                  :name="expandedSources.has(msg.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="w-3 h-3"
                />
                {{ msg.sources.length }} source{{ msg.sources.length !== 1 ? 's' : '' }}
              </button>
              <div v-if="expandedSources.has(msg.id)" class="mt-1 space-y-1">
                <div
                  v-for="src in msg.sources"
                  :key="src.source"
                  class="text-xs linear-panel rounded px-2 py-1 flex items-center gap-2"
                >
                  <span class="text-zinc-600">{{ src.sourceType }}</span>
                  <span class="text-zinc-500 truncate flex-1">{{ src.title }}</span>
                  <span class="text-zinc-700 flex-shrink-0">{{ (src.similarity * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="sending" class="flex justify-start">
          <div class="linear-panel rounded-xl px-3 py-2.5 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <span class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="px-3 py-3 border-t border-white/5 flex-shrink-0">
        <div class="flex items-end gap-2 linear-panel rounded-xl px-3 py-2">
          <textarea
            ref="inputEl"
            v-model="inputText"
            placeholder="Ask anything..."
            rows="1"
            class="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none max-h-28 overflow-y-auto"
            :disabled="sending"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          />
          <button
            :disabled="!inputText.trim() || sending"
            class="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            @click="sendMessage"
          >
            <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 text-zinc-300" />
          </button>
        </div>
        <p class="text-xs text-zinc-700 mt-1 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const SESSION_KEY = 'cortex_chat_session_id'
const MODEL_KEY = 'cortex_chat_model'

const { isOpen, width, toggle, initWidth, saveWidth } = useChatPanel()

// ── State ─────────────────────────────────────────────────────────────────────

const view = ref<'chat' | 'history'>('chat')
const activeSessionId = ref<number | null>(null)
const pendingModel = ref('claude-sonnet-4-6')
const inputText = ref('')
const sending = ref(false)
const expandedSources = ref(new Set<number>())
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

const toast = useToast()

// ── Providers ─────────────────────────────────────────────────────────────────

const { data: providers } = useFetch<LlmProviderOption[]>('/api/chat/providers')

const currentModels = computed(() =>
  providers.value?.find(p => p.id === 'claude-code')?.models ?? []
)
const providerName = computed(() =>
  providers.value?.find(p => p.id === (sessionDetail.value?.modelProvider ?? 'claude-code'))?.name ?? 'Claude CLI'
)

const activeModel = computed({
  get: () => sessionDetail.value?.modelName ?? pendingModel.value,
  set: (v: string) => {
    pendingModel.value = v
    localStorage.setItem(MODEL_KEY, v)
  },
})

// ── Session detail ─────────────────────────────────────────────────────────────

const { data: sessionDetail, refresh: refreshSession } = useFetch<ChatSessionDetail>(
  () => activeSessionId.value ? `/api/chat/sessions/${activeSessionId.value}` : null,
  { watch: [activeSessionId] },
)

const messages = computed(() => sessionDetail.value?.messages ?? [])

// ── History ───────────────────────────────────────────────────────────────────

const { data: sessions, refresh: refreshSessions } = useFetch<ChatSession[]>('/api/chat/sessions', {
  immediate: false,
})

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  initWidth()

  const storedId = localStorage.getItem(SESSION_KEY)
  if (storedId) activeSessionId.value = parseInt(storedId)

  const storedModel = localStorage.getItem(MODEL_KEY)
  if (storedModel) pendingModel.value = storedModel
})

// ── Resize ────────────────────────────────────────────────────────────────────

function startResize(e: MouseEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = width.value

  // Disable transition while dragging for immediate feedback
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'

  function onMove(e: MouseEvent) {
    // Dragging left = panel gets wider (startX - currentX is positive when moving left)
    const next = Math.max(280, Math.min(640, startWidth + (startX - e.clientX)))
    width.value = next
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    saveWidth()
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ── Actions ───────────────────────────────────────────────────────────────────

function toggleView() {
  view.value = view.value === 'history' ? 'chat' : 'history'
  if (view.value === 'history') refreshSessions()
}

async function newChat() {
  const session = await $fetch<ChatSession>('/api/chat/sessions', {
    method: 'POST',
    body: { provider: 'claude-code', model: pendingModel.value },
  })
  activeSessionId.value = session.id
  localStorage.setItem(SESSION_KEY, String(session.id))
  view.value = 'chat'
  await refreshSession()
  nextTick(() => inputEl.value?.focus())
}

async function selectSession(id: number) {
  activeSessionId.value = id
  localStorage.setItem(SESSION_KEY, String(id))
  view.value = 'chat'
  scrollToBottom()
}

async function deleteSession(id: number) {
  await $fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
  if (activeSessionId.value === id) {
    activeSessionId.value = null
    localStorage.removeItem(SESSION_KEY)
  }
  await refreshSessions()
}

async function sendMessage() {
  const content = inputText.value.trim()
  if (!content || sending.value) return

  inputText.value = ''
  resetInputHeight()
  sending.value = true

  try {
    const result = await $fetch<{ message: ChatMessage; session: ChatSession }>('/api/chat/message', {
      method: 'POST',
      body: { content, sessionId: activeSessionId.value },
    })

    if (!activeSessionId.value) {
      activeSessionId.value = result.session.id
      localStorage.setItem(SESSION_KEY, String(result.session.id))
    }

    await refreshSession()
    scrollToBottom()
  } catch {
    toast.add({ title: 'Failed to send message', color: 'red' })
    inputText.value = content
  } finally {
    sending.value = false
  }
}

function toggleSources(msgId: number) {
  if (expandedSources.value.has(msgId)) {
    expandedSources.value.delete(msgId)
  } else {
    expandedSources.value.add(msgId)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function modelShortLabel(providerId: string, modelId: string): string {
  return providers.value
    ?.find(p => p.id === providerId)
    ?.models.find(m => m.id === modelId)
    ?.name ?? modelId
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function resetInputHeight() {
  if (inputEl.value) inputEl.value.style.height = 'auto'
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

watch(messages, scrollToBottom)
</script>
