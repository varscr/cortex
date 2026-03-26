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
    <ChatHeader
      :title="view === 'history' ? 'Conversations' : (sessionDetail?.title ?? 'New Chat')"
      v-model:provider="selectedProvider"
      v-model:model="selectedModel"
      :provider-options="providerOptions"
      :model-options="modelOptions"
      :pending-switch="!!pendingSwitch"
      :show-history="view === 'history'"
      @confirm-switch="confirmSwitch"
      @cancel-switch="cancelSwitch"
      @toggle-history="toggleView"
      @new-chat="newChat"
      @close="toggle"
    />

    <!-- History view -->
    <ChatHistory
      v-if="view === 'history'"
      :sessions="sessions ?? []"
      :active-id="activeSessionId"
      :providers="providers ?? undefined"
      @select="selectSession"
      @delete="deleteSession"
    />

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
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :role="msg.role"
          :content="msg.content"
          :sources="msg.sources"
        />

        <div v-if="sending" class="flex justify-start">
          <div class="linear-panel rounded-xl px-3 py-2.5 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <span class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      <!-- Input -->
      <ChatInput
        v-model="inputText"
        :disabled="sending"
        @send="sendMessage"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const SESSION_KEY = 'cortex_chat_session_id'
const PROVIDER_KEY = 'cortex_chat_provider'
const MODEL_KEY = 'cortex_chat_model'

const { isOpen, width, toggle, initWidth, saveWidth } = useChatPanel()

const view = ref<'chat' | 'history'>('chat')
const activeSessionId = ref<number | null>(null)
const inputText = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const inputRef = ref<{ focus: () => void } | null>(null)
const pendingSwitch = ref<{ provider: string; model: string } | null>(null)

const toast = useToast()

const { data: providers } = useFetch<LlmProviderOption[]>('/api/chat/providers')

const selectedProvider = ref('claude-code')
const selectedModel = ref('claude-sonnet-4-6')

const providerOptions = computed(() =>
  providers.value?.map(p => ({ label: p.name, value: p.id })) ?? []
)

const modelOptions = computed(() => {
  const provider = providers.value?.find(p => p.id === selectedProvider.value)
  return provider?.models.map(m => ({ label: m.name, value: m.id })) ?? []
})

watch(selectedProvider, (newProvider) => {
  const provider = providers.value?.find(p => p.id === newProvider)
  if (provider?.models.length) {
    selectedModel.value = provider.defaultModel || provider.models[0].id
    localStorage.setItem(PROVIDER_KEY, newProvider)
    localStorage.setItem(MODEL_KEY, selectedModel.value)
  }
})

watch(selectedModel, (newModel) => {
  localStorage.setItem(MODEL_KEY, newModel)
})

watch([selectedProvider, selectedModel], ([newProvider, newModel]) => {
  if (!activeSessionId.value || !sessionDetail.value) return
  const session = sessionDetail.value
  if (newProvider === session.modelProvider && newModel === session.modelName) return
  pendingSwitch.value = { provider: newProvider, model: newModel }
})

function confirmSwitch() {
  if (!pendingSwitch.value) return
  switchProvider(pendingSwitch.value.provider, pendingSwitch.value.model)
  pendingSwitch.value = null
}

function cancelSwitch() {
  if (!activeSessionId.value || !sessionDetail.value) {
    pendingSwitch.value = null
    return
  }
  const session = sessionDetail.value
  selectedProvider.value = session.modelProvider
  selectedModel.value = session.modelName
  pendingSwitch.value = null
}

async function switchProvider(newProvider: string, newModel: string) {
  if (!activeSessionId.value) return
  sending.value = true
  const currentContent = inputText.value.trim()

  try {
    const result = await $fetch<{ session: ChatSession; message?: ChatMessage }>('/api/chat/switch', {
      method: 'POST',
      body: {
        sessionId: activeSessionId.value,
        newProvider,
        newModel,
        pendingMessage: currentContent,
      },
    })

    localStorage.setItem(PROVIDER_KEY, newProvider)
    localStorage.setItem(MODEL_KEY, newModel)
    inputText.value = ''

    await refreshSession()
    if (result.message) {
      nextTick(() => scrollToBottom())
    }

    toast.add({ title: `Switched to ${newProvider}`, color: 'green' })
  } catch {
    toast.add({ title: 'Failed to switch provider', color: 'red' })
  } finally {
    sending.value = false
  }
}

const { data: sessionDetail, refresh: refreshSession } = useFetch<ChatSessionDetail>(
  () => activeSessionId.value ? `/api/chat/sessions/${activeSessionId.value}` : null,
  { watch: [activeSessionId] },
)

const messages = computed(() => sessionDetail.value?.messages ?? [])

const { data: sessions, refresh: refreshSessions } = useFetch<ChatSession[]>('/api/chat/sessions', {
  immediate: false,
})

onMounted(() => {
  initWidth()

  const storedId = localStorage.getItem(SESSION_KEY)
  if (storedId) activeSessionId.value = parseInt(storedId)

  const storedProvider = localStorage.getItem(PROVIDER_KEY)
  if (storedProvider) selectedProvider.value = storedProvider

  const storedModel = localStorage.getItem(MODEL_KEY)
  if (storedModel) selectedModel.value = storedModel
})

function startResize(e: MouseEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = width.value

  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'

  function onMove(e: MouseEvent) {
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

function toggleView() {
  view.value = view.value === 'history' ? 'chat' : 'history'
  if (view.value === 'history') refreshSessions()
}

async function newChat() {
  const session = await $fetch<ChatSession>('/api/chat/sessions', {
    method: 'POST',
    body: { provider: selectedProvider.value, model: selectedModel.value },
  })
  activeSessionId.value = session.id
  localStorage.setItem(SESSION_KEY, String(session.id))
  view.value = 'chat'
  await refreshSession()
  nextTick(() => {
    const textarea = document.querySelector('.chat-input textarea') as HTMLTextAreaElement
    textarea?.focus()
  })
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

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

watch(messages, scrollToBottom)
</script>