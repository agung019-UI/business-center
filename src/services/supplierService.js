import api from './api'

export const supplierService = {
  async getSuppliers(params = {}) {
    const { data } = await api.get('/suppliers', { params })
    return data
  },

  async getSupplier(id) {
    const { data } = await api.get(`/suppliers/${id}`)
    return data
  },

  async createSupplier(payload) {
    const { data } = await api.post('/suppliers', payload)
    return data
  },

  async updateSupplier(id, payload) {
    const { data } = await api.put(`/suppliers/${id}`, payload)
    return data
  },

  async deleteSupplier(id) {
    await api.delete(`/suppliers/${id}`)
  },
}

