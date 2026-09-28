import { defineStore } from 'pinia'
import { ref } from 'vue'
import { salesService } from '@/services/salesService'

export const useSalesStore = defineStore('sales', () => {
  const sales = ref([])
  const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchSales(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await salesService.getSales(params)
      if (Array.isArray(data)) {
        sales.value = data
      } else {
        sales.value = data.data || []
        if (data.meta) pagination.value = data.meta
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createSale(payload) {
    saving.value = true
    try {
      const data = await salesService.createSale(payload)
      const sale = data.data || data
      sales.value.unshift(sale)
      return sale
    } finally {
      saving.value = false
    }
  }

  return {
    sales,
    pagination,
    loading,
    saving,
    error,
    fetchSales,
    createSale,
  }
})

