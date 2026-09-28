<script setup>
import { rupiah } from '@/utils/currency'
import { Plus, Minus, Trash2 } from 'lucide-vue-next'

defineProps({
  item: { type: Object, required: true },
})

defineEmits(['increase', 'decrease', 'remove'])
</script>

<template>
  <div class="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50/60">
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold text-gray-700 truncate">{{ item.name }}</p>
      <p class="text-xs text-green-600 font-semibold num">{{ rupiah(item.sell_price) }}</p>
    </div>

    <!-- Qty controls -->
    <div class="flex items-center gap-1 shrink-0">
      <button
        class="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
        @click="$emit('decrease', item.product_id)"
      >
        <Minus class="w-3 h-3" />
      </button>
      <span class="w-6 text-center text-sm font-semibold num">{{ item.qty }}</span>
      <button
        class="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
        @click="$emit('increase', item.product_id, item.max_stock)"
      >
        <Plus class="w-3 h-3" />
      </button>
    </div>

    <!-- Subtotal -->
    <span class="text-xs font-bold text-gray-600 num shrink-0 w-16 text-right">
      {{ rupiah(item.sell_price * item.qty) }}
    </span>

    <button
      class="text-gray-400 hover:text-red-500 shrink-0 transition"
      @click="$emit('remove', item.product_id)"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

