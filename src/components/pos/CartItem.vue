<script setup>
import { computed } from 'vue'
import { rupiah } from '@/utils/currency'
import { Plus, Minus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  item: { type: Object, required: true },
})

defineEmits(['increase', 'decrease', 'remove'])

const maxStockForSelectedExp = computed(() => {
  if (props.item.list_tanggal_exp && props.item.list_tanggal_exp.length > 0 && props.item.expiration_date) {
    const exp = props.item.list_tanggal_exp.find(e => e.tanggal_exp === props.item.expiration_date)
    if (exp) return exp.stok
  }
  return props.item.max_stock
})
</script>

<template>
  <div class="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50/60">
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold text-gray-700 truncate">{{ item.name }}</p>
      <div class="flex items-center gap-2">
        <p class="text-xs text-green-600 font-semibold num">{{ rupiah(item.sell_price) }}</p>
        <select v-if="item.list_tanggal_exp && item.list_tanggal_exp.length > 0" v-model="item.expiration_date" class="text-[10px] px-1 py-0.5 rounded border border-gray-200 outline-none max-w-[100px] truncate">
          <option v-for="exp in item.list_tanggal_exp" :key="exp.tanggal_exp" :value="exp.tanggal_exp">
            Exp: {{ exp.tanggal_exp }} (Stok: {{ exp.stok }})
          </option>
        </select>
      </div>
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
        @click="$emit('increase', item.product_id, maxStockForSelectedExp)"
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

