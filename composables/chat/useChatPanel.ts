const WIDTH_KEY = 'cortex_chat_width'
const DEFAULT_WIDTH = 380
const MIN_WIDTH = 280
const MAX_WIDTH = 640

export function useChatPanel() {
  const isOpen = useState('chat-panel-open', () => true)
  const width = useState('chat-panel-width', () => DEFAULT_WIDTH)

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function initWidth() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(WIDTH_KEY)
    if (stored) {
      const parsed = parseInt(stored)
      if (!isNaN(parsed)) width.value = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed))
    }
  }

  function saveWidth() {
    if (typeof window !== 'undefined') localStorage.setItem(WIDTH_KEY, String(width.value))
  }

  return { isOpen, width, toggle, initWidth, saveWidth, MIN_WIDTH, MAX_WIDTH }
}
