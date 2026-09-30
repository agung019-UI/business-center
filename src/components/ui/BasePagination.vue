<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  lastPage: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  perPage: { type: Number, default: 20 },
})

const emit = defineEmits(['change'])

function goTo(page) {
  if (page < 1 || page > props.lastPage || page === props.currentPage) return
  emit('change', page)
}
</script>

<template>
  <div v-if="lastPage > 1" class="flex items-center justify-between gap-4 pt-4">
    <p class="text-xs text-gray-400">
      Menampilkan
      <span class="font-semibold text-gray-600">{{ (currentPage - 1) * perPage + 1 }}</span>
      –
      <span class="font-semibold text-gray-600">{{ Math.min(currentPage * perPage, total) }}</span>
      dari
      <span class="font-semibold text-gray-600">{{ total }}</span>
      data
    </p>
    <div class="flex items-center gap-1">
      <button
        :disabled="currentPage <= 1"
        class="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="goTo(currentPage - 1)"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      <template v-for="page in lastPage" :key="page">
        <button
          v-if="page === 1 || page === lastPage || Math.abs(page - currentPage) <= 1"
          :class="[
            'w-8 h-8 rounded-lg text-xs font-semibold',
            page === currentPage
              ? 'bg-gray-800 text-white'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
          ]"
          @click="goTo(page)"
        >
          {{ page }}
        </button>
        <span
          v-else-if="page === 2 || page === lastPage - 1"
          class="text-gray-400 text-xs px-1"
        >…</span>
      </template>
      <button
        :disabled="currentPage >= lastPage"
        class="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="goTo(currentPage + 1)"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

