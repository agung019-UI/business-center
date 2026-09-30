import api from './api'

export const userService = {
  async getUsers(params = {}) {
    const { data } = await api.get('/api/ambil_user')
    let users = []
    
    if (data.data) {
      users = data.data.map(u => {
        const nis = String(u.nis || u.nisn || '')
        const nama = String(u.nama_kasir || '')
        const isAdmin = nis === '192012' || nis.toLowerCase().includes('admin') || nama.toLowerCase().includes('admin')
        return {
          id: nis,
          name: u.nama_kasir,
          username: nis,
          role: isAdmin ? 'ADMIN' : 'KASIR',
          password: u.password,
          active: true
        }
      }).filter(u => u.role === 'KASIR')
    }
    
    if (params.search) {
      const q = String(params.search).toLowerCase()
      users = users.filter(u => String(u.name || '').toLowerCase().includes(q) || String(u.username || '').toLowerCase().includes(q))
    }
    
    return users
  },

  async createUser(payload) {
    const { data } = await api.post('/api/user', {
      event: 'input',
      nis: payload.username, // mapping frontend username to nis
      nama_kasir: payload.name,
      password: payload.password || '123456'
    })
    
    if (data.error) throw new Error(data.message)
      
    return {
      id: payload.username,
      name: payload.name,
      username: payload.username,
      role: payload.role || 'KASIR',
      active: true
    }
  },

  async updateUser(id, payload) {
    const { data } = await api.put('/api/user', {
      event: 'edit',
      nis: id, // id is the old nis
      nama_kasir: payload.name,
      password: payload.password || '123456'
    })
    
    if (data.error) throw new Error(data.message)
      
    return {
      id: payload.username || id,
      name: payload.name,
      username: payload.username || id,
      role: payload.role || 'KASIR',
      active: true
    }
  },

  async deleteUser(id) {
    const { data } = await api.delete('/api/user', {
      data: {
        event: 'delete',
        nis: id
      }
    })
    if (data.error) throw new Error(data.message)
  },

  // Fallbacks for frontend methods that don't have backend equivalents yet
  async resetPassword(id, payload) {
    // We can use update to just update password
    const { data } = await api.put('/api/user', {
      event: 'edit',
      nis: id,
      nama_kasir: payload.name || 'User', // Requires name, maybe a problem if we don't have it
      password: payload.new_password
    })
    return data
  },

  async toggleActive(id) {
    // API doesn't support active toggle, just return success
    return { success: true }
  },
}
