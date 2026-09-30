<script setup>
import { stockStatus } from '@/utils/permissions'

defineProps({
  products: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="bg-white rounded-xl p-5 shadow-card">
    <h3 class="font-bold text-gray-800 text-sm mb-4">Perlu Perhatian</h3>
    <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
      <div
        v-for="p in products.slice(0, 8)"
        :key="p.id"
        class="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50/60"
      >
        <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-gray-700 truncate">{{ p.name }}</p>
          <p class="text-[11px] text-gray-400">Sisa {{ p.stock ?? 0 }} {{ p.unit }}</p>
        </div>
        <span
          :class="['text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0', stockStatus(p).cls]"
        >
          {{ stockStatus(p).label }}
        </span>
      </div>
      <p
        v-if="!products.length"
        class="text-sm text-gray-400 text-center py-4"
      >
        Semua stok dalam kondisi aman.
      </p>
    </div>
  </div>
</template>

