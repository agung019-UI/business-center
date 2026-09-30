<script setup>
import { inject } from 'vue'
import { rupiah } from '@/utils/currency'
import { fmtDate } from '@/utils/date'
import { Printer } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  sale: Object,
  settings: Object,
})

const emit = defineEmits(['close', 'new-transaction'])

function printReceipt() {
  window.print()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show && sale" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" />
        <div class="relative bg-white rounded-2xl w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl">
          <!-- Receipt content (printed) -->
          <div id="receipt-print" class="p-6 font-mono text-sm text-gray-800">
            <div class="text-center mb-3">
              <p class="font-bold text-base">{{ (settings?.bc_name || 'Budhi Warman II').toUpperCase() }}</p>
              <p>{{ settings?.school_name || '' }}</p>
              <p>{{ settings?.address || '' }}</p>
              <p>{{ settings?.phone || '' }}</p>
            </div>

            <div class="border-t border-dashed border-gray-300 my-2" />

            <p>No Transaksi: {{ sale.invoice_no || sale.no }}</p>
            <p>Tanggal: {{ fmtDate(sale.created_at || sale.date, true) }}</p>
            <p>Kasir: {{ sale.cashier_name || sale.cashierName }}</p>

            <div class="border-t border-dashed border-gray-300 my-2" />

            <div v-for="it in (sale.items || [])" :key="it.product_id || it.productId" class="mb-1.5">
              <p>{{ it.name }}</p>
              <div class="flex justify-between">
                <span>{{ it.qty }} x {{ rupiah(it.price || it.sell_price) }}</span>
                <span>{{ rupiah(it.subtotal) }}</span>
              </div>
            </div>

            <div class="border-t border-dashed border-gray-300 my-2" />

            <div class="flex justify-between"><span>Subtotal</span><span>{{ rupiah(sale.subtotal) }}</span></div>
            <div class="flex justify-between"><span>Diskon</span><span>{{ rupiah(sale.discount) }}</span></div>
            <div v-if="sale.tax > 0" class="flex justify-between"><span>Pajak</span><span>{{ rupiah(sale.tax) }}</span></div>
            <div class="flex justify-between font-bold"><span>TOTAL</span><span>{{ rupiah(sale.total) }}</span></div>
            <div class="flex justify-between"><span>Bayar ({{ sale.payment_method || sale.method }})</span><span>{{ rupiah(sale.paid) }}</span></div>
            <div class="flex justify-between"><span>Kembali</span><span>{{ rupiah(sale.change) }}</span></div>

            <div class="border-t border-dashed border-gray-300 my-2" />

            <div class="text-center whitespace-pre-line">{{ settings?.receipt_footer || settings?.footer || 'Terima kasih\nSelamat berbelanja' }}</div>
          </div>

          <!-- Actions -->
          <div class="p-4 pt-0 flex gap-2">
            <button
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              @click="printReceipt"
            >
              <Printer class="w-4 h-4" />
              Print
            </button>
            <button
              class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition"
              @click="$emit('new-transaction')"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

