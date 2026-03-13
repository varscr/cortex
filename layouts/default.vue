<template>
  <div class="min-h-screen linear-bg flex flex-col md:flex-row">
    <!-- Sidebar Spacer (participates in flex layout, controls content shift) -->
    <div
      class="hidden md:block flex-shrink-0 transition-all duration-300"
      :class="isCollapsed ? 'w-16' : 'w-64'"
    />

    <!-- Fixed Sidebar (visual element, expands on hover without moving content) -->
    <aside
      class="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 border-r border-white/5 bg-zinc-950/80 backdrop-blur-md transition-all duration-300"
      :class="isCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Logo + Toggle -->
      <div class="h-16 flex items-center justify-between border-b border-white/5 overflow-hidden" :class="isCollapsed ? 'px-3' : 'px-6'">
        <h1 v-show="!isCollapsed" class="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-semibold text-2xl tracking-tight whitespace-nowrap" style="font-family: 'Inter', system-ui, sans-serif;">
          Cortex
        </h1>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
          @click="toggle"
        >
          <UIcon
            :name="isCollapsed ? 'i-heroicons-chevron-right-20-solid' : 'i-heroicons-chevron-left-20-solid'"
            class="w-5 h-5"
          />
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="p-4 space-y-1 flex-1">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 rounded-md hover:text-white linear-hover whitespace-nowrap overflow-hidden"
          :class="isCollapsed ? 'justify-center' : ''"
          active-class="bg-white/5 text-white font-medium"
        >
          <UIcon :name="link.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-show="!isCollapsed">{{ link.label }}</span>
        </NuxtLink>
      </nav>

    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden h-14 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
      <h1 class="text-white font-medium flex items-center gap-2">
        <UIcon name="i-heroicons-cpu-chip" class="text-zinc-400" />
        Cortex
      </h1>
      <UButton icon="i-heroicons-bars-3" color="gray" variant="ghost" @click="isMobileMenuOpen = !isMobileMenuOpen" />
    </header>

    <!-- Mobile Menu Overlay -->
    <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-40 bg-zinc-950 pt-16">
      <div class="absolute top-4 right-4">
        <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="isMobileMenuOpen = false" />
      </div>
      <nav class="p-6 space-y-2">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
                  class="flex items-center gap-3 px-4 py-3 text-zinc-400 rounded-md hover:text-white linear-hover"
                  active-class="bg-white/5 text-white font-medium"
                  @click="isMobileMenuOpen = false">
          <UIcon :name="link.icon" class="w-5 h-5" />
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar / Breadcrumbs (Desktop) -->
      <header class="hidden md:flex h-16 border-b border-white/5 items-center px-8 bg-zinc-950/80 backdrop-blur-md z-10">
        <div class="flex-1">
          <!-- Optional breadcrumbs or page tools here -->
        </div>
        <div class="flex items-center gap-4">
        </div>
      </header>

      <!-- Page Render -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto w-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

const { isCollapsed, toggle } = useSidebar()

const links = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Profile', icon: 'i-heroicons-user', to: '/profile' },
  { label: 'Finances', icon: 'i-heroicons-banknotes', to: '/finances' },
  { label: 'Trading', icon: 'i-heroicons-chart-bar', to: '/trading' },
  { label: 'Log', icon: 'i-heroicons-book-open', to: '/log' },
]
</script>
