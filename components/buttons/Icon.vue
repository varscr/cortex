<template>
  <button
    :class="[
      'flex items-center justify-center rounded-md transition-colors',
      sizeClasses[size],
      variantClasses[variant],
      { 'opacity-0 group-hover:opacity-100': groupHover },
      { 'pointer-events-none': disabled }
    ]"
    :title="title"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <UIcon :name="icon" :class="iconSizeClasses[size]" />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'danger'
  title?: string
  active?: boolean
  groupHover?: boolean
  disabled?: boolean
}>(), {
  size: 'md',
  variant: 'default',
  active: false,
  groupHover: false,
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
}

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const variantClasses = {
  default: 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.04]',
  danger: 'text-zinc-600 hover:text-red-400 hover:bg-white/5'
}
</script>