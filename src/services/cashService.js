import api from './api'

export const cashService = {
  /**
   * GET /cash
   * Params: { type, date_from, date_to, page, per_page }
   */
  async getCashTransactions(params = {}) {
    const { data } = await api.get('/cash', { params })
    return data
  },

  /**
   * POST /cash
   * Body: { type (MASUK|KELUAR), category, description, amount }
   */
  async createCashTransaction(payload) {
    const { data } = await api.post('/cash', payload)
    return data
  },
}

