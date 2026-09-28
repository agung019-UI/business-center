<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useShiftStore } from '@/stores/shift'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import { AlertTriangle } from 'lucide-vue-next'

const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const shiftStore = useShiftStore()

function openShiftPage() {
  router.push({ name: 'Shifts' })
}
</script>

<template>
  <!-- Root: full viewport, flex row, no overflow — children handle their own scroll -->
  <div class="flex h-screen overflow-hidden bg-[#F5F7FA]">

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 bg-black/40 z-30 lg:hidden"
        @click="mobileSidebarOpen = false"
      />
    </Transition>

    <!-- ── Desktop sidebar ──
         Wrapper takes the natural width of <aside> (aside animates its own width).
         sticky + h-screen keeps it pinned while main content scrolls.
    -->
    <div class="hidden lg:block shrink-0 h-screen sticky top-0">
      <Sidebar
        :collapsed="sidebarCollapsed"
        class="h-full"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      />
    </div>

    <!-- Mobile sidebar drawer -->
    <Transition name="slide">
      <div v-if="mobileSidebarOpen" class="lg:hidden fixed inset-y-0 left-0 z-40 h-screen">
        <Sidebar
          :collapsed="false"
          class="h-full"
          @toggle-collapse="mobileSidebarOpen = false"
          @close="mobileSidebarOpen = false"
        />
      </div>
    </Transition>

    <!-- Main content — flex-1 fills remaining space, scrolls independently -->
    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Navbar @open-mobile-sidebar="mobileSidebarOpen = true" />

      <!-- Shift warning banner (Kasir only) -->
      <div
        v-if="authStore.isKasir && !shiftStore.hasActiveShift && route.name !== 'Shifts'"
        class="bg-amber-50 border-b border-amber-200 px-4 lg:px-6 py-2.5 flex items-center justify-between text-sm shrink-0"
      >
        <span class="text-amber-800 flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          Anda belum membuka shift kasir. Buka shift untuk mulai bertransaksi.
        </span>
        <button
          class="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
          @click="openShiftPage"
        >
          Buka Shift
        </button>
      </div>

      <!-- Page content -->
      <main class="flex-1 p-4 lg:p-6 overflow-x-hidden">
        <RouterView />
      </main>
    </div>

  </div>
</template>
