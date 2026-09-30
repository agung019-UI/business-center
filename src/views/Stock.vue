<script setup>
import { ref, onMounted, inject } from 'vue'
import { useStockStore } from '@/stores/stock'
import { stockStatus } from '@/utils/permissions'
import { rupiah } from '@/utils/currency'
import { fmtDate } from '@/utils/date'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Search, SlidersHorizontal, History } from 'lucide-vue-next'

const toast = inject('toast')
const stockStore = useStockStore()

const activeTab = ref('stock') // 'stock' | 'history'
const search = ref('')
const filterStatus = ref('')
const showAdjustModal = ref(false)
const adjustingProduct = ref(null)
const adjustForm = ref({ type: 'MASUK', direction: 'tambah', qty: 1, note: '', exp_date: '' })

const filteredStock = () => {
  let list = stockStore.stockList
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }
  if (filterStatus.value) {
    list = list.filter((p) => stockStatus(p).label === filterStatus.value)
  }
  return list
}

function openAdjust(product) {
  adjustingProduct.value = product
  adjustForm.value = { type: 'MASUK', direction: 'tambah', qty: 1, note: '', exp_date: '' }
  showAdjustModal.value = true
}

async function saveAdjust() {
  if (!adjustForm.value.qty || adjustForm.value.qty < 1) {
    toast?.('Quantity harus minimal 1.', 'error')
    return
  }
  try {
    const payload = {
      product_id: adjustingProduct.value.id,
      type: adjustForm.value.type,
      qty: adjustForm.value.type === 'PENYESUAIAN' && adjustForm.value.direction === 'kurang'
        ? -adjustForm.value.qty
        : adjustForm.value.qty,
      exp_date: adjustForm.value.exp_date || '',
      note: adjustForm.value.note,
    }
    await stockStore.adjustStock(payload)
    toast?.('Stok berhasil disesuaikan.', 'success')
    showAdjustModal.value = false
    fetchStock()
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

function fetchStock() {
  stockStore.fetchStock()
}

function fetchMovements() {
  stockStore.fetchMovements()
}

onMounted(() => {
  fetchStock()
})

function onTabChange(tab) {
  activeTab.value = tab
  if (tab === 'history' && !stockStore.movements.length) fetchMovements()
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Manajemen Stok</h1>
        <p class="text-sm text-gray-400">Kelola stok produk dan riwayat pergerakan barang</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="tab in [{ key: 'stock', label: 'Stok Saat Ini' }, { key: 'history', label: 'Riwayat Pergerakan' }]"
        :key="tab.key"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-semibold transition',
          activeTab === tab.key ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300',
        ]"
        @click="onTabChange(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Stock Tab -->
    <div v-if="activeTab === 'stock'" class="bg-white rounded-xl shadow-card overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" placeholder="Cari produk..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 outline-none text-sm border border-transparent focus:border-green-400 transition" />
        </div>
        <select v-model="filterStatus" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none">
          <option value="">Semua Status</option>
          <option>STOK AMAN</option>
          <option>STOK MENIPIS</option>
          <option>STOK HABIS</option>
        </select>
      </div>

      <div v-if="stockStore.loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Produk</th>
                <th class="px-3 py-3 font-semibold">Kategori</th>
                <th class="px-3 py-3 font-semibold">Stok</th>
                <th class="px-3 py-3 font-semibold">Min Stok</th>
                <th class="px-3 py-3 font-semibold">Nilai Stok</th>
                <th class="px-3 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredStock()" :key="p.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3">
                  <p class="font-semibold text-gray-800">{{ p.name }}</p>
                  <p class="text-[11px] text-gray-400">{{ p.code }}</p>
                </td>
                <td class="px-3 py-3 text-gray-500">{{ p.category?.name || p.category }}</td>
                <td class="px-3 py-3 font-bold num" :class="p.stock <= 0 ? 'text-red-600' : p.stock <= p.min_stock ? 'text-amber-600' : 'text-gray-800'">
                  {{ p.stock ?? 0 }} {{ p.unit }}
                </td>
                <td class="px-3 py-3 text-gray-500 num">{{ p.min_stock ?? 0 }}</td>
                <td class="px-3 py-3 text-gray-600 num">{{ rupiah((p.cost_price ?? 0) * (p.stock ?? 0)) }}</td>
                <td class="px-3 py-3">
                  <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded', stockStatus(p).cls]">
                    {{ stockStatus(p).label }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    class="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1.5 ml-auto transition"
                    @click="openAdjust(p)"
                  >
                    <SlidersHorizontal class="w-3.5 h-3.5" /> Sesuaikan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!filteredStock().length" title="Tidak ada produk" description="Tambah produk terlebih dahulu untuk melihat stok." />
      </template>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'" class="bg-white rounded-xl shadow-card overflow-hidden">
      <div v-if="stockStore.loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Tanggal</th>
                <th class="px-3 py-3 font-semibold">Produk</th>
                <th class="px-3 py-3 font-semibold">Tipe</th>
                <th class="px-3 py-3 font-semibold">Qty</th>
                <th class="px-3 py-3 font-semibold">Catatan</th>
                <th class="px-4 py-3 font-semibold">Operator</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in stockStore.movements" :key="m.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500 text-xs">{{ fmtDate(m.created_at || m.date, true) }}</td>
                <td class="px-3 py-3 font-medium text-gray-800">{{ m.product_name || m.productName }}</td>
                <td class="px-3 py-3">
                  <span :class="[
                    'text-[10.5px] font-bold px-2 py-0.5 rounded',
                    m.type === 'MASUK' || m.type === 'PENJUALAN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
                  ]">{{ m.type }}</span>
                </td>
                <td class="px-3 py-3 font-bold num" :class="m.qty < 0 ? 'text-red-600' : 'text-green-700'">
                  {{ m.qty > 0 ? '+' : '' }}{{ m.qty }}
                </td>
                <td class="px-3 py-3 text-gray-500">{{ m.note }}</td>
                <td class="px-4 py-3 text-gray-500">{{ m.user || m.operator }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!stockStore.movements.length" title="Belum ada riwayat pergerakan" />
      </template>
    </div>

    <!-- Stock Adjust Modal -->
    <BaseModal :show="showAdjustModal" title="Sesuaikan Stok" size="sm" @close="showAdjustModal = false">
      <div v-if="adjustingProduct" class="p-5">
        <p class="text-sm text-gray-500 mb-4">
          <span class="font-semibold text-gray-800">{{ adjustingProduct.name }}</span> �
          Stok saat ini: <span class="font-bold text-gray-800 num">{{ adjustingProduct.stock }} {{ adjustingProduct.unit }}</span>
        </p>
        <form class="space-y-3.5" @submit.prevent="saveAdjust">
          <!-- Type -->
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="t in ['MASUK', 'KELUAR', 'PENYESUAIAN']"
              :key="t"
              type="button"
              :class="['py-2 rounded-lg text-xs font-semibold border transition', adjustForm.type === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300']"
              @click="adjustForm.type = t"
            >{{ t }}</button>
          </div>
          <!-- Direction (PENYESUAIAN only) -->
          <div v-if="adjustForm.type === 'PENYESUAIAN'" class="flex gap-2">
            <button type="button" :class="['flex-1 py-1.5 rounded-lg text-xs font-semibold border transition', adjustForm.direction !== 'kurang' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500']" @click="adjustForm.direction = 'tambah'">+ Tambah</button>
            <button type="button" :class="['flex-1 py-1.5 rounded-lg text-xs font-semibold border transition', adjustForm.direction === 'kurang' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500']" @click="adjustForm.direction = 'kurang'">- Kurang</button>
          </div>
          <!-- Qty -->
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Quantity *</label>
            <input v-model="adjustForm.qty" type="number" min="1" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm no-spin focus:border-green-500" />
          </div>
          <!-- Exp Date -->
          <div v-if="adjustForm.type === 'MASUK'">
            <label class="text-xs font-semibold text-gray-600 block mb-1">Tanggal Expired (Opsional)</label>
            <input v-model="adjustForm.exp_date" type="date" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
          </div>
          <!-- Note -->
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Catatan</label>
            <input v-model="adjustForm.note" placeholder="mis. barang rusak, stok opname" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50" @click="showAdjustModal = false">Batal</button>
            <button type="submit" :disabled="stockStore.saving" class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2">
              <svg v-if="stockStore.saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

