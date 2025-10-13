<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          Commit Activity Stream
        </h1>
        <p class="text-xs text-stone-500 mt-0.5">
          Chronological timeline of code revisions and signed merges on {{ repoStore.currentRepo }}.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative w-64">
          <Search class="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search commits by message or author..."
            class="w-full bg-white dark:bg-stone-900 text-xs pl-8 pr-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-800 focus:outline-hidden font-mono"
          />
        </div>
      </div>
    </div>

    <!-- Timeline Grouping by Date -->
    <div class="space-y-8">
      <div v-for="group in groupedCommits" :key="group.date" class="space-y-3">
        <!-- Date Marker -->
        <div class="sticky top-12 z-10 bg-[#FAFAF9]/90 dark:bg-[#0F0F11]/90 backdrop-blur-xs py-1 flex items-center gap-3">
          <Calendar class="w-3.5 h-3.5 text-stone-400" />
          <span class="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
            Commits on {{ group.date }}
          </span>
          <div class="flex-1 h-px bg-stone-200 dark:border-stone-800"></div>
          <span class="text-[11px] font-mono text-stone-400">{{ group.items.length }} revisions</span>
        </div>

        <!-- Commits under this date -->
        <div class="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-stone-200 dark:before:bg-stone-800">
          <div
            v-for="c in group.items"
            :key="c.sha"
            class="relative text-xs bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-stone-800 rounded-lg p-3 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-subtle group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <!-- Timeline dot -->
            <span class="absolute -left-6 top-4 w-2 h-2 rounded-full bg-stone-400 border-2 border-white dark:border-[#18181B] group-hover:bg-blue-600 transition-colors" />

            <!-- Commit Content -->
            <div class="space-y-1">
              <div class="font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ c.commit.message.split('\n')[0] }}
              </div>

              <div class="flex items-center gap-3 text-[11px] font-mono text-stone-400">
                <div class="flex items-center gap-1.5">
                  <img
                    :src="c.author?.avatar_url || 'https://github.com/github.png'"
                    class="w-3.5 h-3.5 rounded-full"
                    alt="avatar"
                  />
                  <span class="text-stone-700 dark:text-stone-300">@{{ c.author?.login || c.commit.author.name }}</span>
                </div>
                <span>&bull;</span>
                <span>{{ formatTime(c.commit.author.date) }}</span>
              </div>
            </div>

            <!-- Commit Actions / SHA -->
            <div class="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                class="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-mono text-[11px] font-semibold border border-stone-200 dark:border-stone-700 flex items-center gap-1 cursor-pointer"
                title="Copy full SHA"
                @click="copySha(c.sha)"
              >
                <span>{{ c.sha.substring(0, 7) }}</span>
                <Copy class="w-3 h-3 text-stone-400" />
              </button>

              <a
                :href="c.html_url"
                target="_blank"
                rel="noopener noreferrer"
                class="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="View on GitHub"
              >
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="groupedCommits.length === 0" class="py-16 text-center text-xs text-stone-400 font-mono">
        No commit revisions match your search query.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Calendar, Copy, ExternalLink } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import type { GitHubCommitItem } from '@/types'

const repoStore = useRepositoryStore()
const searchQuery = ref('')

interface DateGroup {
  date: string
  items: GitHubCommitItem[]
}

const groupedCommits = computed<DateGroup[]>(() => {
  const filtered = repoStore.commits.filter(c => {
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.toLowerCase().trim()
    const msg = c.commit.message.toLowerCase()
    const author = (c.author?.login || c.commit.author.name).toLowerCase()
    const sha = c.sha.toLowerCase()
    return msg.includes(q) || author.includes(q) || sha.includes(q)
  })

  const map = new Map<string, GitHubCommitItem[]>()

  filtered.forEach(c => {
    const d = new Date(c.commit.author.date)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(c)
  })

  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
})

const formatTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const copySha = (sha: string) => {
  navigator.clipboard.writeText(sha)
}
</script>
