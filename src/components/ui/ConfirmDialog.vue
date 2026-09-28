<script setup>
import { Trash2 } from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'

defineProps({
  show: Boolean,
  title: { type: String, default: 'Hapus data ini?' },
  description: { type: String, default: 'Tindakan ini tidak dapat dibatalkan.' },
  loading: Boolean,
  confirmLabel: { type: String, default: 'Hapus' },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <BaseModal :show="show" size="sm" @close="$emit('close')">
    <div class="p-6 text-center">
      <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Trash2 class="w-5 h-5 text-red-500" />
      </div>
      <h3 class="font-bold text-gray-800 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-400 mb-6">{{ description }}</p>
      <div class="flex gap-3">
        <button
          class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
          @click="$emit('close')"
        >
          Batal
        </button>
        <button
          :disabled="loading"
          class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          @click="$emit('confirm')"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Menghapus...' : confirmLabel }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

