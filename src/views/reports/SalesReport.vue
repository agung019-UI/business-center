<script setup>
import { ref, onMounted, inject } from 'vue'
import { reportService } from '@/services/reportService'
import { rupiah } from '@/utils/currency'
import { fmtDate, today, startOfMonth } from '@/utils/date'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Download } from 'lucide-vue-next'

const toast = inject('toast')

const loading = ref(false)
const report = ref(null)
const dateFrom = ref(startOfMonth())
const dateTo = ref(today())
const exporting = ref(false)

const presets = [
  { label: 'Hari Ini', from: today(), to: today() },
  { label: 'Minggu Ini', from: (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10) })(), to: today() },
  { label: 'Bulan Ini', from: startOfMonth(), to: today() },
]

function applyPreset(p) {
  dateFrom.value = p.from
  dateTo.value = p.to
  fetchReport()
}

async function fetchReport() {
  loading.value = true
  report.value = null
  try {
    report.value = await reportService.getSalesReport({ date_from: dateFrom.value, date_to: dateTo.value })
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function exportReport() {
  exporting.value = true
  try {
    const response = await reportService.exportSalesReport({ date_from: dateFrom.value, date_to: dateTo.value, format: 'excel' })
    const url = URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-penjualan-${dateFrom.value}-${dateTo.value}.xlsx`
    a.click()
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
        <h1 class="text-xl font-bold text-gray-800">Laporan Penjualan</h1>
        <p class="text-sm text-gray-400">Ringkasan transaksi dalam periode tertentu</p>
      </div>
      <button
        :disabled="exporting || !report"
        class="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm"
        @click="exportReport"
      >
        <Download class="w-4 h-4" />{{ exporting ? 'Mengekspor...' : 'Export Excel' }}
      </button>
    </div>

    <!-- Filter row -->
    <div class="bg-white rounded-xl shadow-card p-4 mb-5 flex flex-wrap gap-2.5 items-center">
      <div class="flex flex-wrap gap-2">
        <button v-for="p in presets" :key="p.label" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-green-400 hover:text-green-600 transition" @click="applyPreset(p)">{{ p.label }}</button>
      </div>
      <div class="flex gap-2 ml-auto">
        <input v-model="dateFrom" type="date" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none focus:border-green-400" />
        <input v-model="dateTo" type="date" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none focus:border-green-400" />
        <button class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold" @click="fetchReport">Tampilkan</button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>

    <template v-else-if="report">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div v-for="card in [
          { label: 'Total Penjualan', value: rupiah(report.total_sales ?? 0), sub: `${report.total_transactions ?? 0} transaksi` },
          { label: 'Total Diskon', value: rupiah(report.total_discount ?? 0) },
          { label: 'Laba Kotor', value: rupiah(report.gross_profit ?? 0), cls: 'text-green-600' },
        ]" :key="card.label" class="bg-white rounded-xl p-4 shadow-card">
          <p class="text-xs font-semibold text-gray-400 mb-1">{{ card.label }}</p>
          <p :class="['text-xl font-bold num', card.cls || 'text-gray-800']">{{ card.value }}</p>
          <p v-if="card.sub" class="text-xs text-gray-400 mt-0.5">{{ card.sub }}</p>
        </div>
      </div>

      <!-- Top products -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-bold text-gray-800 text-sm">Produk Terlaris</h3></div>
          <table class="w-full text-sm">
            <thead><tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50/40">
              <th class="px-4 py-2.5 font-semibold">Produk</th>
              <th class="px-3 py-2.5 font-semibold">Qty</th>
              <th class="px-4 py-2.5 font-semibold text-right">Pendapatan</th>
            </tr></thead>
            <tbody>
              <tr v-for="(p, i) in (report.top_products || [])" :key="p.name" class="border-b border-gray-100 last:border-0">
                <td class="px-4 py-2.5"><div class="flex items-center gap-2"><span class="w-5 h-5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center">{{ i + 1 }}</span>{{ p.name }}</div></td>
                <td class="px-3 py-2.5 text-gray-500 num">{{ p.qty }}</td>
                <td class="px-4 py-2.5 font-semibold text-right num">{{ rupiah(p.revenue) }}</td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-if="!(report.top_products || []).length" title="Tidak ada data" />
        </div>

        <!-- Transaction list -->
        <div class="bg-white rounded-xl shadow-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-bold text-gray-800 text-sm">Daftar Transaksi</h3></div>
          <div class="overflow-y-auto max-h-80">
            <table class="w-full text-sm">
              <thead><tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50/40 sticky top-0">
                <th class="px-4 py-2.5 font-semibold">No</th>
                <th class="px-3 py-2.5 font-semibold">Tanggal</th>
                <th class="px-3 py-2.5 font-semibold text-right">Total</th>
              </tr></thead>
              <tbody>
                <tr v-for="s in (report.sales || [])" :key="s.id" class="border-b border-gray-100 last:border-0">
                  <td class="px-4 py-2.5 font-mono text-xs text-gray-600">{{ s.invoice_no || s.no }}</td>
                  <td class="px-3 py-2.5 text-gray-500 text-xs">{{ fmtDate(s.date || s.created_at) }}</td>
                  <td class="px-3 py-2.5 font-semibold num text-right">{{ rupiah(s.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex items-center justify-center py-16 text-gray-300 text-sm">Pilih periode dan klik Tampilkan.</div>
  </div>
</template>

