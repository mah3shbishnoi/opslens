<template>
  <div class="space-y-10 max-w-6xl mx-auto pb-12">
    <!-- 1. Repository Identity Band (Editorial Header) -->
    <section class="border-b border-stone-200 dark:border-stone-800 pb-8">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <!-- Org / Name -->
          <div class="flex items-center gap-2 text-xs font-mono text-stone-500 mb-1.5">
            <span class="text-stone-400">repo:</span>
            <span class="text-stone-700 dark:text-stone-300">{{ repoStore.repository?.owner.login || 'owner' }}</span>
            <span>/</span>
            <span class="text-stone-900 dark:text-stone-100 font-semibold">{{ repoStore.repository?.name || 'repository' }}</span>
          </div>

          <h1 class="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {{ repoStore.repository?.full_name || repoStore.currentRepo }}
          </h1>

          <p class="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-2xl leading-relaxed">
            {{ repoStore.repository?.description || 'Repository operations and engineering activity analysis.' }}
          </p>

          <!-- Language, License, Topics -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-mono text-stone-500">
            <span v-if="repoStore.repository?.language" class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{{ repoStore.repository.language }}</span>
            </span>
            <span v-if="repoStore.repository?.license" class="flex items-center gap-1">
              <span>License:</span>
              <strong class="text-stone-700 dark:text-stone-300">{{ repoStore.repository.license.name }}</strong>
            </span>
            <span class="flex items-center gap-1">
              <span>Branch:</span>
              <strong class="text-stone-700 dark:text-stone-300 font-mono">{{ repoStore.repository?.default_branch || 'main' }}</strong>
            </span>
            <a
              v-if="repoStore.repository?.html_url"
              :href="repoStore.repository.html_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 hover:underline"
            >
              <span>GitHub</span>
              <ExternalLink class="w-3 h-3" />
            </a>
          </div>
        </div>

        <!-- Inline Key Metadata Numbers (No giant cards!) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 self-start md:self-auto shrink-0 border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800 pt-4 md:pt-0 md:pl-8">
          <div>
            <div class="text-[11px] font-mono uppercase text-stone-400">Stars</div>
            <div class="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
              {{ (repoStore.repository?.stargazers_count || 0).toLocaleString() }}
            </div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase text-stone-400">Forks</div>
            <div class="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
              {{ (repoStore.repository?.forks_count || 0).toLocaleString() }}
            </div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase text-stone-400">Open PRs</div>
            <div class="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
              {{ repoStore.openPRsCount }}
            </div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase text-stone-400">Open Work</div>
            <div class="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
              {{ repoStore.openWorkCount }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Engineering Activity (Large Primary Visualization) -->
    <section class="border-b border-stone-200 dark:border-stone-800 pb-8 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h2 class="text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 font-mono">
            Engineering Activity & Commit Trajectory
          </h2>
          <p class="text-xs text-stone-500 mt-0.5">
            Daily commit throughput across the main branch over the past 30 days.
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono text-stone-500">
          <span>Total: <strong class="text-stone-900 dark:text-stone-100">{{ repoStore.commits.length }} recent commits</strong></span>
          <span>&bull;</span>
          <span>Cadence: <strong class="text-stone-900 dark:text-stone-100">{{ (repoStore.commits.length / 30).toFixed(1) }}/day avg</strong></span>
        </div>
      </div>

      <!-- Restrained Chart Surface -->
      <div class="bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 rounded-lg p-4 shadow-subtle">
        <CommitActivityChart :data="repoStore.commitActivityTrend" />
      </div>
    </section>

    <!-- 3. Two-Column Operational Flow: Pull Request Flow vs Issue Flow -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-stone-200 dark:border-stone-800 pb-8">
      <!-- Left: Pull Request Flow -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <GitPullRequest class="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono">
              Pull Request Velocity
            </h3>
          </div>
          <router-link to="/pull-requests" class="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-mono flex items-center gap-1">
            <span>Inspect All</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- Horizontal Stat Strip -->
        <div class="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800 py-3 bg-stone-50/50 dark:bg-stone-900/40">
          <div class="px-3">
            <div class="text-[10px] font-mono uppercase text-stone-400">Open PRs</div>
            <div class="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {{ repoStore.openPRsCount }}
            </div>
          </div>
          <div class="px-3">
            <div class="text-[10px] font-mono uppercase text-stone-400">Merged</div>
            <div class="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
              {{ repoStore.mergedPRsCount }}
            </div>
          </div>
          <div class="px-3">
            <div class="text-[10px] font-mono uppercase text-stone-400">Avg. Merge Time</div>
            <div class="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {{ repoStore.avgMergeTimeFormatted }}
            </div>
          </div>
        </div>

        <!-- Recent PR snippets -->
        <div class="space-y-2">
          <div
            v-for="pr in repoStore.pullRequests.slice(0, 4)"
            :key="pr.id"
            class="p-2.5 rounded hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors flex items-start justify-between gap-3 text-xs group cursor-pointer border border-transparent hover:border-stone-200/60 dark:hover:border-stone-700/60"
            @click="$router.push(`/pull-requests?id=${pr.number}`)"
          >
            <div class="truncate">
              <div class="font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                #{{ pr.number }} {{ pr.title }}
              </div>
              <div class="text-[11px] text-stone-400 font-mono mt-0.5">
                by @{{ pr.user.login }} &bull; {{ formatDate(pr.created_at) }}
              </div>
            </div>
            <StatusPill :status="pr.merged_at ? 'merged' : pr.state" size="sm" class="shrink-0" />
          </div>
        </div>
      </div>

      <!-- Right: Issue Resolution Flow -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono">
              Issue Resolution Ratio
            </h3>
          </div>
          <router-link to="/issues" class="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-mono flex items-center gap-1">
            <span>Inspect All</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- Horizontal Stat Strip -->
        <div class="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800 py-3 bg-stone-50/50 dark:bg-stone-900/40">
          <div class="px-3">
            <div class="text-[10px] font-mono uppercase text-stone-400">Open Issues</div>
            <div class="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {{ repoStore.openIssuesCount }}
            </div>
          </div>
          <div class="px-3">
            <div class="text-[10px] font-mono uppercase text-stone-400">Closed (Sample)</div>
            <div class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ repoStore.closedIssuesCount }}
            </div>
          </div>
          <div class="px-3">
            <div class="text-[10px] font-mono uppercase text-stone-400">Resolution Rate</div>
            <div class="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {{ repoStore.issueResolutionRatio }}%
            </div>
          </div>
        </div>

        <!-- Recent Issue snippets -->
        <div class="space-y-2">
          <div
            v-for="issue in repoStore.issues.slice(0, 4)"
            :key="issue.id"
            class="p-2.5 rounded hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors flex items-start justify-between gap-3 text-xs group cursor-pointer border border-transparent hover:border-stone-200/60 dark:hover:border-stone-700/60"
            @click="$router.push(`/issues?id=${issue.number}`)"
          >
            <div class="truncate">
              <div class="font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                #{{ issue.number }} {{ issue.title }}
              </div>
              <div class="text-[11px] text-stone-400 font-mono mt-0.5">
                by @{{ issue.user.login }} &bull; {{ formatDate(issue.created_at) }}
              </div>
            </div>
            <StatusPill :status="issue.state" size="sm" class="shrink-0" />
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Recent Milestone Release & Chronological Activity Feed -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Latest Release Milestone (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Tag class="w-4 h-4 text-stone-500" />
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono">
              Latest Release Milestone
            </h3>
          </div>
          <router-link to="/releases" class="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-mono">
            All Releases →
          </router-link>
        </div>

        <div v-if="latestRelease" class="bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 rounded-lg p-5 space-y-3 shadow-subtle">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-mono font-bold text-xs">
              {{ latestRelease.tag_name }}
            </span>
            <span class="text-xs font-mono text-stone-400">
              Published {{ formatDate(latestRelease.published_at) }}
            </span>
          </div>

          <h4 class="text-base font-semibold text-stone-900 dark:text-stone-100">
            {{ latestRelease.name || latestRelease.tag_name }}
          </h4>

          <div class="text-xs font-mono text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/60 p-3 rounded border border-stone-200/60 dark:border-stone-800/60 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {{ latestRelease.body || 'No release notes provided.' }}
          </div>

          <div class="flex items-center justify-between text-xs font-mono text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>By @{{ latestRelease.author?.login || 'maintainer' }}</span>
            <span>Cadence: {{ repoStore.releaseCadenceFormatted }}</span>
          </div>
        </div>

        <div v-else class="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-400 font-mono">
          No published releases found for this repository.
        </div>
      </div>

      <!-- Chronological Unified Activity Feed (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Activity class="w-4 h-4 text-stone-500" />
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono">
              Engineering Chronology
            </h3>
          </div>
          <span class="text-xs font-mono text-stone-400">
            Real-time activity stream
          </span>
        </div>

        <!-- Chronological List -->
        <div class="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-stone-200 dark:before:bg-stone-800">
          <div
            v-for="item in repoStore.activityFeed.slice(0, 8)"
            :key="item.id"
            class="relative text-xs group"
          >
            <!-- Timeline dot -->
            <span
              :class="[
                'absolute -left-6 top-1.5 w-2 h-2 rounded-full border-2 border-[#FAFAF9] dark:border-[#0F0F11]',
                item.type === 'pr_merged' ? 'bg-purple-500' :
                item.type === 'pr_opened' ? 'bg-emerald-500' :
                item.type === 'release_published' ? 'bg-stone-900 dark:bg-stone-100' :
                'bg-blue-500'
              ]"
            />

            <div class="flex items-baseline justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-stone-900 dark:text-stone-100">
                  {{ item.title }}
                </span>
              </div>
              <span class="text-[11px] font-mono text-stone-400 shrink-0">
                {{ formatRelative(item.timestamp) }}
              </span>
            </div>

            <div class="text-[11px] font-mono text-stone-400 mt-0.5 flex items-center gap-2">
              <span>by @{{ item.author.login }}</span>
              <span v-if="item.meta">&bull; {{ item.meta }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ExternalLink,
  GitPullRequest,
  AlertCircle,
  Tag,
  Activity,
  ArrowRight
} from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import CommitActivityChart from '@/components/charts/CommitActivityChart.vue'
import StatusPill from '@/components/common/StatusPill.vue'

const repoStore = useRepositoryStore()

const latestRelease = computed(() => {
  return repoStore.releases[0] || null
})

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelative = (iso: string) => {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>
