<template>
  <span
    class="inline-block text-[11px] font-mono px-2 py-0.5 rounded-md border transition-opacity select-none leading-tight"
    :style="customStyle"
    :title="label.description || label.name"
  >
    {{ label.name }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GitHubLabel } from '@/types'

const props = defineProps<{
  label: GitHubLabel
}>()

const customStyle = computed(() => {
  const hex = props.label.color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 0
  const g = parseInt(hex.substring(2, 4), 16) || 0
  const b = parseInt(hex.substring(4, 6), 16) || 0

  // Calculate perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const isLight = luminance > 0.6

  return {
    backgroundColor: `#${hex}18`, // 10% opacity background
    color: isLight ? '#1C1917' : `#${hex}`,
    borderColor: `#${hex}35`
  }
})
</script>
