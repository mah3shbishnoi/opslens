<template>
  <div
    v-if="prefStore.isRepoPickerOpen"
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 select-none"
    @click.self="prefStore.closeRepoPicker"
  >
    <div
      class="w-full max-w-lg bg-white dark:bg-[#18181B] rounded-xl shadow-modal border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
    >
      <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">Switch Monitored Repository</h3>
          <p class="text-xs text-stone-500 mt-0.5">Select a public repository or enter custom owner/name</p>
        </div>
        <button
          type="button"
          class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
          @click="prefStore.closeRepoPicker"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Custom Input Form -->
      <form class="p-4 border-b border-stone-100 dark:border-stone-800/60" @submit.prevent="submitCustomRepo">
        <label class="block text-[11px] font-mono uppercase text-stone-500 mb-1.5">Custom Repository (owner/repo)</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">github.com/</span>
            <input
              v-model="customInput"
              type="text"
              placeholder="e.g. facebook/react"
              class="w-full bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 pl-24 pr-3 py-2 rounded-md border border-stone-200 dark:border-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-100 font-mono"
            />
          </div>
          <button
            type="submit"
            :disabled="!customInput.trim()"
            class="px-3 py-2 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Load
          </button>
        </div>
        <div v-if="validationError" class="mt-2 text-xs text-rose-500">
          {{ validationError }}
        </div>
      </form>

      <!-- Presets List -->
      <div class="p-4 space-y-2">
        <span class="text-[11px] font-mono uppercase text-stone-400">Curated Engineering Projects</span>
        <div class="space-y-1.5 max-h-60 overflow-y-auto">
          <div
            v-for="item in prefStore.presetRepos"
            :key="item.repo"
            :class="[
              'p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between',
              repoStore.currentRepo === item.repo
                ? 'bg-stone-50 dark:bg-stone-800/60 border-stone-400 dark:border-stone-600 font-medium'
                : 'border-stone-200/60 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
            ]"
            @click="selectPreset(item.repo)"
          >
            <div>
              <div class="font-mono text-stone-900 dark:text-stone-100">{{ item.repo }}</div>
              <div class="text-[11px] text-stone-500">{{ item.desc }}</div>
            </div>
            <span v-if="repoStore.currentRepo === item.repo" class="text-xs text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">Active</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useRepositoryStore } from '@/stores/repositoryStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const repoStore = useRepositoryStore()
const prefStore = usePreferencesStore()

const customInput = ref('')
const validationError = ref('')

const submitCustomRepo = () => {
  validationError.value = ''
  const trimmed = customInput.value.trim()
  if (!trimmed.includes('/')) {
    validationError.value = 'Please provide in the format "owner/repository" (e.g. facebook/react)'
    return
  }

  repoStore.loadRepository(trimmed)
  prefStore.closeRepoPicker()
  customInput.value = ''
}

const selectPreset = (repo: string) => {
  repoStore.loadRepository(repo)
  prefStore.closeRepoPicker()
}
</script>
