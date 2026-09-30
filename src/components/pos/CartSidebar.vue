<script setup>
import { useCartStore } from '@/stores/cart'
import { rupiah } from '@/utils/currency'
import { ShoppingCart } from 'lucide-vue-next'
import CartItem from './CartItem.vue'

const cartStore = useCartStore()

const emit = defineEmits(['open-payment'])

function handleIncrease(productId, maxStock) {
  const ok = cartStore.increaseQty(productId, maxStock)
  if (!ok) {
    // Parent handles toast
  }
}
</script>

<template>
  <div class="hidden lg:flex w-[380px] shrink-0 bg-white border-l border-gray-200 flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart class="w-4 h-4 text-green-600" />
          Keranjang ({{ cartStore.itemCount }})
        </h3>
        <button
          v-if="!cartStore.isEmpty"
          class="text-xs text-red-500 hover:text-red-600 font-semibold"
          @click="cartStore.clearCart()"
        >
          Kosongkan
        </button>
      </div>
    </div>

    <!-- Items -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <CartItem
        v-for="item in cartStore.items"
        :key="item.product_id"
        :item="item"
        @increase="handleIncrease"
        @decrease="(id) => cartStore.decreaseQty(id)"
        @remove="(id) => cartStore.removeItem(id)"
      />
      <div v-if="cartStore.isEmpty" class="text-center py-14 text-gray-400">
        <ShoppingCart class="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Keranjang masih kosong</p>
      </div>
    </div>

    <!-- Summary & checkout -->
    <div class="p-4 border-t border-gray-200 space-y-2.5">
      <!-- Discount -->
      <div class="flex items-center gap-2">
        <select
          :value="cartStore.discountType"
          class="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs outline-none"
          @change="cartStore.setDiscount($event.target.value, cartStore.discountValue)"
        >
          <option value="nominal">Rp</option>
          <option value="persen">%</option>
        </select>
        <input
          :value="cartStore.discountValue"
          type="number"
          min="0"
          placeholder="Diskon"
          class="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs outline-none no-spin"
          @input="cartStore.setDiscount(cartStore.discountType, $event.target.value)"
        />
      </div>

      <!-- Totals -->
      <div class="space-y-1 text-sm">
        <div class="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span class="num">{{ rupiah(cartStore.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-gray-500">
          <span>Diskon</span>
          <span class="num text-red-500">-{{ rupiah(cartStore.discountAmount) }}</span>
        </div>
        <div v-if="cartStore.taxPercent > 0" class="flex justify-between text-gray-500">
          <span>Pajak ({{ cartStore.taxPercent }}%)</span>
          <span class="num">{{ rupiah(cartStore.taxAmount) }}</span>
        </div>
        <div class="flex justify-between text-gray-800 font-bold text-base pt-1.5 border-t border-gray-200">
          <span>Total</span>
          <span class="num">{{ rupiah(cartStore.total) }}</span>
        </div>
      </div>

      <button
        :disabled="cartStore.isEmpty"
        class="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-green-900/10 transition"
        @click="$emit('open-payment')"
      >
        PROSES PEMBAYARAN
      </button>
    </div>
  </div>
</template>

