export const receivablesService = {
  async getReceivables() {
    const stored = localStorage.getItem('bcs_receivables')
    return stored ? JSON.parse(stored) : [
      { id: 1, name: 'Pak Pardi', item: 'j water', qty: 10, price: 70000, status: 'BELUM LUNAS', date: new Date().toISOString() },
      { id: 2, name: 'MISS NANA', item: 'JOYKO COMET', qty: 1, price: 4000, status: 'BELUM LUNAS', date: new Date().toISOString() },
      { id: 3, name: 'KAS AKL', item: 'HVS', qty: 20, price: 2500, status: 'BELUM LUNAS', date: new Date().toISOString() },
      { id: 4, name: 'BU IKA', item: 'PUCUK', qty: 8, price: 24000, status: 'BELUM LUNAS', date: new Date().toISOString() },
    ]
  },

  async createReceivable(payload) {
    const data = await this.getReceivables()
    const newItem = {
      id: Date.now(),
      name: payload.name,
      item: payload.item,
      qty: Number(payload.qty) || 1,
      price: Number(payload.price) || 0,
      status: 'BELUM LUNAS',
      date: new Date().toISOString()
    }
    data.unshift(newItem)
    localStorage.setItem('bcs_receivables', JSON.stringify(data))
    return newItem
  },

  async markAsPaid(id) {
    const data = await this.getReceivables()
    const idx = data.findIndex(d => d.id === id)
    if (idx !== -1) {
      data[idx].status = 'LUNAS'
      localStorage.setItem('bcs_receivables', JSON.stringify(data))
    }
  },

  async deleteReceivable(id) {
    let data = await this.getReceivables()
    data = data.filter(d => d.id !== id)
    localStorage.setItem('bcs_receivables', JSON.stringify(data))
  }
}

