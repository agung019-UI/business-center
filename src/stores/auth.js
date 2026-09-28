import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('bcs_token') || null)
  const loading = ref(false)
  const initialized = ref(false)

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isKasir = computed(() => user.value?.role === 'KASIR')
  const userRole = computed(() => user.value?.role || null)

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function login(username, password) {
    loading.value = true
    try {
      const data = await authService.login(username, password)
      // Expected: { token: '...', user: { id, name, username, role, ... } }
      token.value = data.token
      user.value = data.user
      localStorage.setItem('bcs_token', data.token)
      return data.user
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      if (token.value) {
        await authService.logout().catch(() => {}) // best-effort
      }
    } finally {
      clearSession()
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return null
    try {
      const data = await authService.me()
      user.value = data.user || data
      return user.value
    } catch {
      clearSession()
      return null
    }
  }

  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('bcs_token')
  }

  function setInitialized() {
    initialized.value = true
  }

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    isKasir,
    userRole,
    login,
    logout,
    fetchMe,
    clearSession,
    setInitialized,
  }
})

