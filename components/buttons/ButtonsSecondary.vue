<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors duration-200 gap-2 rounded-md',
      sizeClasses[size],
      variantClasses[variant],
      { 'w-full': fullWidth },
      { 'opacity-50 pointer-events-none': disabled }
    ]"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <UIcon v-if="icon" :name="icon" class="w-4 h-4" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  fullWidth?: boolean
}>(), {
  size: 'md',
  variant: 'outline',
  type: 'button',
  disabled: false,
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

const variantClasses = {
  outline: 'bg-transparent text-zinc-300 border border-white/10 hover:bg-white/[0.04]',
  ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.04]'
}
</script>