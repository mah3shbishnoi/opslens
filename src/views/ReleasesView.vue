<template>
  <div class="space-y-8 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          Releases & Milestones
        </h1>
        <p class="text-xs text-stone-500 mt-0.5">
          Software shipment cadence and changelog milestones for {{ repoStore.currentRepo }}.
        </p>
      </div>

      <div class="flex items-center gap-3 text-xs font-mono text-stone-500">
        <span>{{ repoStore.releases.length }} Tagged Releases</span>
        <span>&bull;</span>
        <span>Ship Cadence: <strong class="text-stone-900 dark:text-stone-100">{{ repoStore.releaseCadenceFormatted }}</strong></span>
      </div>
    </div>

    <!-- Latest Release Hero Milestone -->
    <div v-if="latestRelease" class="bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-8 shadow-subtle space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-mono font-bold text-sm">
            {{ latestRelease.tag_name }}
          </span>
          <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            &bull; Current Latest Stable
          </span>
        </div>

        <span class="text-xs font-mono text-stone-400">
          Published {{ formatDate(latestRelease.published_at) }}
        </span>
      </div>

      <h2 class="text-xl font-bold text-stone-900 dark:text-stone-100">
        {{ latestRelease.name || latestRelease.tag_name }}
      </h2>

      <!-- Markdown body / release summary -->
      <div class="p-4 rounded-lg bg-stone-50 dark:bg-stone-900 text-xs font-mono text-stone-700 dark:text-stone-300 whitespace-pre-wrap border border-stone-200/60 dark:border-stone-800/60 max-h-72 overflow-y-auto leading-relaxed">
        {{ latestRelease.body || 'No release notes provided.' }}
      </div>

      <div class="flex items-center justify-between text-xs font-mono text-stone-500 pt-3 border-t border-stone-100 dark:border-stone-800">
        <div class="flex items-center gap-1.5">
          <img
            :src="latestRelease.author?.avatar_url || 'https://github.com/github.png'"
            class="w-4 h-4 rounded-full"
            alt="avatar"
          />
          <span>Published by @{{ latestRelease.author?.login || 'maintainer' }}</span>
        </div>

        <a
          :href="latestRelease.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>GitHub Release Assets</span>
          <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </div>
    </div>

    <!-- Chronological Release History -->
    <div class="space-y-4">
      <h3 class="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
        Previous Milestones
      </h3>

      <div class="space-y-4">
        <div
          v-for="rel in pastReleases"
          :key="rel.id"
          class="bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-stone-800 rounded-lg p-5 shadow-subtle space-y-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">{{ rel.tag_name }}</span>
                <span v-if="rel.name && rel.name !== rel.tag_name" class="text-xs text-stone-500 font-medium">
                  &mdash; {{ rel.name }}
                </span>
              </div>
              <div class="text-[11px] font-mono text-stone-400 mt-0.5">
                Shipped on {{ formatDate(rel.published_at) }} by @{{ rel.author?.login || 'bot' }}
              </div>
            </div>

            <a
              :href="rel.html_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 font-mono"
            >
              <span>View Tag</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </a>
          </div>

          <div v-if="rel.body" class="p-3 bg-stone-50/70 dark:bg-stone-900/40 rounded border border-stone-200/40 dark:border-stone-800/40 text-xs font-mono text-stone-600 dark:text-stone-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
            {{ rel.body }}
          </div>
        </div>

        <div v-if="repoStore.releases.length === 0" class="py-16 text-center text-xs text-stone-400 font-mono">
          No releases recorded for this repository.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'

const repoStore = useRepositoryStore()

const latestRelease = computed(() => repoStore.releases[0] || null)
const pastReleases = computed(() => repoStore.releases.slice(1))

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
