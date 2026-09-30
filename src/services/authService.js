import api from './api'

export const authService = {
  async login(username, password) {
    // Hardcode Admin Account
    if (username === 'Admin' && password === 'Admin123') {
      const user = { id: 'admin-1', username: 'Admin', name: 'Super Admin', role: 'ADMIN' }
      const token = 'token-admin-1'
      localStorage.setItem(`bcs_user_${token}`, JSON.stringify(user))
      return { token, user }
    }

    const { data } = await api.post('/api/login_user', {
      nis: username,
      password: password
    })

    if (data.error) {
      throw new Error(data.message || 'Login gagal')
    }

    const userData = data.data
    // Menentukan role sementara (karena API belum punya field role)
    // Jika NIS-nya 192012 atau mengandung kata admin, jadikan ADMIN, sisanya KASIR
    const isAdmin = userData.nis === '192012' || userData.nis.toLowerCase().includes('admin') || (userData.nama_kasir || '').toLowerCase().includes('admin')

    const user = {
      id: userData.nis,
      username: userData.nis,
      name: userData.nama_kasir,
      role: isAdmin ? 'ADMIN' : 'KASIR',
    }

    // Since there's no JWT token, we'll use a dummy token to satisfy the frontend store
    const token = `token-${userData.nis}`
    localStorage.setItem(`bcs_user_${token}`, JSON.stringify(user))

    return { token, user }
  },

  async logout() {
    const token = localStorage.getItem('bcs_token')
    if (token) {
      localStorage.removeItem(`bcs_user_${token}`)
    }
    // No backend logout endpoint provided
  },

  async me() {
    const token = localStorage.getItem('bcs_token')
    const stored = token ? localStorage.getItem(`bcs_user_${token}`) : null

    if (!stored) {
      throw new Error('Sesi tidak valid.')
    }

    return { user: JSON.parse(stored) }
  },
}
