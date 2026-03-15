<template>
  <UModal
    :model-value="modelValue"
    :ui="modalUi"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="linear-panel rounded-xl overflow-hidden">
      <div class="px-6 py-5 border-b border-white/5">
        <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
      </div>
      <form @submit.prevent="$emit('submit')" class="p-6 space-y-4">
        <slot />
        <div class="flex justify-end gap-2 pt-2">
          <UButton label="Cancel" color="gray" variant="ghost" @click="$emit('update:modelValue', false)" />
          <UiButton type="submit" :label="submitLabel" :loading="loading" />
        </div>
      </form>
    </div>
  </UModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  submitLabel?: string
  loading?: boolean
}>(), {
  submitLabel: 'Save',
  loading: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': []
}>()

const modalUi = {
  container: 'flex min-h-full items-center justify-center text-center',
  overlay: { background: 'bg-zinc-950/75 backdrop-blur-sm' },
  width: 'w-full sm:max-w-lg',
  background: 'bg-transparent',
  ring: '',
  shadow: '',
  rounded: '',
}
</script>
