<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
  color: { type: String, default: 'teal' },
})
</script>

<template>
  <div class="flex items-center justify-center">
    <svg
      :class="[
        'animate-spin',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-6 h-6',
        size === 'lg' && 'w-8 h-8',
        color === 'teal' && 'text-green-600',
        color === 'navy' && 'text-gray-600',
        color === 'white' && 'text-white',
      ]"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
</template>

