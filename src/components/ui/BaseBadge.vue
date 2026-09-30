<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default', // default | success | warning | danger | info
  },
  size: {
    type: String,
    default: 'sm', // xs | sm | md
  },
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-bold rounded-full',
      size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
      size === 'sm' && 'px-2 py-0.5 text-[11px]',
      size === 'md' && 'px-2.5 py-1 text-xs',
      variant === 'default' && 'bg-gray-100 text-gray-600',
      variant === 'success' && 'bg-green-50 text-green-700 ring-1 ring-green-200',
      variant === 'warning' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      variant === 'danger' && 'bg-red-50 text-red-600 ring-1 ring-red-200',
      variant === 'info' && 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
    ]"
  >
    <slot />
  </span>
</template>

