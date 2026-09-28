import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService } from '@/services/productService'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await productService.getProducts(params)
      // Support both paginated { data, meta } and plain array responses
      if (Array.isArray(data)) {
        products.value = data
      } else {
        products.value = data.data || []
        if (data.meta) pagination.value = data.meta
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createProduct(payload) {
    const data = await productService.createProduct(payload)
    products.value.unshift(data.data || data)
    return data
  }

  async function updateProduct(id, payload) {
    const data = await productService.updateProduct(id, payload)
    const updated = data.data || data
    const idx = products.value.findIndex((p) => p.id === id)
    if (idx !== -1) products.value[idx] = updated
    return updated
  }

  async function deleteProduct(id) {
    await productService.deleteProduct(id)
    products.value = products.value.filter((p) => p.id !== id)
  }

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})

