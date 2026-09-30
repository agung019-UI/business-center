<script setup>
import { computed, watch } from 'vue'
import { rupiah } from '@/utils/currency'
import { Plus, Minus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['increase', 'decrease', 'remove'])

const maxStockForSelectedExp = computed(() => {
  if (props.item.list_tanggal_exp && props.item.list_tanggal_exp.length > 0 && props.item.expiration_date) {
    const exp = props.item.list_tanggal_exp.find(e => e.tanggal_exp === props.item.expiration_date)
    if (exp) return exp.stok
  }
  return props.item.max_stock
})

// Jika tanggal expired diganti, pastikan qty tidak melebihi stok di tanggal tersebut
watch(() => props.item.expiration_date, () => {
  const max = maxStockForSelectedExp.value
  if (props.item.qty > max) {
    props.item.qty = max
  }
})

</script>

<template>
  <div class="flex flex-col gap-2 p-2.5 rounded-lg bg-gray-50/60">
    <div class="flex items-start justify-between gap-2.5">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-gray-700 truncate">{{ item.name }}</p>
        <p class="text-[11px] text-green-600 font-semibold num">{{ rupiah(item.sell_price) }}</p>
      </div>

      <!-- Qty controls -->
      <div class="flex items-center gap-1 shrink-0 mt-0.5">
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
      <span class="text-xs font-bold text-gray-600 num shrink-0 w-16 text-right mt-1">
        {{ rupiah(item.sell_price * item.qty) }}
      </span>

      <button
        class="text-gray-400 hover:text-red-500 shrink-0 transition mt-1"
        @click="$emit('remove', item.product_id)"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Dropdown / Datepicker row -->
    <div class="w-full">
      <select v-if="item.list_tanggal_exp && item.list_tanggal_exp.length > 0" v-model="item.expiration_date" class="w-full text-xs px-2 py-1.5 rounded-md border border-gray-200 outline-none text-gray-600 bg-white">
        <option v-for="exp in item.list_tanggal_exp" :key="exp.tanggal_exp" :value="exp.tanggal_exp">
          Exp: {{ exp.tanggal_exp }} (Stok: {{ exp.stok }})
        </option>
      </select>
      <input v-else type="date" v-model="item.expiration_date" class="w-full text-xs px-2 py-1.5 rounded-md border border-gray-200 outline-none text-gray-600 bg-white" title="Pilih Tanggal Expired" />
    </div>
  </div>
</template>

