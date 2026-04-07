interface ChatSession {
  id: number
  title: string | null
  modelProvider: string
  modelName: string
  createdAt: string
}

interface ChatMessage {
  id: number
  sessionId: number
  role: string
  content: string
  sources: { source: string; sourceType: string; title: string; similarity: number }[]
}

interface SwitchResponse {
  session: ChatSession
  message?: ChatMessage
}

interface SendResponse {
  message: ChatMessage
  session: ChatSession
}

interface UseChatApiOptions {
  onSendSuccess?: () => void
  onDeleteSuccess?: () => void
}

export function useChatApi(options: UseChatApiOptions = {}) {
  const toast = useToast()

  async function sendMessage(
    content: string,
    sessionId: number | null,
    provider?: string,
    model?: string
  ): Promise<{ message: ChatMessage; session: ChatSession } | null> {
    try {
      const result = await $fetch<SendResponse>('/api/chat/message', {
        method: 'POST',
        body: { content, sessionId, provider, model },
      })
      options.onSendSuccess?.()
      return result
    } catch (err: any) {
      const responseData = err.response?._data
      toast.add({ 
        title: 'Failed to send message', 
        description: responseData?.statusMessage || err.message,
        color: 'red' 
      })
      return null
    }
  }

  async function createSession(provider: string, model: string): Promise<ChatSession | null> {
    try {
      const session = await $fetch<ChatSession>('/api/chat/sessions', {
        method: 'POST',
        body: { provider, model },
      })
      return session
    } catch {
      toast.add({ title: 'Failed to create session', color: 'red' })
      return null
    }
  }

  async function deleteSession(id: number): Promise<boolean> {
    try {
      await $fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
      options.onDeleteSuccess?.()
      return true
    } catch {
      toast.add({ title: 'Failed to delete session', color: 'red' })
      return false
    }
  }

  async function switchProvider(sessionId: number, newProvider: string, newModel: string, pendingMessage: string): Promise<SwitchResponse | null> {
    try {
      const result = await $fetch<SwitchResponse>('/api/chat/switch', {
        method: 'POST',
        body: {
          sessionId,
          newProvider,
          newModel,
          pendingMessage,
        },
      })
      return result
    } catch {
      toast.add({ title: 'Failed to switch provider', color: 'red' })
      return null
    }
  }

  return {
    sendMessage,
    createSession,
    deleteSession,
    switchProvider,
  }
}
