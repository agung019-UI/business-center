<script setup>
import { PackageOpen } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'Tidak ada data' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
      <slot name="icon">
        <PackageOpen class="w-8 h-8" />
      </slot>
    </div>
    <h3 class="text-sm font-semibold text-gray-600 mb-1">{{ title }}</h3>
    <p v-if="description" class="text-xs text-gray-400 max-w-xs">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

