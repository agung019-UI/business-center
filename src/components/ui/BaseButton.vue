<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | secondary | danger | ghost | outline
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
  loading: Boolean,
  disabled: Boolean,
  type: {
    type: String,
    default: 'button',
  },
  block: Boolean,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
      // sizes
      size === 'sm' && 'px-3 py-1.5 text-xs',
      size === 'md' && 'px-4 py-2.5 text-sm',
      size === 'lg' && 'px-5 py-3 text-sm',
      // variants
      variant === 'primary' && 'bg-green-600 hover:bg-green-700 text-white shadow-sm focus-visible:ring-green-500',
      variant === 'secondary' && 'bg-gray-800 hover:bg-gray-900 text-white shadow-sm focus-visible:ring-gray-500',
      variant === 'danger' && 'bg-red-500 hover:bg-red-600 text-white shadow-sm focus-visible:ring-red-500',
      variant === 'outline' && 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-300',
      variant === 'ghost' && 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-gray-300',
      block && 'w-full',
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

