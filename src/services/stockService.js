import api from './api'

export const stockService = {
  /**
   * GET /api/ambil_total_stok
   */
  async getStock(params = {}) {
    const { data } = await api.get('/api/ambil_total_stok')
    let stock = []
    
    if (data.data) {
      stock = data.data.map(s => ({
        id: s.id_barang,
        product: {
          id: s.id_barang,
          name: s.nama_barang,
          barcode: s.id_barang,
          unit: 'Pcs'
        },
        stock: s.total_stok,
        min_stock: 5,
        status: s.total_stok > 5 ? 'AMAN' : (s.total_stok > 0 ? 'MENIPIS' : 'HABIS')
      }))
    }
    
    if (params.search) {
      const q = params.search.toLowerCase()
      stock = stock.filter(s => s.product.name.toLowerCase().includes(q))
    }
    
    return stock
  },

  /**
   * GET /api/ambil_stok_kedaluwarsa
   */
  async getMovements(params = {}) {
    // Re-purposing the movements endpoint to return expiry data since
    // backend doesn't have a movements history endpoint yet.
    const { data } = await api.get('/api/ambil_stok_kedaluwarsa')
    let moves = []
    
    if (data.datas) {
      moves = data.datas.map((s, index) => ({
        id: index,
        date: s.tanggal_kedaluwarsa,
        type: 'KEDALUWARSA',
        qty: s.stok,
        note: `Stok expire pada ${s.tanggal_kedaluwarsa}`,
        product: {
          id: s.id_barang,
          name: s.nama_barang,
          unit: 'Pcs'
        }
      }))
    }
    
    if (params.product_id) {
      moves = moves.filter(m => m.product.id === params.product_id)
    }
    
    return moves
  },

  /**
   * PUT /api/input_restok
   */
  async adjustStock(payload) {
    if (payload.type === 'MASUK' || (payload.type === 'PENYESUAIAN' && payload.qty > 0)) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await api.put('/api/input_restok', {
        IdBarang: payload.product_id,
        Kuantitas: Number(payload.qty),
        // Providing today's date if no expiry date provided
        TanggalExpBarang: payload.exp_date || today
      })
      return data
    } else {
      // API doesn't support stock deduction yet
      return { success: true, message: 'Simulasi pengeluaran stok (belum didukung backend)' }
    }
  },
}
