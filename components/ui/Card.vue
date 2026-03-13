<template>
  <div class="linear-panel rounded-xl overflow-hidden flex flex-col">
    <!-- Optional Header -->
    <div v-if="$slots.header || title" class="px-6 py-5 border-b border-white/5 flex items-center justify-between">
      <div v-if="$slots.header">
        <slot name="header" />
      </div>
      <div v-else class="flex flex-col gap-1">
        <h3 class="text-sm font-medium text-white">{{ title }}</h3>
        <p v-if="description" class="text-xs text-zinc-400">{{ description }}</p>
      </div>
      
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6 flex-1 min-h-0">
      <slot />
    </div>

    <!-- Optional Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>
