<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { reportService } from '@/services/reportService'
import { rupiah } from '@/utils/currency'
import { stockStatus } from '@/utils/permissions'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Download, Search } from 'lucide-vue-next'

const toast = inject('toast')
const loading = ref(false)
const report = ref(null)
const search = ref('')
const filterStatus = ref('')
const exporting = ref(false)

const filteredProducts = computed(() => {
  if (!report.value?.products) return []
  let list = report.value.products
  if (search.value.trim()) list = list.filter((p) => p.name.toLowerCase().includes(search.value.toLowerCase()))
  if (filterStatus.value) list = list.filter((p) => stockStatus(p).label === filterStatus.value)
  return list
})

async function fetchReport() {
  loading.value = true
  report.value = null
  try {
    report.value = await reportService.getStockReport()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function exportReport() {
  exporting.value = true
  try {
    const response = await reportService.exportStockReport({ format: 'excel' })
    const url = URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a'); a.href = url; a.download = 'laporan-stok.xlsx'; a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    exporting.value = false
  }
}

onMounted(fetchReport)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Laporan Stok</h1>
        <p class="text-sm text-gray-400">Ringkasan kondisi persediaan barang</p>
      </div>
      <button :disabled="exporting || !report" class="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm" @click="exportReport">
        <Download class="w-4 h-4" />{{ exporting ? 'Mengekspor...' : 'Export Excel' }}
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>

    <template v-else-if="report">
      <!-- Summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div v-for="card in [
          { label: 'Total Produk', value: String(report.total_products ?? 0) },
          { label: 'Stok Menipis', value: String(report.low_stock_count ?? 0), cls: 'text-amber-600' },
          { label: 'Stok Habis', value: String(report.out_of_stock_count ?? 0), cls: 'text-red-600' },
          { label: 'Nilai Inventori', value: rupiah(report.inventory_value ?? 0), num: true },
        ]" :key="card.label" class="bg-white rounded-xl p-4 shadow-card">
          <p class="text-xs font-semibold text-gray-400 mb-1">{{ card.label }}</p>
          <p :class="['text-xl font-bold', card.cls || 'text-gray-800', card.num && 'num']">{{ card.value }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-card overflow-hidden">
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

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
              <th class="px-4 py-3 font-semibold">Produk</th>
              <th class="px-3 py-3 font-semibold">Kategori</th>
              <th class="px-3 py-3 font-semibold">Stok</th>
              <th class="px-3 py-3 font-semibold">Min</th>
              <th class="px-3 py-3 font-semibold">H. Beli</th>
              <th class="px-3 py-3 font-semibold">Nilai Stok</th>
              <th class="px-4 py-3 font-semibold">Status</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in filteredProducts" :key="p.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3">
                  <p class="font-semibold text-gray-800">{{ p.name }}</p>
                  <p class="text-[11px] text-gray-400">{{ p.code }}</p>
                </td>
                <td class="px-3 py-3 text-gray-500">{{ p.category?.name || p.category }}</td>
                <td class="px-3 py-3 font-bold num" :class="p.stock <= 0 ? 'text-red-600' : p.stock <= p.min_stock ? 'text-amber-600' : 'text-gray-800'">{{ p.stock ?? 0 }} {{ p.unit }}</td>
                <td class="px-3 py-3 text-gray-500 num">{{ p.min_stock ?? 0 }}</td>
                <td class="px-3 py-3 text-gray-500 num">{{ rupiah(p.cost_price) }}</td>
                <td class="px-3 py-3 font-semibold text-gray-700 num">{{ rupiah((p.cost_price ?? 0) * (p.stock ?? 0)) }}</td>
                <td class="px-4 py-3">
                  <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded', stockStatus(p).cls]">{{ stockStatus(p).label }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!filteredProducts.length" title="Tidak ada produk" />
      </div>
    </template>

    <div v-else class="flex items-center justify-center py-16 text-gray-400 text-sm">Gagal memuat data. Coba refresh halaman.</div>
  </div>
</template>

