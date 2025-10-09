<template>
  <div
    v-if="prefStore.isSearchOpen"
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 select-none"
    @click.self="prefStore.closeSearch"
  >
    <div
      class="w-full max-w-xl bg-white dark:bg-[#18181B] rounded-xl shadow-modal border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
    >
      <!-- Search Input Bar -->
      <div class="flex items-center px-4 py-3 border-b border-stone-200 dark:border-stone-800">
        <Search class="w-4 h-4 text-stone-400 mr-3 shrink-0" />
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          placeholder="Search PRs, issues, commits, releases, or contributors..."
          class="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden font-sans"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc="prefStore.closeSearch"
        />
        <kbd class="px-1.5 py-0.5 text-[10px] bg-stone-100 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 font-mono text-stone-500">
          ESC
        </kbd>
      </div>

      <!-- Results list -->
      <div class="max-h-96 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-800/40">
        <!-- Quick Nav if query empty -->
        <div v-if="!query.trim()" class="py-2">
          <div class="px-3 pb-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider font-mono">
            Navigation
          </div>
          <div
            v-for="(item, idx) in navItems"
            :key="item.path"
            :class="[
              'flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors',
              highlightIndex === idx
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
            ]"
            @click="navigate(item.path)"
            @mouseenter="highlightIndex = idx"
          >
            <div class="flex items-center gap-2.5">
              <component :is="item.icon" class="w-4 h-4 text-stone-400" />
              <span>{{ item.title }}</span>
            </div>
            <span class="text-[11px] font-mono text-stone-400">{{ item.shortcut }}</span>
          </div>
        </div>

        <!-- Filtered items -->
        <div v-else>
          <div v-if="flatResults.length === 0" class="py-8 text-center text-xs text-stone-500">
            No engineering records found for "{{ query }}".
          </div>

          <div
            v-for="(item, idx) in flatResults"
            :key="item.id"
            :class="[
              'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors',
              highlightIndex === idx
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
            ]"
            @click="handleSelect(item)"
            @mouseenter="highlightIndex = idx"
          >
            <div class="flex items-center gap-3 truncate">
              <span
                :class="[
                  'px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase shrink-0',
                  item.type === 'pr' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                  item.type === 'issue' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  item.type === 'commit' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                  'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                ]"
              >
                {{ item.type }}
              </span>

              <div class="truncate">
                <div class="font-medium truncate text-stone-900 dark:text-stone-100">{{ item.title }}</div>
                <div class="text-[11px] text-stone-500 font-mono truncate">{{ item.subtitle }}</div>
              </div>
            </div>

            <span v-if="item.badge" class="text-[10px] font-mono text-stone-400 shrink-0 ml-2">
              {{ item.badge }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer tips -->
      <div class="px-4 py-2 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
        <div class="flex items-center gap-3">
          <span><kbd class="font-sans">↑↓</kbd> navigate</span>
          <span><kbd class="font-sans">↵</kbd> select</span>
        </div>
        <span>Repository: {{ repoStore.currentRepo }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  LayoutDashboard,
  GitPullRequest,
  AlertCircle,
  GitCommit,
  Tag,
  Users
} from 'lucide-vue-next'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useRepositoryStore } from '@/stores/repositoryStore'

const router = useRouter()
const prefStore = usePreferencesStore()
const repoStore = useRepositoryStore()

const query = ref('')
const highlightIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

const navItems = [
  { title: 'Operations Overview', path: '/', icon: LayoutDashboard, shortcut: 'g o' },
  { title: 'Pull Requests', path: '/pull-requests', icon: GitPullRequest, shortcut: 'g p' },
  { title: 'Issue Resolution', path: '/issues', icon: AlertCircle, shortcut: 'g i' },
  { title: 'Commit Activity', path: '/commits', icon: GitCommit, shortcut: 'g c' },
  { title: 'Releases & Milestones', path: '/releases', icon: Tag, shortcut: 'g r' },
  { title: 'Contributor Directory', path: '/contributors', icon: Users, shortcut: 'g u' },
]

interface SearchResult {
  id: string
  type: 'pr' | 'issue' | 'commit' | 'release' | 'contributor'
  title: string
  subtitle: string
  route?: string
  externalUrl?: string
  badge?: string
}

const flatResults = computed<SearchResult[]>(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase().trim()
  const results: SearchResult[] = []

  // PRs
  repoStore.pullRequests.forEach(pr => {
    if (pr.title.toLowerCase().includes(q) || String(pr.number).includes(q) || pr.user.login.toLowerCase().includes(q)) {
      results.push({
        id: `pr-${pr.id}`,
        type: 'pr',
        title: `#${pr.number}: ${pr.title}`,
        subtitle: `by @${pr.user.login} &bull; ${pr.state.toUpperCase()}`,
        route: `/pull-requests?id=${pr.number}`,
        badge: pr.state
      })
    }
  })

  // Issues
  repoStore.issues.forEach(iss => {
    if (iss.title.toLowerCase().includes(q) || String(iss.number).includes(q) || iss.user.login.toLowerCase().includes(q)) {
      results.push({
        id: `issue-${iss.id}`,
        type: 'issue',
        title: `#${iss.number}: ${iss.title}`,
        subtitle: `by @${iss.user.login} &bull; ${iss.state.toUpperCase()}`,
        route: `/issues?id=${iss.number}`,
        badge: iss.state
      })
    }
  })

  // Commits
  repoStore.commits.forEach(c => {
    const msg = c.commit.message.split('\n')[0]
    if (msg.toLowerCase().includes(q) || c.sha.toLowerCase().includes(q) || (c.author && c.author.login.toLowerCase().includes(q))) {
      results.push({
        id: `commit-${c.sha}`,
        type: 'commit',
        title: msg,
        subtitle: `${c.sha.substring(0, 7)} by ${c.author?.login || c.commit.author.name}`,
        route: '/commits',
        badge: c.sha.substring(0, 7)
      })
    }
  })

  // Releases
  repoStore.releases.forEach(rel => {
    if (rel.tag_name.toLowerCase().includes(q) || (rel.name && rel.name.toLowerCase().includes(q))) {
      results.push({
        id: `release-${rel.id}`,
        type: 'release',
        title: rel.name || rel.tag_name,
        subtitle: `Tag ${rel.tag_name} &bull; Published ${rel.published_at.split('T')[0]}`,
        route: '/releases',
        badge: rel.tag_name
      })
    }
  })

  // Contributors
  repoStore.contributors.forEach(contrib => {
    if (contrib.login.toLowerCase().includes(q)) {
      results.push({
        id: `contrib-${contrib.id}`,
        type: 'contributor',
        title: `@${contrib.login}`,
        subtitle: `${contrib.contributions.toLocaleString()} contributions`,
        route: '/contributors',
        badge: `${contrib.contributions} commits`
      })
    }
  })

  return results.slice(0, 15)
})

watch(() => prefStore.isSearchOpen, (isOpen) => {
  if (isOpen) {
    query.value = ''
    highlightIndex.value = 0
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

watch(query, () => {
  highlightIndex.value = 0
})

const navigateDown = () => {
  const count = query.value.trim() ? flatResults.value.length : navItems.length
  if (count === 0) return
  highlightIndex.value = (highlightIndex.value + 1) % count
}

const navigateUp = () => {
  const count = query.value.trim() ? flatResults.value.length : navItems.length
  if (count === 0) return
  highlightIndex.value = (highlightIndex.value - 1 + count) % count
}

const selectHighlighted = () => {
  if (!query.value.trim()) {
    const item = navItems[highlightIndex.value]
    if (item) navigate(item.path)
  } else {
    const item = flatResults.value[highlightIndex.value]
    if (item) handleSelect(item)
  }
}

const handleSelect = (item: SearchResult) => {
  prefStore.closeSearch()
  if (item.route) router.push(item.route)
}

const navigate = (path: string) => {
  prefStore.closeSearch()
  router.push(path)
}
</script>
