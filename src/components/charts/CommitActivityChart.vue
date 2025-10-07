<template>
  <div class="w-full flex flex-col">
    <div ref="chartContainer" class="w-full h-52 sm:h-64 min-h-[200px]" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { CommitDayStat } from '@/types'
import { usePreferencesStore } from '@/stores/preferencesStore'

const props = withDefaults(
  defineProps<{
    data: CommitDayStat[]
    color?: string
  }>(),
  {
    color: '#1C1917' // charcoal ink default
  }
)

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const prefStore = usePreferencesStore()

const initChart = () => {
  if (!chartContainer.value) return
  if (chartInstance) chartInstance.dispose()

  chartInstance = echarts.init(chartContainer.value)
  updateOptions()
}

const updateOptions = () => {
  if (!chartInstance) return

  const isDark = prefStore.isDarkMode
  const strokeColor = isDark ? '#E4E4E7' : '#18181B'
  const gridLineColor = isDark ? '#27272A50' : '#E7E5E480'
  const textColor = isDark ? '#71717A' : '#A8A29E'

  const labels = props.data.map(d => d.label)
  const counts = props.data.map(d => d.count)

  const option: echarts.EChartsOption = {
    animationDuration: 300,
    backgroundColor: 'transparent',
    grid: {
      top: 15,
      right: 15,
      bottom: 25,
      left: 30,
      containLabel: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181B' : '#FFFFFF',
      borderColor: isDark ? '#27272A' : '#E7E5E4',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: isDark ? '#F4F4F5' : '#1C1917',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: isDark ? '#3F3F46' : '#D6D3D1',
          width: 1,
          type: 'dashed'
        }
      },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return ''
        const item = params[0]
        return `
          <div class="font-mono text-[11px] text-stone-400 mb-1">${item.axisValue}</div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100"></span>
            <span class="font-semibold text-stone-900 dark:text-stone-100">${item.value} commits</span>
          </div>
        `
      }
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLine: {
        lineStyle: { color: isDark ? '#27272A' : '#E7E5E4' }
      },
      axisLabel: {
        color: textColor,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        interval: Math.max(1, Math.floor(labels.length / 7))
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: {
        lineStyle: {
          color: gridLineColor,
          type: 'solid'
        }
      },
      axisLabel: {
        color: textColor,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10
      }
    },
    series: [
      {
        name: 'Commits',
        type: 'line',
        smooth: 0.25,
        showSymbol: false,
        lineStyle: {
          width: 1.5,
          color: strokeColor
        },
        itemStyle: {
          color: strokeColor
        },
        areaStyle: {
          color: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(24, 24, 27, 0.03)'
        },
        data: counts
      }
    ]
  }

  chartInstance.setOption(option, true)
}

onMounted(() => {
  initChart()
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    resizeObserver.observe(chartContainer.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chartInstance?.dispose()
})

watch(() => props.data, () => {
  updateOptions()
}, { deep: true })

watch(() => prefStore.isDarkMode, () => {
  updateOptions()
})
</script>
