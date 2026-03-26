<template>
  <div class="h-16 flex items-center gap-2 px-4 border-b border-white/5 flex-shrink-0">
    <div class="flex-1 min-w-0">
      <p class="text-base font-medium text-zinc-200 truncate">
        {{ title }}
      </p>
      <div class="flex items-center gap-1.5 mt-1">
        <FiltersFilter
          :model-value="provider"
          :options="providerOptions"
          placeholder="Provider"
          icon="i-heroicons-globe-alt"
          icon-class="text-zinc-600"
          button-class="bg-transparent text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1 border-0 hover:bg-white/5"
          text-class="truncate"
          menu-class="w-36"
          @update:model-value="$emit('update:provider', $event)"
        />
        <FiltersFilter
          :model-value="model"
          :options="modelOptions"
          placeholder="Model"
          icon="i-heroicons-cpu-chip"
          icon-class="text-zinc-600"
          button-class="bg-transparent text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1 border-0 hover:bg-white/5"
          text-class="truncate"
          menu-class="w-44"
          @update:model-value="$emit('update:model', $event)"
        />
      </div>

      <ButtonsConfirm
        v-if="pendingSwitch"
        @confirm="$emit('confirm-switch')"
        @cancel="$emit('cancel-switch')"
      />
    </div>

    <div class="flex items-center gap-1 flex-shrink-0">
      <ButtonsIcon
        icon="i-heroicons-clock"
        :title="showHistory ? 'Back to chat' : 'Conversations'"
        :active="showHistory"
        @click="$emit('toggle-history')"
      />

      <ButtonsIcon
        icon="i-heroicons-plus"
        title="New chat"
        @click="$emit('new-chat')"
      />

      <ButtonsIcon
        icon="i-heroicons-x-mark"
        title="Close"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProviderOption {
  label: string
  value: string
}

defineProps<{
  title: string
  provider: string
  model: string
  providerOptions: ProviderOption[]
  modelOptions: ProviderOption[]
  pendingSwitch: boolean
  showHistory: boolean
}>()

defineEmits<{
  'update:provider': [value: string]
  'update:model': [value: string]
  'confirm-switch': []
  'cancel-switch': []
  'toggle-history': []
  'new-chat': []
  'close': []
}>()
</script>