<template>
  <aside
    class="w-56 shrink-0 bg-[#FAFAF9] dark:bg-[#121214] border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between select-none z-30 transition-colors"
  >
    <!-- Top Area: App Mark & Repository Selector -->
    <div>
      <!-- Brand & Version -->
      <div class="px-4 py-3.5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 group">
          <div class="w-6 h-6 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-mono font-bold text-xs">
            O
          </div>
          <span class="font-semibold tracking-tight text-xs text-stone-900 dark:text-stone-100">
            OpsLens
          </span>
          <span class="text-[10px] text-stone-400 font-mono">console</span>
        </router-link>

        <button
          type="button"
          class="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded transition-colors"
          :title="isMac ? 'Search (⌘K)' : 'Search (Ctrl+K)'"
          @click="prefStore.openSearch"
        >
          <Search class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Compact Monitored Repository Switcher -->
      <div class="p-3 border-b border-stone-200/60 dark:border-stone-800/60">
        <button
          type="button"
          class="w-full text-left p-2 rounded-md bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex items-center justify-between group cursor-pointer shadow-subtle"
          @click="prefStore.openRepoPicker"
        >
          <div class="truncate mr-1.5">
            <div class="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Repository</div>
            <div class="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ repoStore.currentRepo }}
            </div>
          </div>
          <ChevronsUpDown class="w-3.5 h-3.5 text-stone-400 shrink-0" />
        </button>
      </div>

      <!-- Quiet, Typographic Navigation Links -->
      <nav class="px-2 py-3 space-y-0.5">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          class="block"
        >
          <div
            :class="[
              'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors group relative',
              isActive
                ? 'bg-stone-200/70 dark:bg-stone-800 text-stone-950 dark:text-white font-medium'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/40 dark:hover:bg-stone-800/40 hover:text-stone-900 dark:hover:text-stone-200'
            ]"
          >
            <!-- Left subtle active indicator line -->
            <span
              v-if="isActive"
              class="absolute left-0 top-1 bottom-1 w-0.5 bg-stone-900 dark:bg-stone-100 rounded-r"
            />

            <div class="flex items-center gap-2.5">
              <component
                :is="item.icon"
                :class="[
                  'w-3.5 h-3.5 transition-colors',
                  isActive ? 'text-stone-900 dark:text-white' : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300'
                ]"
              />
              <span>{{ item.label }}</span>
            </div>

            <!-- Optional count badge -->
            <span
              v-if="item.count !== undefined"
              class="text-[10px] font-mono font-medium text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"
            >
              {{ item.count }}
            </span>
          </div>
        </router-link>
      </nav>
    </div>

    <!-- Bottom Area: Rate Limit Meter & Settings -->
    <div class="p-3 border-t border-stone-200/80 dark:border-stone-800/80 space-y-2">
      <!-- Rate Limit Indicator -->
      <div class="px-2 py-1.5 rounded bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/50 dark:border-stone-800/50 text-[11px] font-mono">
        <div class="flex items-center justify-between text-stone-500">
          <span>GitHub API Quota</span>
          <span :class="repoStore.rateLimit.remaining < 10 ? 'text-rose-500 font-bold' : 'text-stone-700 dark:text-stone-300'">
            {{ repoStore.rateLimit.remaining }}/{{ repoStore.rateLimit.limit }}
          </span>
        </div>
        <div class="w-full bg-stone-200 dark:bg-stone-800 h-1 rounded-full overflow-hidden mt-1.5 flex">
          <div
            class="h-full transition-all"
            :class="repoStore.rateLimit.remaining < 10 ? 'bg-rose-500' : 'bg-stone-900 dark:bg-stone-100'"
            :style="{ width: `${Math.min(100, (repoStore.rateLimit.remaining / repoStore.rateLimit.limit) * 100)}%` }"
          />
        </div>
      </div>

      <!-- Settings link -->
      <router-link
        to="/settings"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/40 dark:hover:bg-stone-800/40 transition-colors"
      >
        <Settings class="w-3.5 h-3.5 text-stone-400" />
        <span>Settings & Keys</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Search,
  ChevronsUpDown,
  LayoutDashboard,
  GitPullRequest,
  AlertCircle,
  GitCommit,
  Tag,
  Users,
  Settings
} from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const repoStore = useRepositoryStore()
const prefStore = usePreferencesStore()

const isMac = computed(() => {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent || navigator.platform || '')
})

const navItems = computed(() => [
  {
    path: '/',
    label: 'Overview',
    icon: LayoutDashboard
  },
  {
    path: '/pull-requests',
    label: 'Pull Requests',
    icon: GitPullRequest,
    count: repoStore.openPRsCount || undefined
  },
  {
    path: '/issues',
    label: 'Issues',
    icon: AlertCircle,
    count: repoStore.openIssuesCount || undefined
  },
  {
    path: '/commits',
    label: 'Commits',
    icon: GitCommit,
    count: repoStore.commits.length || undefined
  },
  {
    path: '/releases',
    label: 'Releases',
    icon: Tag,
    count: repoStore.releases.length || undefined
  },
  {
    path: '/contributors',
    label: 'Contributors',
    icon: Users,
    count: repoStore.contributors.length || undefined
  }
])
</script>
