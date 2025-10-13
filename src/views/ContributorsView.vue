<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          Contributor Directory
        </h1>
        <p class="text-xs text-stone-500 mt-0.5">
          Core maintainers and community engineers driving {{ repoStore.currentRepo }}.
        </p>
      </div>

      <div class="flex items-center gap-3 text-xs font-mono text-stone-500">
        <span>{{ repoStore.contributors.length }} Contributors Tracked</span>
        <span>&bull;</span>
        <span>Top: <strong class="text-stone-900 dark:text-stone-100">@{{ topContributor?.login || 'none' }}</strong></span>
      </div>
    </div>

    <!-- Data-Oriented Contributors Table -->
    <div class="bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden shadow-subtle">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-stone-50/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-stone-400 font-mono text-[11px]">
              <th class="py-2.5 px-4 font-medium w-16">Rank</th>
              <th class="py-2.5 px-3 font-medium">Contributor</th>
              <th class="py-2.5 px-3 font-medium text-right w-36">Commits</th>
              <th class="py-2.5 px-4 font-medium w-64">Relative Activity Share</th>
              <th class="py-2.5 px-4 font-medium text-right w-24">Profile</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100 dark:divide-stone-800/60">
            <tr
              v-for="(contrib, idx) in repoStore.contributors"
              :key="contrib.id"
              class="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
            >
              <!-- Rank -->
              <td class="py-3 px-4 font-mono text-stone-400 font-medium">
                #{{ idx + 1 }}
              </td>

              <!-- Contributor Info -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-2.5 font-mono">
                  <img
                    :src="contrib.avatar_url"
                    class="w-6 h-6 rounded-full border border-stone-200 dark:border-stone-700"
                    :alt="contrib.login"
                  />
                  <div>
                    <span class="font-semibold text-stone-900 dark:text-stone-100">@{{ contrib.login }}</span>
                    <span v-if="idx === 0" class="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
                      Lead Author
                    </span>
                  </div>
                </div>
              </td>

              <!-- Commits Count -->
              <td class="py-3 px-3 text-right font-mono font-semibold text-stone-900 dark:text-stone-100">
                {{ contrib.contributions.toLocaleString() }}
              </td>

              <!-- Share Bar -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-stone-900 dark:bg-stone-100 rounded-full"
                      :style="{ width: `${getSharePercentage(contrib.contributions)}%` }"
                    />
                  </div>
                  <span class="font-mono text-[11px] text-stone-400 w-10 text-right">
                    {{ getSharePercentage(contrib.contributions) }}%
                  </span>
                </div>
              </td>

              <!-- Link -->
              <td class="py-3 px-4 text-right">
                <a
                  :href="contrib.html_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-mono text-xs"
                >
                  <span>GitHub</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </td>
            </tr>

            <tr v-if="repoStore.contributors.length === 0">
              <td colspan="5" class="py-12 text-center text-xs text-stone-400 font-mono">
                No contributors recorded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'

const repoStore = useRepositoryStore()

const topContributor = computed(() => repoStore.contributors[0] || null)

const totalTopContributions = computed(() => {
  return repoStore.contributors.reduce((acc, c) => acc + c.contributions, 0) || 1
})

const getSharePercentage = (count: number) => {
  return Math.round((count / totalTopContributions.value) * 100)
}
</script>
