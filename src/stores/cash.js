import { defineStore } from 'pinia'
import { ref } from 'vue'
import { cashService } from '@/services/cashService'

export const useCashStore = defineStore('cash', () => {
  const transactions = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchTransactions(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await cashService.getCashTransactions(params)
      transactions.value = Array.isArray(data) ? data : (data.data || [])
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(payload) {
    saving.value = true
    try {
      const data = await cashService.createCashTransaction(payload)
      const tx = data.data || data
      transactions.value.unshift(tx)
      return tx
    } finally {
      saving.value = false
    }
  }

  return {
    transactions,
    loading,
    saving,
    error,
    fetchTransactions,
    createTransaction,
  }
})

