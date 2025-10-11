<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          Issue Tracking & Resolution
        </h1>
        <p class="text-xs text-stone-500 mt-0.5">
          Triage backlog, bug reports, and RFC inquiries for {{ repoStore.currentRepo }}.
        </p>
      </div>

      <div class="flex items-center gap-3 text-xs font-mono text-stone-500">
        <span>{{ repoStore.openIssuesCount }} Open Issues</span>
        <span>&bull;</span>
        <span>Resolution Ratio: <strong class="text-emerald-600 dark:text-emerald-400">{{ repoStore.issueResolutionRatio }}%</strong></span>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
      <!-- Status Tabs -->
      <div class="inline-flex p-0.5 bg-stone-100 dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700/80 font-mono text-[11px]">
        <button
          v-for="st in ['all', 'open', 'closed']"
          :key="st"
          type="button"
          :class="[
            'px-3 py-1 rounded transition-colors uppercase font-medium',
            stateFilter === st
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-subtle'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          ]"
          @click="stateFilter = st"
        >
          {{ st }}
        </button>
      </div>

      <!-- Search & Label Filters -->
      <div class="flex items-center gap-2">
        <div class="relative w-full sm:w-64">
          <Search class="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter issues by title or author..."
            class="w-full bg-white dark:bg-stone-900 text-xs pl-8 pr-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-800 focus:outline-hidden font-mono"
          />
        </div>

        <select
          v-model="selectedLabel"
          class="bg-white dark:bg-stone-900 text-xs font-mono py-1.5 px-2.5 rounded-md border border-stone-200 dark:border-stone-800 focus:outline-hidden cursor-pointer"
        >
          <option value="all">All Labels</option>
          <option v-for="lbl in availableLabels" :key="lbl" :value="lbl">
            {{ lbl }}
          </option>
        </select>
      </div>
    </div>

    <!-- Issues Table -->
    <div class="bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden shadow-subtle">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-stone-50/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-stone-400 font-mono text-[11px]">
              <th class="py-2.5 px-4 font-medium w-16">Issue</th>
              <th class="py-2.5 px-3 font-medium">Topic & Discussion</th>
              <th class="py-2.5 px-3 font-medium w-24">State</th>
              <th class="py-2.5 px-3 font-medium w-36">Author</th>
              <th class="py-2.5 px-3 font-medium w-24 text-right">Replies</th>
              <th class="py-2.5 px-3 font-medium w-28 text-right">Age</th>
              <th class="py-2.5 px-4 font-medium w-48">Labels</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100 dark:divide-stone-800/60">
            <tr
              v-for="issue in filteredIssues"
              :key="issue.id"
              class="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors cursor-pointer group"
              @click="openIssueDetails(issue)"
            >
              <td class="py-3 px-4 font-mono font-semibold text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-100">
                #{{ issue.number }}
              </td>

              <td class="py-3 px-3">
                <div class="font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ issue.title }}
                </div>
              </td>

              <td class="py-3 px-3">
                <StatusPill :status="issue.state" size="xs" />
              </td>

              <td class="py-3 px-3">
                <div class="flex items-center gap-1.5 font-mono">
                  <img :src="issue.user.avatar_url" class="w-4 h-4 rounded-full" alt="avatar" />
                  <span class="text-stone-700 dark:text-stone-300">@{{ issue.user.login }}</span>
                </div>
              </td>

              <td class="py-3 px-3 text-right font-mono text-stone-500">
                <span class="flex items-center justify-end gap-1">
                  <MessageSquare class="w-3 h-3 text-stone-400" />
                  <span>{{ issue.comments }}</span>
                </span>
              </td>

              <td class="py-3 px-3 text-right font-mono text-stone-500">
                {{ formatAge(issue.created_at) }}
              </td>

              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <LabelBadge v-for="lbl in issue.labels.slice(0, 2)" :key="lbl.id" :label="lbl" />
                  <span v-if="issue.labels.length > 2" class="text-[10px] font-mono text-stone-400">
                    +{{ issue.labels.length - 2 }}
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="filteredIssues.length === 0">
              <td colspan="7" class="py-12 text-center text-xs text-stone-400 font-mono">
                No issues match the current filter selection.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Issue Detail Drawer / Modal -->
    <div
      v-if="selectedIssue"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end select-none"
      @click.self="selectedIssue = null"
    >
      <div
        class="w-full max-w-xl h-full bg-white dark:bg-[#18181B] border-l border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div class="space-y-6">
          <div class="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-mono font-bold text-stone-400">#{{ selectedIssue.number }}</span>
                <StatusPill :status="selectedIssue.state" />
              </div>
              <h2 class="text-base font-bold text-stone-900 dark:text-stone-100 mt-2">
                {{ selectedIssue.title }}
              </h2>
            </div>
            <button
              type="button"
              class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              @click="selectedIssue = null"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs font-mono text-stone-500 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-lg border border-stone-200/60 dark:border-stone-800/60">
            <div>
              <span class="text-[10px] uppercase text-stone-400">Opened by</span>
              <div class="text-stone-900 dark:text-stone-100 font-medium mt-0.5">@{{ selectedIssue.user.login }}</div>
            </div>
            <div>
              <span class="text-[10px] uppercase text-stone-400">Date Logged</span>
              <div class="text-stone-900 dark:text-stone-100 font-medium mt-0.5">{{ formatDate(selectedIssue.created_at) }}</div>
            </div>
            <div>
              <span class="text-[10px] uppercase text-stone-400">Community Replies</span>
              <div class="text-stone-900 dark:text-stone-100 font-medium mt-0.5">{{ selectedIssue.comments }} comments</div>
            </div>
            <div>
              <span class="text-[10px] uppercase text-stone-400">Status</span>
              <div class="text-stone-900 dark:text-stone-100 font-medium mt-0.5 uppercase">{{ selectedIssue.state }}</div>
            </div>
          </div>

          <div v-if="selectedIssue.labels.length > 0" class="space-y-1.5">
            <span class="text-[11px] font-mono uppercase text-stone-400">Labels</span>
            <div class="flex flex-wrap gap-1.5">
              <LabelBadge v-for="lbl in selectedIssue.labels" :key="lbl.id" :label="lbl" />
            </div>
          </div>

          <div class="space-y-1.5">
            <span class="text-[11px] font-mono uppercase text-stone-400">Issue Body & Context</span>
            <div class="p-4 rounded-lg bg-stone-50 dark:bg-stone-900 text-xs font-mono text-stone-700 dark:text-stone-300 whitespace-pre-wrap border border-stone-200/60 dark:border-stone-800/60 max-h-80 overflow-y-auto leading-relaxed">
              {{ selectedIssue.body || 'No description provided by author.' }}
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span class="font-mono text-stone-400">External Provider: GitHub</span>
          <a
            :href="selectedIssue.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium font-mono flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span>View on GitHub</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, X, MessageSquare, ExternalLink } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import type { GitHubIssue } from '@/types'
import StatusPill from '@/components/common/StatusPill.vue'
import LabelBadge from '@/components/common/LabelBadge.vue'

const route = useRoute()
const router = useRouter()
const repoStore = useRepositoryStore()

const stateFilter = ref<string>((route.query.state as string) || 'all')
const searchQuery = ref<string>((route.query.search as string) || '')
const selectedLabel = ref<string>((route.query.label as string) || 'all')

const selectedIssue = ref<GitHubIssue | null>(null)

const availableLabels = computed(() => {
  const set = new Set<string>()
  repoStore.issues.forEach(i => {
    i.labels.forEach(lbl => set.add(lbl.name))
  })
  return Array.from(set)
})

const filteredIssues = computed(() => {
  return repoStore.issues.filter(issue => {
    if (stateFilter.value !== 'all' && issue.state !== stateFilter.value) {
      return false
    }

    if (selectedLabel.value !== 'all' && !issue.labels.some(l => l.name === selectedLabel.value)) {
      return false
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchesTitle = issue.title.toLowerCase().includes(q)
      const matchesAuthor = issue.user.login.toLowerCase().includes(q)
      const matchesNumber = String(issue.number).includes(q)
      if (!matchesTitle && !matchesAuthor && !matchesNumber) return false
    }

    return true
  })
})

const openIssueDetails = (issue: GitHubIssue) => {
  selectedIssue.value = issue
  router.replace({ query: { ...route.query, id: issue.number } })
}

watch(() => route.query.id, (newId) => {
  if (newId) {
    const found = repoStore.issues.find(i => String(i.number) === String(newId))
    if (found) selectedIssue.value = found
  }
}, { immediate: true })

watch([stateFilter, searchQuery, selectedLabel], ([state, search, label]) => {
  const query: Record<string, string> = {}
  if (state !== 'all') query.state = state
  if (search) query.search = search
  if (label !== 'all') query.label = label
  if (selectedIssue.value) query.id = String(selectedIssue.value.number)
  router.replace({ query })
})

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatAge = (iso: string) => {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}
</script>
