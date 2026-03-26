interface ProviderModel {
  id: string
  name: string
}

interface Provider {
  id: string
  name: string
  models: ProviderModel[]
}

export function useChatFormatters() {
  function formatLabel(providers: Provider[] | null, providerId: string, modelId: string): string {
    if (!providers) return modelId
    const provider = providers.find(p => p.id === providerId)
    const model = provider?.models.find(m => m.id === modelId)
    return model?.name ?? (modelId.includes('/') ? modelId.split('/')[1] : modelId)
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return {
    formatLabel,
    formatDate,
  }
}