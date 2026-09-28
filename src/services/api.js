import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: 'https://server-busines-center-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
})

// ─── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bcs_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 401) {
      // Jika error dari endpoint login, tampilkan pesannya (misal: "NISN atau password salah")
      if (data && data.message) {
        return Promise.reject(new Error(data.message))
      }
      
      // Jika bukan dari login (session expired)
      const authStore = useAuthStore()
      authStore.clearSession()
      router.push({ name: 'Login' })
      return Promise.reject(new Error('Session Anda telah berakhir. Silakan login kembali.'))
    }

    if (status === 403) {
      return Promise.reject(new Error('Anda tidak memiliki akses untuk melakukan tindakan ini.'))
    }

    if (status === 422) {
      // Return validation errors for the form to handle
      const messages = data?.errors
        ? Object.values(data.errors).flat().join('\n')
        : data?.message || 'Terdapat kesalahan pada form.'
      return Promise.reject(new Error(messages))
    }

    if (status === 404) {
      return Promise.reject(new Error('Data tidak ditemukan.'))
    }

    if (status >= 500) {
      return Promise.reject(new Error('Terjadi kesalahan pada server. Silakan coba lagi.'))
    }

    // Network error / no response
    if (!error.response) {
      return Promise.reject(new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'))
    }

    return Promise.reject(error)
  },
)

export default api

