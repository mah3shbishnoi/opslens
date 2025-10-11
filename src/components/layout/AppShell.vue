<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#FAFAF9] dark:bg-[#0F0F11] text-[#1C1917] dark:text-[#F4F4F5] font-sans antialiased">
    <!-- Narrow, quiet sidebar -->
    <Sidebar />

    <!-- Main Content Flow -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Compact Top Bar -->
      <TopBar />

      <!-- Sample Dataset / Rate Limit Notification Banner -->
      <RateLimitBanner />

      <!-- View Container -->
      <main class="flex-1 overflow-y-auto px-6 lg:px-10 py-6 min-w-0">
        <router-view />
      </main>
    </div>

    <!-- Modals & Command Palettes -->
    <RepoPickerModal />
    <SearchCommand />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import RateLimitBanner from '@/components/common/RateLimitBanner.vue'
import RepoPickerModal from '@/components/common/RepoPickerModal.vue'
import SearchCommand from '@/components/common/SearchCommand.vue'
import { useRepositoryStore } from '@/stores/repositoryStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const router = useRouter()
const repoStore = useRepositoryStore()
const prefStore = usePreferencesStore()

let pendingKey = ''
let pendingKeyTimer: ReturnType<typeof setTimeout> | null = null

const handleKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

  // Global Cmd+K / Ctrl+K
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    prefStore.openSearch()
    return
  }

  if (e.key === 'Escape') {
    if (prefStore.isSearchOpen) prefStore.closeSearch()
    if (prefStore.isRepoPickerOpen) prefStore.closeRepoPicker()
    return
  }

  if (isInput) return

  // Slash opens search
  if (e.key === '/') {
    e.preventDefault()
    prefStore.openSearch()
    return
  }

  // Quick theme toggle
  if (e.key === 't') {
    prefStore.toggleDarkMode()
    return
  }

  // Keyboard chord navigation (g o, g p, g i, g c, g r, g u)
  if (e.key === 'g' && !pendingKey) {
    pendingKey = 'g'
    if (pendingKeyTimer) clearTimeout(pendingKeyTimer)
    pendingKeyTimer = setTimeout(() => {
      pendingKey = ''
    }, 1000)
    return
  }

  if (pendingKey === 'g') {
    pendingKey = ''
    if (pendingKeyTimer) clearTimeout(pendingKeyTimer)

    switch (e.key) {
      case 'o':
        router.push('/')
        break
      case 'p':
        router.push('/pull-requests')
        break
      case 'i':
        router.push('/issues')
        break
      case 'c':
        router.push('/commits')
        break
      case 'r':
        router.push('/releases')
        break
      case 'u':
        router.push('/contributors')
        break
    }
  }
}

onMounted(() => {
  prefStore.applyTheme()
  repoStore.loadRepository()
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (pendingKeyTimer) clearTimeout(pendingKeyTimer)
})
</script>
