import api from './api'

export const productService = {
  /**
   * GET /api/ambil_barang
   */
  async getProducts(params = {}) {
    const { data } = await api.get('/api/ambil_barang')
    
    let products = []
    if (data.datas) {
      products = data.datas.map(item => ({
        id: item.id_barang,
        name: item.nama_barang,
        category: item.nama_kategori, // frontend uses this
        category_id: item.nama_kategori, 
        sell_price: item.harga_jual,
        cost_price: item.harga_beli,
        stock: item.total_stok || 0,
        unit: item.satuan,
        barcode: item.id_barang,
        code: item.id_barang,
        min_stock: 5, // fallback since backend doesn't provide
        active: true
      }))
    }

    // Client-side filtering since backend doesn't support params yet
    if (params.search) {
      const q = params.search.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode.toLowerCase().includes(q)
      )
    }
    if (params.category) {
      products = products.filter(p => p.category === params.category)
    }

    return products // Return array, store handles it
  },

  /**
   * GET /api/ambil_barang/{id}
   */
  async getProduct(id) {
    const { data } = await api.get(`/api/ambil_barang/${id}`)
    const item = data.datas || data.data
    if (!item) throw new Error('Data tidak ditemukan')
    
    return {
      id: item.id_barang,
      name: item.nama_barang,
      category: item.nama_kategori,
      sell_price: item.harga_jual,
      cost_price: item.harga_beli,
      unit: item.satuan,
      barcode: item.id_barang,
      code: item.id_barang,
      list_tanggal_exp: item.list_tanggal_exp || []
    }
  },

  /**
   * POST /api/barang
   */
  async createProduct(payload) {
    const { data } = await api.post('/api/barang', {
      event: 'input',
      IdBarang: payload.barcode || String(Date.now()), // Assuming barcode is used as IdBarang
      Kategori: payload.category_id,
      NamaBarang: payload.name,
      HargaJual: Number(payload.sell_price) || 0,
      Kuantitas: Number(payload.stock) || 0,
      TanggalExpBarang: payload.exp_date || new Date().toISOString().split('T')[0], // Add default if missing
      HargaBeli: Number(payload.cost_price) || 0,
      Satuan: payload.unit || 'Pcs'
    })
    
    // Construct a frontend-compatible response object since backend just returns message
    return {
      id: payload.barcode,
      name: payload.name,
      category: payload.category_id,
      sell_price: payload.sell_price,
      cost_price: payload.cost_price,
      stock: payload.stock,
      unit: payload.unit,
      barcode: payload.barcode,
      code: payload.barcode
    }
  },

  /**
   * PUT /api/barang
   */
  async updateProduct(id, payload) {
    const { data } = await api.put('/api/barang', {
      event: 'edit',
      IdBarang: id,
      Kategori: payload.category_id,
      NamaBarang: payload.name,
      HargaJual: Number(payload.sell_price) || 0,
      Kuantitas: Number(payload.stock) || 0,
      TanggalExpBarang: payload.exp_date || new Date().toISOString().split('T')[0],
      HargaBeli: Number(payload.cost_price) || 0,
      Satuan: payload.unit || 'Pcs'
    })
    
    return {
      id: id,
      name: payload.name,
      category: payload.category_id,
      sell_price: payload.sell_price,
      cost_price: payload.cost_price,
      stock: payload.stock,
      unit: payload.unit,
      barcode: payload.barcode || id,
      code: payload.barcode || id
    }
  },

  /**
   * DELETE /api/barang
   */
  async deleteProduct(id) {
    await api.delete('/api/barang', {
      data: {
        event: 'delete',
        IdBarang: id
      }
    })
  },
}
