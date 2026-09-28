import api from './api'

export const salesService = {
  /**
   * GET /api/ambil_semua_penjualan
   */
  async getSales(params = {}) {
    const { data } = await api.get('/api/ambil_semua_penjualan')
    let sales = []
    
    if (data.data) {
      sales = data.data.map(s => ({
        id: s.id_penjualan,
        date: s.tanggal_penjualan,
        invoice_no: `INV-${s.id_penjualan}`,
        cashier_name: s.nama_kasir,
        customer_name: 'Walk-in Customer',
        total: s.total_bayar,
        payment_method: s.nama_metode || (s.id_metode_pembayaran === 1 ? 'CASH' : 'QRIS'),
        items: s.items ? s.items.map(i => ({
          name: i.nama_barang,
          qty: i.kuantitas,
          price: i.harga_satuan,
          subtotal: i.total_harga
        })) : []
      }))
    }
    
    // Sort by date descending
    sales.sort((a, b) => new Date(b.date) - new Date(a.date))
    return sales
  },

  async getSale(id) {
    const sales = await this.getSales()
    const sale = sales.find(s => s.id === Number(id))
    if (!sale) throw new Error('Data tidak ditemukan')
    return sale
  },

  /**
   * POST /api/konfirmasi_pembayaran
   */
  async createSale(payload) {
    const token = localStorage.getItem('bcs_token')
    let id_kasir = '000000'
    if (token) {
      const stored = localStorage.getItem(`bcs_user_${token}`)
      if (stored) {
        const user = JSON.parse(stored)
        id_kasir = user.id
      }
    }

    const today = new Date().toISOString().split('T')[0]

    // Determine payment method ID
    let id_metode = 1 // Default CASH
    const methodName = (payload.payment_method || '').toUpperCase()
    if (methodName.includes('QR') || methodName.includes('TRANSFER')) {
      id_metode = 2
    } else if (methodName.includes('CARD') || methodName.includes('DEBIT')) {
      id_metode = 3
    }

    // Ambil stok kedaluwarsa untuk memetakan tanggal kedaluwarsa yang tepat
    let expData = []
    try {
      const expReq = await api.get('/api/ambil_stok_kedaluwarsa')
      expData = expReq.data?.datas || []
    } catch (e) {
      console.warn('Gagal memuat tanggal kedaluwarsa', e)
    }

    const finalItems = []

    for (const item of payload.items) {
      let remainingQty = item.qty
      // Cari stok untuk barang ini, urutkan berdasarkan tanggal kedaluwarsa (terdekat dulu)
      const batches = expData
        .filter(e => e.id_barang === item.product_id && e.stok > 0)
        .sort((a, b) => new Date(a.tanggal_kedaluwarsa) - new Date(b.tanggal_kedaluwarsa))

      for (const batch of batches) {
        if (remainingQty <= 0) break
        
        const take = Math.min(remainingQty, batch.stok)
        finalItems.push({
          id_barang: item.product_id,
          tanggal_kedaluwarsa: batch.tanggal_kedaluwarsa,
          kuantitas: take,
          harga_satuan: item.price,
          total_harga: take * item.price
        })
        remainingQty -= take
      }

      // Jika masih ada sisa, paksa masukkan dengan tanggal hari ini
      if (remainingQty > 0) {
        finalItems.push({
          id_barang: item.product_id,
          tanggal_kedaluwarsa: today,
          kuantitas: remainingQty,
          harga_satuan: item.price,
          total_harga: remainingQty * item.price
        })
      }
    }

    const { data } = await api.post('/api/konfirmasi_pembayaran', {
      id_kasir: id_kasir,
      id_metode_pembayaran: id_metode,
      total_bayar: payload.total,
      tanggal_penjualan: today,
      items: finalItems
    })

    // Create a mock frontend response
    return {
      id: Date.now(),
      invoice_no: `INV-${Date.now()}`,
      date: today,
      total: payload.total,
      payment_method: payload.payment_method,
      items: payload.items
    }
  },
}
