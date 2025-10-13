<template>
  <header class="h-12 bg-white dark:bg-[#18181B] border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 z-20 transition-colors">
    <!-- Left: Repository Identity Badge & Switcher trigger -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs font-mono text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer group"
        @click="prefStore.openRepoPicker"
      >
        <span class="text-stone-400">github.com /</span>
        <span class="font-semibold text-stone-900 dark:text-stone-100 group-hover:underline">{{ repoStore.currentRepo }}</span>
        <ChevronDown class="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
      </button>
    </div>

    <!-- Right: Actions, Refresh, Search, Theme -->
    <div class="flex items-center gap-2.5">
      <!-- Search shortcut button -->
      <button
        type="button"
        class="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs border border-stone-200 dark:border-stone-700 transition-colors"
        @click="prefStore.openSearch"
      >
        <Search class="w-3.5 h-3.5 text-stone-400" />
        <span class="text-stone-600 dark:text-stone-300 font-mono text-[11px]">Search...</span>
        <kbd class="px-1 py-0.2 text-[9px] bg-white dark:bg-stone-900 rounded border border-stone-300 dark:border-stone-700 font-mono text-stone-400">
          ⌘K
        </kbd>
      </button>

      <!-- Manual refresh -->
      <button
        type="button"
        class="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        :title="`Refresh repository data (${repoStore.lastRefreshedAt.toLocaleTimeString()})`"
        @click="repoStore.loadRepository()"
      >
        <RotateCw
          class="w-3.5 h-3.5"
          :class="repoStore.isLoading ? 'animate-spin text-stone-900 dark:text-stone-100' : ''"
        />
      </button>

      <!-- Light / Dark theme toggle -->
      <button
        type="button"
        class="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        :title="prefStore.isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
        @click="prefStore.toggleDarkMode"
      >
        <Sun v-if="prefStore.isDarkMode" class="w-3.5 h-3.5" />
        <Moon v-else class="w-3.5 h-3.5" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ChevronDown, Search, RotateCw, Sun, Moon } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const repoStore = useRepositoryStore()
const prefStore = usePreferencesStore()
</script>
