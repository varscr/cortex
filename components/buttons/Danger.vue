<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors duration-200 gap-2 rounded-md',
      sizeClasses[size],
      baseClasses,
      { 'w-full': fullWidth },
      { 'opacity-50 pointer-events-none': disabled || loading }
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin w-4 h-4" />
    <UIcon v-else-if="icon" :name="icon" class="w-4 h-4" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}>(), {
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5'
}

const baseClasses = 'bg-red-950/60 text-red-400 hover:bg-red-900/60'
</script>