const SESSION_KEY = 'cortex_chat_session_id'
const PROVIDER_KEY = 'cortex_chat_provider'
const MODEL_KEY = 'cortex_chat_model'

export function useChatState() {
  const view = useState('chat-view', () => 'chat' as 'chat' | 'history')
  const activeSessionId = useState<number | null>('chat-active-session', () => null)

  const selectedProvider = useState('chat-provider', () => 'opencode')
  const selectedModel = useState('chat-model', () => 'minimax-m2.5-free')

  const pendingSwitch = useState<{ provider: string; model: string } | null>('chat-pending-switch', () => null)

  function initFromLocalStorage() {
    if (typeof window === 'undefined') return

    const storedId = localStorage.getItem(SESSION_KEY)
    if (storedId) activeSessionId.value = parseInt(storedId)

    const storedProvider = localStorage.getItem(PROVIDER_KEY)
    if (storedProvider) selectedProvider.value = storedProvider

    const storedModel = localStorage.getItem(MODEL_KEY)
    if (storedModel) selectedModel.value = storedModel
  }

  function setSessionId(id: number | null) {
    activeSessionId.value = id
    if (id) {
      localStorage.setItem(SESSION_KEY, String(id))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  function setProvider(provider: string) {
    selectedProvider.value = provider
    localStorage.setItem(PROVIDER_KEY, provider)
  }

  function setModel(model: string) {
    selectedModel.value = model
    localStorage.setItem(MODEL_KEY, model)
  }

  function setView(newView: 'chat' | 'history') {
    view.value = newView
  }

  function setPendingSwitch(switchData: { provider: string; model: string } | null) {
    pendingSwitch.value = switchData
  }

  return {
    view,
    activeSessionId,
    selectedProvider,
    selectedModel,
    pendingSwitch,
    initFromLocalStorage,
    setSessionId,
    setProvider,
    setModel,
    setView,
    setPendingSwitch,
  }
}