const SESSION_KEY = 'cortex_chat_session_id'
const PROVIDER_KEY = 'cortex_chat_provider'
const MODEL_KEY = 'cortex_chat_model'

export function useChatState() {
  const view = useState('chat-view', () => 'chat' as 'chat' | 'history')
  const activeSessionId = useCookie<number | null>(SESSION_KEY, { default: () => null })

  const selectedProvider = useCookie(PROVIDER_KEY, { default: () => 'opencode' })
  const selectedModel = useCookie(MODEL_KEY, { default: () => 'minimax-m2.5-free' })

  const pendingSwitch = useState<{ provider: string; model: string } | null>('chat-pending-switch', () => null)

  function setSessionId(id: number | null) {
    activeSessionId.value = id
  }

  function setProvider(provider: string) {
    selectedProvider.value = provider
  }

  function setModel(model: string) {
    selectedModel.value = model
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
    setSessionId,
    setProvider,
    setModel,
    setView,
    setPendingSwitch,
  }
}