import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const items = ref([])
  const discountType = ref('nominal') // 'nominal' | 'persen'
  const discountValue = ref(0)
  const taxPercent = ref(0) // loaded from settings
  const paymentMethod = ref('CASH') // 'CASH' | 'QRIS'
  const cashReceived = ref('')

  // ─── Getters ──────────────────────────────────────────────────────────────
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.sell_price * i.qty, 0),
  )

  const discountAmount = computed(() => {
    if (discountType.value === 'persen') {
      return Math.round(subtotal.value * (Number(discountValue.value) || 0) / 100)
    }
    return Number(discountValue.value) || 0
  })

  const taxAmount = computed(() =>
    Math.round((subtotal.value - discountAmount.value) * (taxPercent.value || 0) / 100),
  )

  const total = computed(() =>
    Math.max(0, subtotal.value - discountAmount.value + taxAmount.value),
  )

  const change = computed(() =>
    Math.max(0, (Number(cashReceived.value) || 0) - total.value),
  )

  const isEmpty = computed(() => items.value.length === 0)

  // ─── Actions ──────────────────────────────────────────────────────────────
  function addItem(product) {
    const existing = items.value.find((i) => i.product_id === product.id)
    if (existing) {
      if (existing.qty + 1 > product.stock) return false
      existing.qty++
    } else {
      items.value.push({
        product_id: product.id,
        name: product.name,
        sell_price: product.sell_price,
        qty: 1,
        max_stock: product.stock,
        unit: product.unit,
        list_tanggal_exp: product.list_tanggal_exp || [],
        expiration_date: (product.list_tanggal_exp && product.list_tanggal_exp.length > 0) ? product.list_tanggal_exp[0].tanggal_exp : '',
      })
    }
    return true
  }

  function removeItem(productId) {
    items.value = items.value.filter((i) => i.product_id !== productId)
  }

  function increaseQty(productId, maxStock) {
    const item = items.value.find((i) => i.product_id === productId)
    if (!item) return false
    if (item.qty + 1 > (maxStock ?? item.max_stock)) return false
    item.qty++
    return true
  }

  function decreaseQty(productId) {
    const item = items.value.find((i) => i.product_id === productId)
    if (!item) return
    if (item.qty <= 1) {
      removeItem(productId)
    } else {
      item.qty--
    }
  }

  function clearCart() {
    items.value = []
    discountType.value = 'nominal'
    discountValue.value = 0
    cashReceived.value = ''
    paymentMethod.value = 'CASH'
  }

  function setDiscount(type, value) {
    discountType.value = type
    discountValue.value = value
  }

  function setPaymentMethod(method) {
    paymentMethod.value = method
    if (method !== 'CASH') {
      cashReceived.value = ''
    }
  }

  function setCashReceived(amount) {
    cashReceived.value = amount
  }

  function setTaxPercent(percent) {
    taxPercent.value = percent
  }

  function quickCash(amount) {
    cashReceived.value = String(amount)
  }

  return {
    items,
    discountType,
    discountValue,
    taxPercent,
    paymentMethod,
    cashReceived,
    itemCount,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    change,
    isEmpty,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
    setDiscount,
    setPaymentMethod,
    setCashReceived,
    setTaxPercent,
    quickCash,
  }
})

