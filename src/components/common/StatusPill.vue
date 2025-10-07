<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-mono text-[11px] font-medium px-2 py-0.5 rounded-full select-none border',
      styleClasses
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', dotClass]" />
    <span class="capitalize">{{ label || status }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'open' | 'merged' | 'closed' | 'draft' | string
    label?: string
  }>(),
  {
    label: ''
  }
)

const normalized = computed(() => props.status.toLowerCase())

const styleClasses = computed(() => {
  switch (normalized.value) {
    case 'open':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'merged':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    case 'closed':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    case 'draft':
    default:
      return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
  }
})

const dotClass = computed(() => {
  switch (normalized.value) {
    case 'open':
      return 'bg-emerald-500'
    case 'merged':
      return 'bg-purple-500'
    case 'closed':
      return 'bg-rose-500'
    default:
      return 'bg-stone-400'
  }
})
</script>
