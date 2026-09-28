<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden px-4">
    <!-- Decorative bg -->
    <div class="absolute inset-0 opacity-[0.07]" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 28px 28px;" />
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-gray-500/30 rounded-full blur-3xl" />
    <div class="relative w-full max-w-md z-10">
      <slot />
    </div>
  </div>
</template>

