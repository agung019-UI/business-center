import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardService } from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSummary() {
    loading.value = true
    error.value = null
    try {
      summary.value = await dashboardService.getSummary()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, error, fetchSummary }
})

