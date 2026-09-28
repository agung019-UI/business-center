<script setup>
import { ref, onMounted, inject } from 'vue'
import { reportService } from '@/services/reportService'
import { rupiah } from '@/utils/currency'
import { today, startOfMonth } from '@/utils/date'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const toast = inject('toast')
const loading = ref(false)
const report = ref(null)
const dateFrom = ref(startOfMonth())
const dateTo = ref(today())

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
    report.value = await reportService.getProfitReport({ date_from: dateFrom.value, date_to: dateTo.value })
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Laporan Keuntungan</h1>
        <p class="text-sm text-gray-400">Analisis laba kotor dan laba bersih</p>
      </div>
    </div>

    <!-- Filters -->
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
      <!-- P&L cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div class="bg-white rounded-xl p-5 shadow-card">
          <h3 class="font-bold text-gray-800 mb-3">Laporan Laba Rugi</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Total Pendapatan Penjualan</span>
              <span class="font-semibold num">{{ rupiah(report.total_sales ?? 0) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Harga Pokok Penjualan (HPP)</span>
              <span class="font-semibold num text-red-500">-{{ rupiah(report.total_cogs ?? 0) }}</span>
            </div>
            <div class="flex justify-between text-gray-800 font-bold border-t border-gray-100 pt-2">
              <span>Laba Kotor</span>
              <span class="num text-green-600">{{ rupiah(report.gross_profit ?? 0) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Biaya Operasional</span>
              <span class="font-semibold num text-red-500">-{{ rupiah(report.operational_expenses ?? 0) }}</span>
            </div>
            <div class="flex justify-between text-gray-800 font-bold text-base border-t border-gray-100 pt-2">
              <span>Laba Bersih</span>
              <span :class="['num', (report.net_profit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600']">
                {{ rupiah(report.net_profit ?? 0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Profit margin -->
        <div class="bg-white rounded-xl p-5 shadow-card flex flex-col justify-center">
          <h3 class="font-bold text-gray-800 mb-4">Margin</h3>
          <div class="space-y-4">
            <div v-for="item in [
              { label: 'Margin Kotor', value: report.gross_margin_pct },
              { label: 'Margin Bersih', value: report.net_margin_pct },
            ]" :key="item.label">
              <div class="flex justify-between mb-1.5">
                <span class="text-sm text-gray-500">{{ item.label }}</span>
                <span class="text-sm font-bold num">{{ (item.value ?? 0).toFixed(1) }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full" :style="{ width: Math.min(item.value ?? 0, 100) + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex items-center justify-center py-16 text-gray-300 text-sm">Pilih periode dan klik Tampilkan.</div>
  </div>
</template>

