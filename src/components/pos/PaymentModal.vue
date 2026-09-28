<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { rupiah } from '@/utils/currency'
import BaseModal from '@/components/ui/BaseModal.vue'
import { Banknote, QrCode, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  loading: Boolean,
})

const emit = defineEmits(['close', 'confirm'])

const cartStore = useCartStore()

const methods = [
  { key: 'CASH', label: 'CASH', icon: Banknote },
  { key: 'QRIS', label: 'QRIS', icon: QrCode },
]

const cashShort = computed(() => {
  if (cartStore.paymentMethod !== 'CASH') return false
  const received = Number(cartStore.cashReceived)
  return cartStore.cashReceived !== '' && received < cartStore.total
})

function quickCash(amount) {
  cartStore.quickCash(amount)
}

const quickOptions = computed(() => [
  cartStore.total,
  cartStore.total + 5000,
  cartStore.total + 20000,
  cartStore.total + 50000,
])
</script>

<template>
  <BaseModal :show="show" title="Proses Pembayaran" @close="$emit('close')">
    <div class="p-5 space-y-4">
      <!-- Total display -->
      <div class="bg-gray-50 rounded-xl p-4 text-center">
        <p class="text-xs text-gray-400 font-semibold mb-1">TOTAL PEMBAYARAN</p>
        <p class="text-2xl font-bold text-gray-800 num">{{ rupiah(cartStore.total) }}</p>
      </div>

      <!-- Payment method -->
      <div>
        <label class="text-sm font-semibold text-gray-700 block mb-2">Metode Pembayaran</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="m in methods"
            :key="m.key"
            :class="[
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition',
              cartStore.paymentMethod === m.key
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300',
            ]"
            @click="cartStore.setPaymentMethod(m.key)"
          >
            <component :is="m.icon" class="w-5 h-5" />
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Cash input -->
      <div v-if="cartStore.paymentMethod === 'CASH'" class="space-y-2.5">
        <label class="text-sm font-semibold text-gray-700 block">Uang Diterima</label>
        <input
          :value="cartStore.cashReceived"
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none text-lg font-bold num no-spin"
          @input="cartStore.setCashReceived($event.target.value)"
        />

        <!-- Quick cash buttons -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="q in quickOptions"
            :key="q"
            class="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 num transition"
            @click="quickCash(q)"
          >
            {{ rupiah(q) }}
          </button>
        </div>

        <!-- Change -->
        <div class="flex justify-between items-center pt-2 border-t border-gray-200">
          <span class="text-sm text-gray-500">Kembalian</span>
          <span class="text-lg font-bold text-green-600 num">{{ rupiah(cartStore.change) }}</span>
        </div>

        <!-- Insufficient warning -->
        <p v-if="cashShort" class="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle class="w-3.5 h-3.5" />
          Uang diterima kurang dari total transaksi.
        </p>
      </div>

      <!-- QRIS confirmation -->
      <div v-else class="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
        Konfirmasi pembayaran QRIS sejumlah
        <span class="font-bold text-gray-700 num">{{ rupiah(cartStore.total) }}</span>
        telah diterima.
      </div>
    </div>

    <template #footer>
      <button
        :disabled="loading || cashShort"
        class="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
        @click="$emit('confirm')"
      >
        <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ loading ? 'Memproses...' : 'Konfirmasi Pembayaran' }}
      </button>
    </template>
  </BaseModal>
</template>

