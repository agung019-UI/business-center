<script setup>
import { rupiah } from '@/utils/currency'
import { fmtDate } from '@/utils/date'

defineProps({
  sales: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-card overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-bold text-gray-800 text-sm">Transaksi Terbaru</h3>
      <RouterLink
        to="/penjualan"
        class="text-xs font-semibold text-green-600 hover:text-green-700"
      >
        Lihat semua
      </RouterLink>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100">
            <th class="px-5 py-2.5 font-semibold">No Transaksi</th>
            <th class="px-3 py-2.5 font-semibold">Kasir</th>
            <th class="px-3 py-2.5 font-semibold">Total</th>
            <th class="px-3 py-2.5 font-semibold">Metode</th>
            <th class="px-5 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in sales"
            :key="s.id"
            class="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
          >
            <td class="px-5 py-2.5 font-mono text-xs text-gray-600">{{ s.invoice_no || s.no }}</td>
            <td class="px-3 py-2.5 text-gray-600">{{ s.cashier_name || s.cashierName }}</td>
            <td class="px-3 py-2.5 font-semibold text-gray-800 num">{{ rupiah(s.total) }}</td>
            <td class="px-3 py-2.5 text-gray-500">{{ s.payment_method || s.method }}</td>
            <td class="px-5 py-2.5">
              <span class="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                {{ s.status || 'SELESAI' }}
              </span>
            </td>
          </tr>
          <tr v-if="!sales.length">
            <td colspan="5" class="text-center py-8 text-gray-400 text-sm">
              Belum ada transaksi hari ini.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

