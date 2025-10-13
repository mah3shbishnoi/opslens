<template>
  <div class="space-y-8 max-w-4xl mx-auto pb-12">
    <!-- Header -->
    <div class="border-b border-stone-200 dark:border-stone-800 pb-4">
      <h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
        Console Configuration & Data Connection
      </h1>
    </div>

    <div class="bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 rounded-lg divide-y divide-stone-100 dark:divide-stone-800 shadow-subtle">
      <!-- 1. Monitored Repository -->
      <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">Monitored Repository</h3>
          <p class="text-xs text-stone-500 mt-0.5">Currently analyzing operations for <code class="font-mono text-stone-800 dark:text-stone-200">{{ repoStore.currentRepo }}</code>.</p>
        </div>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold font-mono hover:opacity-90 transition-opacity self-start sm:self-auto"
          @click="prefStore.openRepoPicker"
        >
          Switch Repository
        </button>
      </div>

      <!-- 2. Optional GitHub Personal Access Token -->
      <div class="p-6 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">GitHub Personal Access Token</h3>
            <p class="text-xs text-stone-500 mt-0.5">
              Unauthenticated GitHub API calls are limited to 60 req/hour. Adding a classic token increases quota to <strong>5,000 req/hour</strong>.
            </p>
          </div>
          <span class="text-[11px] font-mono text-stone-400">Stored only in browser localStorage</span>
        </div>

        <div class="flex gap-2 max-w-lg">
          <input
            v-model="tokenInput"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            class="flex-1 bg-stone-50 dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-stone-100 px-3 py-2 rounded-md border border-stone-200 dark:border-stone-800 focus:outline-hidden"
          />
          <button
            type="button"
            class="px-3 py-2 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            @click="saveToken"
          >
            Save
          </button>
          <button
            v-if="prefStore.githubToken"
            type="button"
            class="px-3 py-2 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-medium hover:bg-rose-100"
            @click="removeToken"
          >
            Clear
          </button>
        </div>

        <div v-if="tokenSavedMessage" class="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
          {{ tokenSavedMessage }}
        </div>
      </div>

      <!-- 3. Current Rate Limit State -->
      <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">API Quota Remaining</h3>
          <p class="text-xs text-stone-500 mt-0.5">
            Reset scheduled at {{ repoStore.rateLimit.resetTime.toLocaleTimeString() }}.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-base font-bold text-stone-900 dark:text-stone-100">
            {{ repoStore.rateLimit.remaining }} / {{ repoStore.rateLimit.limit }}
          </span>
          <span class="text-xs text-stone-400 font-mono">calls</span>
        </div>
      </div>

      <!-- 4. Architecture Documentation -->
      <div class="p-6 space-y-3">
        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">Architecture & Telemetry Pipeline</h3>
        <p class="text-xs text-stone-500 leading-relaxed">
          OpsLens connects to the official <strong>GitHub REST API v3</strong>. All requests go directly from your browser to <code>api.github.com</code> with client-side header rate-limit evaluation. If rate limits are exhausted, OpsLens seamlessly switches to an offline fallback snapshot and explicitly reports it.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-stone-500 pt-2">
          <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200/60 dark:border-stone-800/60">
            <span class="text-[10px] uppercase text-stone-400">Endpoints Queried</span>
            <ul class="text-[11px] text-stone-700 dark:text-stone-300 mt-1 space-y-0.5">
              <li>&bull; GET /repos/{owner}/{repo}</li>
              <li>&bull; GET /repos/{owner}/{repo}/pulls</li>
              <li>&bull; GET /repos/{owner}/{repo}/issues</li>
              <li>&bull; GET /repos/{owner}/{repo}/commits</li>
              <li>&bull; GET /repos/{owner}/{repo}/releases</li>
              <li>&bull; GET /repos/{owner}/{repo}/contributors</li>
            </ul>
          </div>
          <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200/60 dark:border-stone-800/60">
            <span class="text-[10px] uppercase text-stone-400">Derived Telemetry Formulas</span>
            <ul class="text-[11px] text-stone-700 dark:text-stone-300 mt-1 space-y-0.5">
              <li>&bull; Open Work = open_issues + open_prs</li>
              <li>&bull; Merge Velocity = avg(merged_at - created_at)</li>
              <li>&bull; Release Cadence = avg(release_delta_days)</li>
              <li>&bull; Resolution Ratio = closed / (open + closed)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRepositoryStore } from '@/stores/repositoryStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const repoStore = useRepositoryStore()
const prefStore = usePreferencesStore()

const tokenInput = ref(prefStore.githubToken)
const tokenSavedMessage = ref('')

const saveToken = () => {
  prefStore.updateToken(tokenInput.value.trim())
  tokenSavedMessage.value = 'GitHub token saved. Reloading repository...'
  repoStore.loadRepository()
  setTimeout(() => {
    tokenSavedMessage.value = ''
  }, 3000)
}

const removeToken = () => {
  tokenInput.value = ''
  prefStore.updateToken('')
  tokenSavedMessage.value = 'Token removed. Reverted to unauthenticated quota.'
  repoStore.loadRepository()
  setTimeout(() => {
    tokenSavedMessage.value = ''
  }, 3000)
}
</script>
