<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors duration-200 gap-2 rounded-md',
      sizeClasses[size],
      variantClasses[variant]
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin w-4 h-4" />
    <UIcon v-else-if="icon" :name="icon" class="w-4 h-4" />
    <slot>{{ label }}</slot>
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'

withDefaults(defineProps<{
  variant?: 'solid' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  label?: string
  to?: string
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'solid',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
})

defineEmits(['click'])

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
}

const variantClasses = {
  solid: 'bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white',
  outline: 'bg-transparent text-zinc-300 border border-white/10 hover:bg-white/[0.04] disabled:opacity-50',
  ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600',
}
</script>
