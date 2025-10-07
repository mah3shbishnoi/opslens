<template>
  <div class="flex flex-col py-3 px-4 first:pl-0">
    <div class="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
      {{ label }}
    </div>

    <div class="mt-1 flex items-baseline gap-2">
      <span class="text-2xl lg:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 font-mono tabular-nums">
        {{ value }}
      </span>
      <span v-if="unit" class="text-xs font-mono text-stone-500 dark:text-stone-400">
        {{ unit }}
      </span>
    </div>

    <div v-if="subtext" class="mt-1 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
      <span>{{ subtext }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    unit?: string
    subtext?: string
  }>(),
  {
    unit: '',
    subtext: ''
  }
)
</script>
