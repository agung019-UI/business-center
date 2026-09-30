<script setup>
import { ref, onMounted, inject, nextTick } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { rupiah } from '@/utils/currency'
import { fmtDate, today, daysAgo, startOfMonth } from '@/utils/date'
import BasePagination from '@/components/ui/BasePagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { Search, Eye, Printer } from 'lucide-vue-next'

const toast = inject('toast')
const salesStore = useSalesStore()

const search = ref('')
const dateFrom = ref(startOfMonth())
const dateTo = ref(today())
const methodFilter = ref('')
const page = ref(1)

const viewingSale = ref(null)

const presets = [
  { label: 'Hari Ini', from: today(), to: today() },
  { label: 'Kemarin', from: daysAgo(1), to: daysAgo(1) },
  { label: 'Minggu Ini', from: daysAgo(6), to: today() },
  { label: 'Bulan Ini', from: startOfMonth(), to: today() },
]

function applyPreset(p) {
  dateFrom.value = p.from
  dateTo.value = p.to
  page.value = 1
  fetchSales()
}

function fetchSales() {
  salesStore.fetchSales({
    search: search.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    payment_method: methodFilter.value || undefined,
    page: page.value,
    per_page: 20,
  })
}

function printReceipt() {
  nextTick(() => window.print())
}

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchSales() }, 400)
}

onMounted(fetchSales)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Penjualan</h1>
      <p class="mt-1 text-sm text-gray-500">
        Riwayat transaksi penjualan Budhi Warman II
      </p>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Riwayat Penjualan</h1>
        <p class="text-sm text-gray-400">{{ salesStore.pagination.total }} transaksi ditemukan</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-card p-4 mb-4 space-y-3">
      <!-- Preset buttons -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in presets"
          :key="p.label"
          class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-green-400 hover:text-green-600 transition"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" placeholder="Cari no. transaksi / kasir..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 outline-none text-sm border border-transparent focus:border-green-400 transition" @input="onSearch" />
        </div>
        <input v-model="dateFrom" type="date" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none focus:border-green-400" @change="page = 1; fetchSales()" />
        <input v-model="dateTo" type="date" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none focus:border-green-400" @change="page = 1; fetchSales()" />
        <select v-model="methodFilter" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none" @change="page = 1; fetchSales()">
          <option value="">Semua Metode</option>
          <option>CASH</option>
          <option>QRIS</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div v-if="salesStore.loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">No Transaksi</th>
                <th class="px-3 py-3 font-semibold">Tanggal</th>
                <th class="px-3 py-3 font-semibold">Kasir</th>
                <th class="px-3 py-3 font-semibold">Total</th>
                <th class="px-3 py-3 font-semibold">Metode</th>
                <th class="px-3 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in salesStore.sales" :key="s.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ s.invoice_no || s.no }}</td>
                <td class="px-3 py-3 text-gray-500 text-xs">{{ fmtDate(s.created_at || s.date, true) }}</td>
                <td class="px-3 py-3 text-gray-600">{{ s.cashier_name || s.cashierName }}</td>
                <td class="px-3 py-3 font-bold text-gray-800 num">{{ rupiah(s.total) }}</td>
                <td class="px-3 py-3">
                  <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded', s.payment_method === 'CASH' || s.method === 'CASH' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600']">
                    {{ s.payment_method || s.method }}
                  </span>
                </td>
                <td class="px-3 py-3">
                  <span class="text-[10.5px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">{{ s.status || 'SELESAI' }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="viewingSale = s"><Eye class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!salesStore.sales.length" title="Tidak ada transaksi" description="Gunakan filter tanggal atau kata kunci untuk mencari." />
        <div class="px-4 pb-4">
          <BasePagination
            :current-page="salesStore.pagination.current_page"
            :last-page="salesStore.pagination.last_page"
            :total="salesStore.pagination.total"
            :per-page="salesStore.pagination.per_page"
            @change="(p) => { page = p; fetchSales() }"
          />
        </div>
      </template>
    </div>

    <!-- Sale Detail Modal -->
    <BaseModal :show="!!viewingSale" :title="'Detail Transaksi ' + (viewingSale?.invoice_no || viewingSale?.no || '')" size="md" @close="viewingSale = null">
      <div v-if="viewingSale" class="p-5 space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
          <p>Tanggal: <span class="text-gray-700 font-medium">{{ fmtDate(viewingSale.created_at || viewingSale.date, true) }}</span></p>
          <p>Kasir: <span class="text-gray-700 font-medium">{{ viewingSale.cashier_name || viewingSale.cashierName }}</span></p>
          <p>Metode: <span class="text-gray-700 font-medium">{{ viewingSale.payment_method || viewingSale.method }}</span></p>
          <p>Status: <span class="text-green-600 font-semibold">{{ viewingSale.status || 'SELESAI' }}</span></p>
        </div>
        <div class="border-t border-gray-200 pt-3 space-y-2">
          <div v-for="it in (viewingSale.items || [])" :key="it.product_id || it.productId" class="flex justify-between">
            <span class="text-gray-600">{{ it.name }} x{{ it.qty }}</span>
            <span class="font-medium num">{{ rupiah(it.subtotal) }}</span>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-3 space-y-1.5">
          <div class="flex justify-between text-gray-500"><span>Subtotal</span><span class="num">{{ rupiah(viewingSale.subtotal) }}</span></div>
          <div class="flex justify-between text-gray-500"><span>Diskon</span><span class="num text-red-500">-{{ rupiah(viewingSale.discount) }}</span></div>
          <div v-if="viewingSale.tax > 0" class="flex justify-between text-gray-500"><span>Pajak</span><span class="num">{{ rupiah(viewingSale.tax) }}</span></div>
          <div class="flex justify-between font-bold text-gray-800 text-base border-t border-gray-200 pt-1.5"><span>Total</span><span class="num">{{ rupiah(viewingSale.total) }}</span></div>
          <div class="flex justify-between text-gray-500"><span>Pembayaran</span><span class="num">{{ rupiah(viewingSale.paid) }}</span></div>
          <div class="flex justify-between text-gray-500"><span>Kembalian</span><span class="num">{{ rupiah(viewingSale.change) }}</span></div>
        </div>
        <button
          class="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          @click="printReceipt"
        >
          <Printer class="w-4 h-4" /> Cetak Ulang Struk
        </button>
      </div>
    </BaseModal>
  </div>
</template>
