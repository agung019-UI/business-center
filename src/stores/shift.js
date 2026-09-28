import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { shiftService } from '@/services/shiftService'

export const useShiftStore = defineStore('shift', () => {
  const currentShift = ref(null)
  const shifts = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  const hasActiveShift = computed(() => currentShift.value?.status === 'OPEN')

  async function fetchCurrentShift() {
    loading.value = true
    try {
      const data = await shiftService.getCurrentShift()
      currentShift.value = data.data || data || null
    } catch {
      currentShift.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchShifts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await shiftService.getShifts(params)
      shifts.value = Array.isArray(data) ? data : (data.data || [])
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function openShift(payload) {
    saving.value = true
    try {
      const data = await shiftService.openShift(payload)
      currentShift.value = data.data || data
      shifts.value.unshift(currentShift.value)
      return currentShift.value
    } finally {
      saving.value = false
    }
  }

  async function closeShift(id, payload) {
    saving.value = true
    try {
      const data = await shiftService.closeShift(id, payload)
      const closed = data.data || data
      currentShift.value = null
      const idx = shifts.value.findIndex((s) => s.id === id)
      if (idx !== -1) shifts.value[idx] = closed
      return closed
    } finally {
      saving.value = false
    }
  }

  return {
    currentShift,
    shifts,
    loading,
    saving,
    error,
    hasActiveShift,
    fetchCurrentShift,
    fetchShifts,
    openShift,
    closeShift,
  }
})

