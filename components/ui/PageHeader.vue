<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold text-white tracking-tight">{{ title }}</h1>
      <p v-if="description" class="text-sm text-zinc-400">{{ description }}</p>
    </div>
    
    <div v-if="$slots.actions" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
