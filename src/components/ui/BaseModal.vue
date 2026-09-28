<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md', // sm | md | lg | xl
  },
  persistent: Boolean, // prevent close on backdrop click
})

const emit = defineEmits(['close'])

function onBackdrop() {
  if (!props.persistent) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          @click="onBackdrop"
        />

        <!-- Panel -->
        <div
          :class="[
            'relative bg-white rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl',
            'max-h-[92vh] w-full overflow-hidden',
            size === 'sm' && 'sm:max-w-sm',
            size === 'md' && 'sm:max-w-md',
            size === 'lg' && 'sm:max-w-lg',
            size === 'xl' && 'sm:max-w-xl',
          ]"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0"
          >
            <slot name="header">
              <h3 class="font-bold text-gray-800 text-base">{{ title }}</h3>
            </slot>
            <button
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
              @click="$emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="shrink-0 px-5 py-4 border-t border-gray-200">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

