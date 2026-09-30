<script setup>
defineProps({
  label: String,
  value: String,
  sub: String,
  subColor: { type: String, default: 'text-gray-400' },
})
</script>

<template>
  <div class="bg-white rounded-xl p-4 shadow-card">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-semibold text-gray-400">{{ label }}</span>
      <span class="text-green-500">
        <slot name="icon" />
      </span>
    </div>
    <p class="text-xl font-bold text-gray-800 num">{{ value }}</p>
    <p v-if="sub" :class="['text-xs mt-1', subColor]">{{ sub }}</p>
  </div>
</template>

