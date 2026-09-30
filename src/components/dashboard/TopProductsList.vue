<script setup>
import { rupiah } from '@/utils/currency'

defineProps({
  products: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="bg-white rounded-xl p-5 shadow-card">
    <h3 class="font-bold text-gray-800 text-sm mb-4">Produk Terlaris</h3>
    <div v-if="products.length" class="space-y-3">
      <div
        v-for="(p, idx) in products.slice(0, 5)"
        :key="p.name"
        class="flex items-center gap-3"
      >
        <div class="w-6 h-6 rounded-md bg-gray-50 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
          {{ idx + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-700 truncate">{{ p.name }}</p>
          <p class="text-[11px] text-gray-400">{{ p.qty }} terjual</p>
        </div>
        <p class="text-xs font-semibold text-gray-600 num shrink-0">{{ rupiah(p.revenue) }}</p>
      </div>
    </div>
    <p v-else class="text-sm text-gray-400 text-center py-4">Belum ada data penjualan.</p>
  </div>
</template>

