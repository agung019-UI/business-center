<script setup>
import { ref, onMounted, inject } from 'vue'
import { useShiftStore } from '@/stores/shift'
import { useAuthStore } from '@/stores/auth'
import { rupiah } from '@/utils/currency'
import { fmtDate } from '@/utils/date'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-vue-next'

const toast = inject('toast')
const shiftStore = useShiftStore()
const authStore = useAuthStore()

const openShiftAmount = ref('')
const closeShiftActual = ref('')
const showOpenModal = ref(false)
const showCloseModal = ref(false)

async function openShift() {
  try {
    await shiftStore.openShift({ start_cash: Number(openShiftAmount.value) || 0 })
    toast?.('Shift berhasil dibuka.', 'success')
    showOpenModal.value = false
    openShiftAmount.value = ''
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

async function closeShift() {
  if (!shiftStore.currentShift) return
  try {
    const result = await shiftStore.closeShift(shiftStore.currentShift.id, {
      actual_cash: Number(closeShiftActual.value) || 0,
    })
    toast?.('Shift berhasil ditutup.', 'success')
    showCloseModal.value = false
    closeShiftActual.value = ''
    shiftStore.fetchShifts()
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

function diffLabel(shift) {
  const diff = (shift.actual_cash || 0) - (shift.expected_cash || shift.expected || 0)
  if (diff > 0) return { text: `+${rupiah(diff)} SURPLUS`, cls: 'text-green-600' }
  if (diff < 0) return { text: `${rupiah(diff)} MINUS`, cls: 'text-red-600' }
  return { text: 'SESUAI', cls: 'text-gray-600' }
}

onMounted(() => {
  shiftStore.fetchCurrentShift()
  shiftStore.fetchShifts()
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Shift Kasir</h1>
        <p class="text-sm text-gray-400">Kelola shift dan pantau performa kasir</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="!shiftStore.hasActiveShift"
          class="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm"
          @click="showOpenModal = true"
        >
          <Clock class="w-4 h-4" />Buka Shift
        </button>
        <button
          v-else
          class="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold shadow-sm"
          @click="showCloseModal = true"
        >
          <CheckCircle class="w-4 h-4" />Tutup Shift
        </button>
      </div>
    </div>

    <!-- Active shift banner -->
    <div v-if="shiftStore.currentShift" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p class="text-sm font-bold text-green-800 flex items-center gap-2">
          <Clock class="w-4 h-4" />Shift Sedang Aktif
        </p>
        <p class="text-xs text-green-600 mt-0.5">
          Dibuka {{ fmtDate(shiftStore.currentShift.start || shiftStore.currentShift.created_at, true) }} •
          Modal awal {{ rupiah(shiftStore.currentShift.start_cash || shiftStore.currentShift.startCash) }}
        </p>
      </div>
      <div class="flex gap-4 text-sm">
        <div class="text-center">
          <p class="text-xs text-green-500">Total Transaksi</p>
          <p class="font-bold text-green-800 num">{{ shiftStore.currentShift.total_transactions || shiftStore.currentShift.totalTx || 0 }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-green-500">Total Penjualan Cash</p>
          <p class="font-bold text-green-800 num">{{ rupiah(shiftStore.currentShift.cash_sales || shiftStore.currentShift.cashSales || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Shift history -->
    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Riwayat Shift</h3>
      </div>
      <div v-if="shiftStore.loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Kasir</th>
                <th class="px-3 py-3 font-semibold">Mulai</th>
                <th class="px-3 py-3 font-semibold">Selesai</th>
                <th class="px-3 py-3 font-semibold">Modal Awal</th>
                <th class="px-3 py-3 font-semibold">Penjualan</th>
                <th class="px-3 py-3 font-semibold">Selisih</th>
                <th class="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in shiftStore.shifts" :key="s.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ s.cashier_name || s.cashierName }}</td>
                <td class="px-3 py-3 text-gray-500 text-xs">{{ fmtDate(s.start || s.started_at, true) }}</td>
                <td class="px-3 py-3 text-gray-500 text-xs">{{ s.end || s.ended_at ? fmtDate(s.end || s.ended_at, true) : '-' }}</td>
                <td class="px-3 py-3 num">{{ rupiah(s.start_cash || s.startCash) }}</td>
                <td class="px-3 py-3 num font-semibold text-green-700">{{ rupiah(s.cash_sales || s.cashSales || 0) }}</td>
                <td class="px-3 py-3 text-xs font-bold num" :class="diffLabel(s).cls">{{ diffLabel(s).text }}</td>
                <td class="px-3 py-3">
                  <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded-full', s.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600']">{{ s.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!shiftStore.shifts.length" title="Belum ada riwayat shift" />
      </template>
    </div>

    <!-- Open Shift Modal -->
    <BaseModal :show="showOpenModal" title="Buka Shift Kasir" size="sm" @close="showOpenModal = false">
      <div class="p-6">
        <p class="text-sm text-gray-400 mb-4">Masukkan modal awal kas untuk memulai transaksi.</p>
        <label class="text-sm font-semibold text-gray-700 block mb-1.5">Modal Awal Kas</label>
        <input v-model="openShiftAmount" type="number" min="0" placeholder="500000" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm num no-spin mb-5" />
        <button
          :disabled="shiftStore.saving"
          class="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2"
          @click="openShift"
        >
          <svg v-if="shiftStore.saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Buka Shift
        </button>
      </div>
    </BaseModal>

    <!-- Close Shift Modal -->
    <BaseModal :show="showCloseModal && !!shiftStore.currentShift" title="Tutup Shift Kasir" size="sm" @close="showCloseModal = false">
      <div v-if="shiftStore.currentShift" class="p-6 space-y-4">
        <div class="space-y-1.5 text-sm bg-gray-50 rounded-xl p-3.5">
          <div class="flex justify-between text-gray-500"><span>Modal Awal</span><span class="num">{{ rupiah(shiftStore.currentShift.start_cash || shiftStore.currentShift.startCash || 0) }}</span></div>
          <div class="flex justify-between text-gray-500"><span>Penjualan Cash</span><span class="num text-green-600">+{{ rupiah(shiftStore.currentShift.cash_sales || 0) }}</span></div>
          <div class="flex justify-between text-gray-500"><span>Kas Masuk Lain</span><span class="num text-green-600">+{{ rupiah(shiftStore.currentShift.cash_in || 0) }}</span></div>
          <div class="flex justify-between text-gray-500"><span>Kas Keluar</span><span class="num text-red-500">-{{ rupiah(shiftStore.currentShift.cash_out || 0) }}</span></div>
          <div class="flex justify-between font-bold text-gray-800 pt-1.5 border-t border-gray-200"><span>Kas Seharusnya</span><span class="num">{{ rupiah(shiftStore.currentShift.expected_cash || shiftStore.currentShift.expected || 0) }}</span></div>
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700 block mb-1.5">Kas Aktual (hitung fisik)</label>
          <input v-model="closeShiftActual" type="number" min="0" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm num no-spin" />
        </div>
        <button
          :disabled="shiftStore.saving"
          class="w-full py-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2"
          @click="closeShift"
        >
          <svg v-if="shiftStore.saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Tutup Shift
        </button>
      </div>
    </BaseModal>
  </div>
</template>

