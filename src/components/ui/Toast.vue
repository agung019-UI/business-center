<script setup>
import { ref } from 'vue'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-vue-next'

const toasts = ref([])

let idCounter = 0

function addToast(msg, type = 'info', duration = 3400) {
  const id = ++idCounter
  toasts.value.push({ id, msg, type })
  setTimeout(() => removeToast(id), duration)
}

function removeToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

// Expose so parent can call via ref or provide/inject
defineExpose({ addToast })
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[60] space-y-2 w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="[
            'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium sm:min-w-[300px] pointer-events-auto',
            t.type === 'success' && 'bg-green-600 text-white',
            t.type === 'error' && 'bg-red-500 text-white',
            t.type === 'warning' && 'bg-amber-500 text-white',
            t.type === 'info' && 'bg-gray-800 text-white',
          ]"
        >
          <CheckCircle v-if="t.type === 'success'" class="w-4 h-4 shrink-0" />
          <AlertCircle v-else-if="t.type === 'error' || t.type === 'warning'" class="w-4 h-4 shrink-0" />
          <Info v-else class="w-4 h-4 shrink-0" />
          <span class="flex-1">{{ t.msg }}</span>
          <button class="opacity-70 hover:opacity-100" @click="removeToast(t.id)">
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

