import api from './api'

export const categoryService = {
  async getCategories() {
    const { data } = await api.get('/api/ambil_kategori')
    // Mapping from backend format to frontend format
    // Backend: { datas: [{ Kategori: "Makanan", id_kategori: 1 }] }
    // Frontend expects array of objects with { id, name }
    if (data.datas) {
      return data.datas.map((item, index) => ({
        id: item.id_kategori || item.Kategori || index,
        name: item.Kategori,
        products_count: item.products_count || 0 // Not provided by API, defaulting to 0
      }))
    }
    return []
  },

  async createCategory(payload) {
    // payload from frontend: { name: "Makanan" }
    const { data } = await api.post('/api/kategori', {
      event: 'input',
      kategori: payload.name
    })
    return data
  },

  async updateCategory(id, payload) {
    // payload from frontend: { name: "Makanan" }
    const { data } = await api.put('/api/kategori', {
      event: 'edit',
      id_kategori: id,
      nama_kategori: payload.name
    })
    return data
  },

  async deleteCategory(id) {
    const { data } = await api.delete('/api/kategori', {
      data: {
        event: 'delete',
        id_kategori: id
      }
    })
    return data
  },
}
