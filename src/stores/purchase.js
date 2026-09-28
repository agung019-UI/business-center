import { defineStore } from 'pinia'
import { ref } from 'vue'
import { purchaseService } from '@/services/purchaseService'

export const usePurchaseStore = defineStore('purchase', () => {
  const purchases = ref([])
  const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchPurchases(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await purchaseService.getPurchases(params)
      if (Array.isArray(data)) {
        purchases.value = data
      } else {
        purchases.value = data.data || []
        if (data.meta) pagination.value = data.meta
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createPurchase(payload) {
    saving.value = true
    try {
      const data = await purchaseService.createPurchase(payload)
      const purchase = data.data || data
      purchases.value.unshift(purchase)
      return purchase
    } finally {
      saving.value = false
    }
  }

  return {
    purchases,
    pagination,
    loading,
    saving,
    error,
    fetchPurchases,
    createPurchase,
  }
})

