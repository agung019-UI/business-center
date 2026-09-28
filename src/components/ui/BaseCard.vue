<script setup>
defineProps({
  padding: { type: String, default: 'p-5' },
  shadow: { type: Boolean, default: true },
})
</script>

<template>
  <div
    :class="[
      'bg-white rounded-xl',
      padding,
      shadow && 'shadow-card',
    ]"
  >
    <slot />
  </div>
</template>

