import api from './api'

export const purchaseService = {
  async getPurchases(params = {}) {
    const { data } = await api.get('/purchases', { params })
    return data
  },

  /**
   * POST /purchases
   * Body: { supplier_id, items, total, payment_method, note }
   */
  async createPurchase(payload) {
    const { data } = await api.post('/purchases', payload)
    return data
  },
}

