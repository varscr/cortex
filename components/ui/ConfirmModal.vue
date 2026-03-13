<template>
  <UModal
    :model-value="modelValue"
    :ui="modalUi"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="linear-panel rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-white/5">
        <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
      </div>

      <!-- Body -->
      <div class="px-6 py-5">
        <p class="text-zinc-300">{{ message }}</p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-end gap-2">
        <UButton label="Cancel" color="gray" variant="ghost" @click="$emit('update:modelValue', false)" />
        <UButton :label="confirmLabel" :color="confirmColor" :loading="loading" @click="$emit('confirm')" />
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmColor?: string
  loading?: boolean
}>(), {
  confirmLabel: 'Confirm',
  confirmColor: 'red',
  loading: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const modalUi = {
  container: 'flex min-h-full items-center justify-center text-center',
  overlay: {
    background: 'bg-zinc-950/75 backdrop-blur-sm',
  },
  width: 'w-full sm:max-w-lg',
  background: 'bg-transparent',
  ring: '',
  shadow: '',
  rounded: '',
}
</script>
