<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useShiftStore } from '@/stores/shift'
import { Menu, Bell } from 'lucide-vue-next'

const emit = defineEmits(['open-mobile-sidebar'])

const route = useRoute()
const authStore = useAuthStore()
const shiftStore = useShiftStore()

const pageTitle = computed(() => route.meta.title || 'Dashboard')
const user = computed(() => authStore.user)
const hasActiveShift = computed(() => shiftStore.hasActiveShift)

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 lg:px-6 shrink-0 sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
    <!-- Mobile menu button -->
    <button
      class="lg:hidden text-gray-500 hover:text-gray-700 p-1"
      @click="$emit('open-mobile-sidebar')"
    >
      <Menu class="w-6 h-6" />
    </button>

    <!-- Page title (mobile) -->
    <h1 class="font-bold text-gray-800 text-base lg:hidden">{{ pageTitle }}</h1>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Right side -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <!-- Shift indicator (kasir only) -->
      <div
        v-if="user?.role === 'KASIR'"
        :class="[
          'hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full',
          hasActiveShift ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700',
        ]"
      >
        <span
          :class="['w-1.5 h-1.5 rounded-full', hasActiveShift ? 'bg-green-500' : 'bg-amber-500']"
        />
        {{ hasActiveShift ? 'Shift Aktif' : 'Shift Belum Dibuka' }}
      </div>

      <!-- Notification bell -->
      <button class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50">
        <Bell class="w-5 h-5" />
      </button>

      <div class="w-px h-6 bg-gray-100 hidden sm:block" />

      <!-- User info -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
          {{ getInitials(user?.name) }}
        </div>
        <div class="hidden md:block leading-tight">
          <p class="text-sm font-semibold text-gray-800">{{ user?.name }}</p>
          <p class="text-[11px] text-gray-400">{{ user?.role }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

