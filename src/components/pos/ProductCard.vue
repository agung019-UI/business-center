<script setup>
import { stockStatus } from '@/utils/permissions'
import { rupiah } from '@/utils/currency'

defineProps({
  product: { type: Object, required: true },
})

defineEmits(['add'])
</script>

<template>
  <button
    :disabled="(product.stock ?? 0) <= 0"
    class="bg-white rounded-xl p-3 text-left shadow-card hover:shadow-md hover:-translate-y-0.5 transition disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed group border border-transparent hover:border-green-200"
    @click="$emit('add', product)"
  >
    <!-- Product image placeholder -->
    <div class="aspect-square rounded-lg bg-gray-50 flex items-center justify-center mb-2.5 group-hover:bg-green-50 transition overflow-hidden">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="w-10 h-10 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/>
        <path d="M3 8l9 5 9-5"/>
        <path d="M12 13v8"/>
      </svg>
    </div>

    <p class="text-sm font-semibold text-gray-800 truncate leading-snug">{{ product.name }}</p>

    <div class="flex items-center justify-between mt-1">
      <p class="text-sm font-bold text-green-600 num">{{ rupiah(product.sell_price) }}</p>
      <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', stockStatus(product).cls]">
        {{ (product.stock ?? 0) <= 0 ? 'Habis' : product.stock }}
      </span>
    </div>
  </button>
</template>

