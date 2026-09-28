<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useSalesStore } from '@/stores/sales'
import { useShiftStore } from '@/stores/shift'
import { useAuthStore } from '@/stores/auth'
import { productService } from '@/services/productService'
import { settingsService } from '@/services/settingsService'
import ProductCard from '@/components/pos/ProductCard.vue'
import CartSidebar from '@/components/pos/CartSidebar.vue'
import CartItem from '@/components/pos/CartItem.vue'
import PaymentModal from '@/components/pos/PaymentModal.vue'
import ReceiptModal from '@/components/pos/ReceiptModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Search, ShoppingCart, X } from 'lucide-vue-next'

const toast = inject('toast')
const cartStore = useCartStore()
const salesStore = useSalesStore()
const shiftStore = useShiftStore()
const authStore = useAuthStore()

// ─── State ───────────────────────────────────────────────────────────────────
const products = ref([])
const categories = ref(['Semua'])
const settings = ref(null)
const loadingProducts = ref(false)
const showPaymentModal = ref(false)
const showReceipt = ref(false)
const lastSale = ref(null)
const mobileCartOpen = ref(false)
const paymentLoading = ref(false)

const search = ref('')
const categoryFilter = ref('Semua')
const stockFilter = ref('Semua')

// ─── Barcode scanner state ────────────────────────────────────────────────────
let barcodeBuffer = ''
let barcodeTimer = null

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredProducts = computed(() => {
  let list = products.value.filter((p) => p.active !== false)
  if (categoryFilter.value !== 'Semua') {
    list = list.filter((p) => (p.category?.name || p.category) === categoryFilter.value)
  }
  if (stockFilter.value === 'Tersedia') list = list.filter((p) => (p.stock ?? 0) > 0)
  if (stockFilter.value === 'Menipis') {
    list = list.filter((p) => (p.stock ?? 0) > 0 && p.stock <= (p.min_stock ?? 0))
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode || '').includes(q) ||
        (p.code || '').toLowerCase().includes(q),
    )
  }
  return list
})

// ─── Methods ──────────────────────────────────────────────────────────────────
async function fetchProducts() {
  loadingProducts.value = true
  try {
    const data = await productService.getProducts({ per_page: 200, active: 1 })
    const list = Array.isArray(data) ? data : (data.data || [])
    products.value = list

    // Extract categories
    const cats = [...new Set(list.map((p) => p.category?.name || p.category).filter(Boolean))]
    categories.value = ['Semua', ...cats]
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loadingProducts.value = false
  }
}

async function fetchSettings() {
  try {
    const data = await settingsService.getSettings()
    settings.value = data.data || data
    cartStore.setTaxPercent(Number(settings.value?.tax_percent || 0))
  } catch {}
}

function addToCart(product) {
  if (authStore.isKasir && !shiftStore.hasActiveShift) {
    toast?.('Buka shift kasir terlebih dahulu.', 'error')
    return
  }
  if ((product.stock ?? 0) <= 0) {
    toast?.('Stok produk habis.', 'error')
    return
  }
  const ok = cartStore.addItem(product)
  if (!ok) toast?.('Jumlah melebihi stok tersedia.', 'error')
}

function handleIncrease(productId, maxStock) {
  const ok = cartStore.increaseQty(productId, maxStock)
  if (!ok) toast?.('Jumlah melebihi stok tersedia.', 'error')
}

function openPayment() {
  if (cartStore.isEmpty) {
    toast?.('Keranjang masih kosong.', 'error')
    return
  }
  if (authStore.isKasir && !shiftStore.hasActiveShift) {
    toast?.('Buka shift kasir terlebih dahulu.', 'error')
    return
  }
  showPaymentModal.value = true
}

async function confirmPayment() {
  if (
    cartStore.paymentMethod === 'CASH' &&
    Number(cartStore.cashReceived) < cartStore.total
  ) {
    toast?.('Uang diterima kurang dari total transaksi.', 'error')
    return
  }
  paymentLoading.value = true
  try {
    const payload = {
      items: cartStore.items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.sell_price,
        qty: i.qty,
        subtotal: i.sell_price * i.qty,
      })),
      subtotal: cartStore.subtotal,
      discount: cartStore.discountAmount,
      tax: cartStore.taxAmount,
      total: cartStore.total,
      payment_method: cartStore.paymentMethod,
      paid: cartStore.paymentMethod === 'CASH' ? Number(cartStore.cashReceived) : cartStore.total,
      change: cartStore.paymentMethod === 'CASH' ? cartStore.change : 0,
    }

    const sale = await salesStore.createSale(payload)
    lastSale.value = { ...sale, items: payload.items, settings: settings.value }
    showPaymentModal.value = false
    showReceipt.value = true
    cartStore.clearCart()
    toast?.('Pembayaran berhasil diproses.', 'success')

    // Refresh stock
    fetchProducts()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    paymentLoading.value = false
  }
}

function newTransaction() {
  showReceipt.value = false
  lastSale.value = null
}

// Barcode scanner listener
function handleKeydown(e) {
  if (showPaymentModal.value || showReceipt.value) return
  const now = Date.now()
  clearTimeout(barcodeTimer)
  if (e.key === 'Enter' && barcodeBuffer.length >= 6) {
    const product = products.value.find(
      (p) => p.barcode === barcodeBuffer || p.code === barcodeBuffer,
    )
    if (product) addToCart(product)
    else toast?.('Produk dengan barcode tersebut tidak ditemukan.', 'error')
    barcodeBuffer = ''
    return
  }
  if (e.key.length === 1) {
    barcodeBuffer += e.key
    barcodeTimer = setTimeout(() => { barcodeBuffer = '' }, 100)
  }
}

onMounted(() => {
  fetchProducts()
  fetchSettings()
  shiftStore.fetchCurrentShift()
  window.addEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="flex flex-col lg:flex-row gap-4 -m-4 lg:-m-6"
    style="height: calc(100vh - 64px)"
  >
    <!-- Product side -->
    <div class="flex-1 flex flex-col p-4 lg:p-6 lg:pr-2 min-w-0">
      <!-- Search & filters -->
      <div class="flex flex-col sm:flex-row gap-2.5 mb-3">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama produk, kode, atau scan barcode..."
            class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-green-400 outline-none text-sm shadow-sm"
          />
        </div>
        <select
          v-model="stockFilter"
          class="px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm outline-none shadow-sm"
        >
          <option>Semua</option>
          <option>Tersedia</option>
          <option>Menipis</option>
        </select>
      </div>

      <!-- Category filter -->
      <div class="flex gap-2 overflow-x-auto pb-3 -mx-0.5 px-0.5">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="[
            'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0',
            categoryFilter === cat
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300',
          ]"
          @click="categoryFilter = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Product grid -->
      <div class="flex-1 overflow-y-auto -mx-1 px-1">
        <div v-if="loadingProducts" class="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-24 lg:pb-4">
          <ProductCard
            v-for="p in filteredProducts"
            :key="p.id"
            :product="p"
            @add="addToCart"
          />
          <div v-if="!filteredProducts.length" class="col-span-full text-center py-14 text-gray-400 text-sm">
            Produk tidak ditemukan.
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Cart Sidebar -->
    <CartSidebar @open-payment="openPayment" />

    <!-- Mobile floating cart button -->
    <button
      v-if="!cartStore.isEmpty"
      class="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 bg-green-600 text-white px-5 py-3.5 rounded-full shadow-xl font-bold text-sm"
      @click="mobileCartOpen = true"
    >
      <ShoppingCart class="w-4 h-4" />
      {{ cartStore.itemCount }} item • {{ cartStore.total.toLocaleString('id-ID') }}
    </button>

    <!-- Mobile cart bottom sheet -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="mobileCartOpen" class="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div class="absolute inset-0 bg-black/40" @click="mobileCartOpen = false" />
          <div class="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 class="font-bold text-gray-800">Keranjang ({{ cartStore.itemCount }})</h3>
              <button @click="mobileCartOpen = false"><X class="w-5 h-5 text-gray-400" /></button>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              <CartItem
                v-for="item in cartStore.items"
                :key="item.product_id"
                :item="item"
                @increase="handleIncrease"
                @decrease="(id) => cartStore.decreaseQty(id)"
                @remove="(id) => cartStore.removeItem(id)"
              />
            </div>
            <div class="p-4 border-t border-gray-200 space-y-2.5">
              <div class="flex justify-between text-gray-800 font-bold text-base">
                <span>Total</span>
                <span class="num">Rp{{ cartStore.total.toLocaleString('id-ID') }}</span>
              </div>
              <button
                :disabled="cartStore.isEmpty"
                class="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm"
                @click="mobileCartOpen = false; openPayment()"
              >
                PROSES PEMBAYARAN
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modals -->
    <PaymentModal
      :show="showPaymentModal"
      :loading="paymentLoading"
      @close="showPaymentModal = false"
      @confirm="confirmPayment"
    />

    <ReceiptModal
      :show="showReceipt"
      :sale="lastSale"
      :settings="settings"
      @close="showReceipt = false"
      @new-transaction="newTransaction"
    />
  </div>
</template>

