import { defineStore } from 'pinia'
import { ref } from 'vue'
import { stockService } from '@/services/stockService'

export const useStockStore = defineStore('stock', () => {
  const stockList = ref([])
  const movements = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchStock(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await stockService.getStock(params)
      stockList.value = Array.isArray(data) ? data : (data.data || [])
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchMovements(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await stockService.getMovements(params)
      movements.value = Array.isArray(data) ? data : (data.data || [])
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function adjustStock(payload) {
    saving.value = true
    try {
      const data = await stockService.adjustStock(payload)
      // Refresh the item in list
      const updated = data.data || data
      const idx = stockList.value.findIndex((p) => p.id === updated.id)
      if (idx !== -1) stockList.value[idx] = { ...stockList.value[idx], ...updated }
      return updated
    } finally {
      saving.value = false
    }
  }

  return {
    stockList,
    movements,
    loading,
    saving,
    error,
    fetchStock,
    fetchMovements,
    adjustStock,
  }
})

