<script setup>
import { computed } from 'vue'
import { rupiah } from '@/utils/currency'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
    // [{ label: 'Sen', total: 50000 }, ...]
  },
})

const maxTotal = computed(() => Math.max(1, ...props.data.map((d) => d.total)))

function barHeight(total) {
  return Math.max(4, Math.round((total / maxTotal.value) * 100))
}
</script>

<template>
  <div class="bg-white rounded-xl p-5 shadow-card">
    <h3 class="font-bold text-gray-800 text-sm mb-4">Grafik Penjualan (7 Hari Terakhir)</h3>

    <div v-if="data.length" class="flex items-end gap-2 sm:gap-4 h-44 px-1">
      <div
        v-for="d in data"
        :key="d.label"
        class="flex-1 flex flex-col items-center gap-1.5 group"
      >
        <span class="text-[10px] text-gray-400 num opacity-0 group-hover:opacity-100 transition">
          {{ rupiah(d.total) }}
        </span>
        <div class="w-full bg-gray-100 rounded-t-md relative" style="height: 120px">
          <div
            class="absolute bottom-0 w-full bg-green-500 rounded-t-md group-hover:bg-green-600 transition-all duration-300"
            :style="{ height: barHeight(d.total) + '%' }"
          />
        </div>
        <span class="text-[10.5px] text-gray-500 font-medium">{{ d.label }}</span>
      </div>
    </div>

    <div v-else class="h-44 flex items-center justify-center text-sm text-gray-400">
      Belum ada data penjualan.
    </div>
  </div>
</template>

