<template>
  <Transition name="slide">
    <div
      v-if="isPanelOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-md z-40 bg-zinc-900 border-l border-white/5 shadow-2xl flex flex-col"
    >
      <KanbanCardCreate v-if="creatingColumnId !== null" />
      <KanbanCardDetail v-else-if="selectedCard" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { selectedCard, creatingColumnId, isPanelOpen } = useKanbanState()
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
