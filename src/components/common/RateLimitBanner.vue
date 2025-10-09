<template>
  <div
    v-if="repoStore.isFallback"
    class="w-full bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/80 px-6 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4 transition-colors"
  >
    <div class="flex items-center gap-2">
      <AlertCircle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>
        <strong>Notice:</strong> Live GitHub API unreachable (rate limit or offline) &mdash; displaying curated sample dataset for <code>{{ repoStore.currentRepo }}</code>.
      </span>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <button
        type="button"
        class="text-amber-800 dark:text-amber-300 font-semibold hover:underline cursor-pointer"
        @click="prefStore.openRepoPicker"
      >
        Change Repository
      </button>
      <router-link
        to="/settings"
        class="px-2.5 py-1 rounded bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-300/60 dark:hover:bg-amber-800/60 text-amber-950 dark:text-amber-100 font-medium transition-colors"
      >
        Add GitHub Token
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const repoStore = useRepositoryStore()
const prefStore = usePreferencesStore()
</script>
