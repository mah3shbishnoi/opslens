import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStoredToken, setStoredToken } from '@/api/github/client'

export const usePreferencesStore = defineStore('preferences', () => {
  // Theme: light-first!
  const isDarkMode = ref<boolean>(false)
  try {
    const savedTheme = localStorage.getItem('opslens-theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      isDarkMode.value = false // Default light mode
    }
  } catch {
    isDarkMode.value = false
  }

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('opslens-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('opslens-theme', 'light')
    }
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
  }

  // Personal access token
  const githubToken = ref<string>(getStoredToken())
  const updateToken = (token: string) => {
    githubToken.value = token
    setStoredToken(token)
  }

  // Modals
  const isSearchOpen = ref<boolean>(false)
  const isRepoPickerOpen = ref<boolean>(false)

  const openSearch = () => { isSearchOpen.value = true }
  const closeSearch = () => { isSearchOpen.value = false }
  const openRepoPicker = () => { isRepoPickerOpen.value = true }
  const closeRepoPicker = () => { isRepoPickerOpen.value = false }

  // Curated Preset Repositories for instant exploring
  const presetRepos = [
    { label: 'Vue.js Core', repo: 'vuejs/core', desc: 'The Progressive JavaScript Framework' },
    { label: 'React', repo: 'facebook/react', desc: 'The library for web and native user interfaces' },
    { label: 'Vite', repo: 'vitejs/vite', desc: 'Next Generation Frontend Tooling' },
    { label: 'Tailwind CSS', repo: 'tailwindlabs/tailwindcss', desc: 'Utility-first CSS framework' },
    { label: 'Deno', repo: 'denoland/deno', desc: 'Next-generation JavaScript runtime' },
  ]

  return {
    isDarkMode,
    applyTheme,
    toggleDarkMode,
    githubToken,
    updateToken,
    isSearchOpen,
    openSearch,
    closeSearch,
    isRepoPickerOpen,
    openRepoPicker,
    closeRepoPicker,
    presetRepos
  }
})
