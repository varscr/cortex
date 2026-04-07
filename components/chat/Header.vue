<template>
  <div class="min-h-[64px] py-2 flex items-center gap-2 px-4 border-b border-white/5 flex-shrink-0">
    <div class="flex-1 min-w-0 flex flex-col justify-center">
      <!-- Title Section -->
      <div 
        class="group inline-flex items-center gap-2 px-1.5 -ml-1.5 rounded-md hover:bg-white/[0.05] transition-colors cursor-pointer w-fit max-w-full mb-2"
        @click="startEditing"
      >
        <template v-if="!isEditing">
          <p class="text-base font-medium text-zinc-200 truncate">
            {{ title }}
          </p>
          <UIcon 
            name="i-heroicons-pencil" 
            class="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          />
        </template>
        
        <UInput
          v-else
          ref="titleInput"
          v-model="editTitle"
          variant="none"
          size="md"
          autofocus
          class="w-full"
          :ui="{ 
            base: 'bg-transparent border-0 ring-1 ring-blue-500/30 rounded-md px-1 text-base font-medium text-zinc-100 min-w-[120px]',
          }"
          @click.stop
          @blur="stopEditing"
          @keyup.enter="handleSave"
          @keyup.esc="stopEditing"
        />
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3">
        <FiltersFilter
          :model-value="provider"
          :options="providerOptions"
          placeholder="Provider"
          icon="i-heroicons-globe-alt"
          icon-class="text-zinc-600"
          button-class="bg-transparent text-zinc-500 hover:text-zinc-300 text-xs p-0 border-0 hover:bg-transparent"
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
          button-class="bg-transparent text-zinc-500 hover:text-zinc-300 text-xs p-0 border-0 hover:bg-transparent"
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

const props = defineProps<{
  title: string
  provider: string
  model: string
  providerOptions: ProviderOption[]
  modelOptions: ProviderOption[]
  pendingSwitch: boolean
  showHistory: boolean
}>()

const emit = defineEmits<{
  'update:provider': [value: string]
  'update:model': [value: string]
  'update-title': [value: string]
  'confirm-switch': []
  'cancel-switch': []
  'toggle-history': []
  'new-chat': []
  'close': []
}>()

const isEditing = ref(false)
const editTitle = ref('')
const titleInput = ref<any>(null)

function startEditing() {
  if (isEditing.value) return
  editTitle.value = props.title
  isEditing.value = true
}

function stopEditing() {
  isEditing.value = false
}

function handleSave() {
  if (!editTitle.value.trim() || editTitle.value === props.title) {
    stopEditing()
    return
  }
  emit('update-title', editTitle.value.trim())
  stopEditing()
}
</script>