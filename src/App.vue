<script setup>
import { ref, provide } from 'vue'
import { RouterView } from 'vue-router'
import Toast from '@/components/ui/Toast.vue'

const toastRef = ref(null)

// Global toast function provided to all child components
function toast(msg, type = 'info') {
  toastRef.value?.addToast(msg, type)
}

provide('toast', toast)
</script>

<template>
  <RouterView />
  <Toast ref="toastRef" />
</template>

