<template>
  <div class="flex-1 overflow-y-auto">
    <div v-if="!sessions.length" class="flex flex-col items-center justify-center h-full text-zinc-600 text-sm gap-2">
      <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-8 h-8" />
      <p>No conversations yet</p>
    </div>
    <div v-else class="py-2">
      <button
        v-for="s in sessions"
        :key="s.id"
        class="w-full text-left px-4 py-3 group flex items-center gap-3 hover:bg-white/5 transition-colors"
        :class="activeId === s.id ? 'bg-white/5' : ''"
        @click="$emit('select', s.id)"
      >
        <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-zinc-600 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-zinc-300 truncate">{{ s.title ?? 'New conversation' }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">{{ formatLabel(s.modelProvider, s.modelName) }} · {{ formatDate(s.createdAt) }}</p>
        </div>
        <ButtonsIcon
          icon="i-heroicons-trash"
          variant="danger"
          size="sm"
          group-hover
          title="Delete"
          @click.stop="$emit('delete', s.id)"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Session {
  id: number
  title: string | null
  modelProvider: string
  modelName: string
  createdAt: string
}

interface ProviderModel {
  id: string
  name: string
}

interface Provider {
  id: string
  name: string
  models: ProviderModel[]
}

const props = defineProps<{
  sessions: Session[]
  activeId: number | null
  providers: Provider[] | null
}>()

defineEmits<{
  select: [id: number]
  delete: [id: number]
}>()

function formatLabel(providerId: string, modelId: string): string {
  if (!props.providers) return modelId
  const provider = props.providers.find(p => p.id === providerId)
  const model = provider?.models.find(m => m.id === modelId)
  return model?.name ?? (modelId.includes('/') ? modelId.split('/')[1] : modelId)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>