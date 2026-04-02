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
      @confirm-switch="handleConfirmSwitch"
      @cancel-switch="handleCancelSwitch"
      @toggle-history="toggleView"
      @new-chat="handleNewChat"
      @close="toggle"
    />

    <!-- History view -->
    <ChatHistory
      v-if="view === 'history'"
      :sessions="sessions ?? []"
      :active-id="activeSessionId"
      :providers="providers ?? null"
      @select="handleSelectSession"
      @delete="handleDeleteSession"
    />

    <!-- Chat view -->
    <template v-else>
      <!-- Empty state / New Chat prompt -->
      <div v-if="!messages.length && !sending" class="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
        <UIcon name="i-heroicons-chat-bubble-left-right" class="w-10 h-10 text-zinc-700" />
        <div>
          <p class="text-sm text-zinc-400 font-medium mb-1">Ask anything</p>
          <p class="text-xs text-zinc-600">Searches your log, knowledge, and profile automatically.</p>
        </div>
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
        @send="handleSendMessage"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const { isOpen, width, toggle, initWidth, saveWidth, MIN_WIDTH, MAX_WIDTH } = useChatPanel()

const { view, activeSessionId, selectedProvider, selectedModel, pendingSwitch, setSessionId, setProvider, setModel, setView, setPendingSwitch } = useChatState()

const inputText = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

const { data: providers } = useFetch<LlmProviderOption[]>('/api/chat/providers')

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
    const defaultModel = provider.defaultModel || provider.models[0].id
    setProvider(newProvider)
    setModel(defaultModel)
  }
})

watch([selectedProvider, selectedModel], ([newProvider, newModel]) => {
  if (!activeSessionId.value || !sessionDetail.value) return
  const session = sessionDetail.value
  if (newProvider === session.modelProvider && newModel === session.modelName) return
  setPendingSwitch({ provider: newProvider, model: newModel })
})

const { data: _sessionData, refresh: refreshSession } = useAsyncData<ChatSessionDetail | null>(
  () => (activeSessionId.value ? `session-${activeSessionId.value}` : 'no-session'),
  () => {
    if (!activeSessionId.value) return Promise.resolve(null)
    return $fetch<ChatSessionDetail>(`/api/chat/sessions/${activeSessionId.value}`)
  },
  {
    watch: [activeSessionId],
  }
)
const sessionDetail = computed(() => _sessionData.value)

const messages = computed(() => sessionDetail.value?.messages ?? [])

const { data: sessions, refresh: refreshSessions } = useFetch<ChatSession[]>('/api/chat/sessions', {
  immediate: false,
})

const { createSession, deleteSession, sendMessage, switchProvider } = useChatApi({
  onSendSuccess: () => refreshSession(),
  onDeleteSuccess: () => refreshSessions(),
})

onMounted(() => {
  initWidth()
})


function startResize(e: MouseEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = width.value

  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'

  function onMove(e: MouseEvent) {
    const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + (startX - e.clientX)))
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
  const newView = view.value === 'history' ? 'chat' : 'history'
  setView(newView)
  if (newView === 'history') refreshSessions()
}

function handleNewChat() {
  setSessionId(null)
  setView('chat')
  nextTick(() => {
    const textarea = document.querySelector('.chat-input textarea') as HTMLTextAreaElement
    textarea?.focus()
  })
}

async function handleSelectSession(id: number) {
  setSessionId(id)
  setView('chat')
  await refreshSession()
  scrollToBottom()
}

async function handleDeleteSession(id: number) {
  const success = await deleteSession(id)
  if (success && activeSessionId.value === id) {
    setSessionId(null)
  }
}

async function handleSendMessage() {
  const content = inputText.value.trim()
  if (!content || sending.value) return

  inputText.value = ''
  sending.value = true

  const result = await sendMessage(
    content,
    activeSessionId.value,
    activeSessionId.value ? undefined : selectedProvider.value,
    activeSessionId.value ? undefined : selectedModel.value
  )

  if (result && !activeSessionId.value) {
    setSessionId(result.session.id)
  }

  sending.value = false
  await refreshSession()
  scrollToBottom()
}

async function handleConfirmSwitch() {
  if (!pendingSwitch.value || !activeSessionId.value) return

  const currentContent = inputText.value.trim()
  sending.value = true

  const result = await switchProvider(
    activeSessionId.value,
    pendingSwitch.value.provider,
    pendingSwitch.value.model,
    currentContent
  )

  if (result) {
    setProvider(pendingSwitch.value.provider)
    setModel(pendingSwitch.value.model)
    inputText.value = ''
    await refreshSession()
    if (result.message) {
      nextTick(() => scrollToBottom())
    }
  }

  setPendingSwitch(null)
  sending.value = false
}

function handleCancelSwitch() {
  if (!activeSessionId.value || !sessionDetail.value) {
    setPendingSwitch(null)
    return
  }
  const session = sessionDetail.value
  setProvider(session.modelProvider)
  setModel(session.modelName)
  setPendingSwitch(null)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

watch(messages, scrollToBottom)
</script>