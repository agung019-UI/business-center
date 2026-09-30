<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard, ShoppingCart, Receipt, CreditCard,
  Package, Tag, Layers,
  BarChart3, DollarSign,
  Clock, Settings, LogOut,
  ChevronLeft, ChevronRight, ChevronDown, Store, Users,
} from 'lucide-vue-next'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-collapse', 'close'])

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const role    = computed(() => authStore.user?.role)
const isAdmin = computed(() => role.value === 'ADMIN')

// ── Subnav accordion state ──────────────────────────────
// Default semua grup terbuka. Nilai undefined = open (default true).
// Set ke false saat user menutupnya.
const openGroups = ref({})

function isGroupOpen(label) {
  return openGroups.value[label] !== false
}

function toggleGroup(label) {
  openGroups.value[label] = !isGroupOpen(label)
}
// ────────────────────────────────────────────────────────

const navGroups = computed(() => [
  {
    items: [
      { name: 'Dashboard', to: { name: 'Dashboard' }, icon: LayoutDashboard, roles: ['ADMIN', 'KASIR'] },
    ],
  },
  {
    label: 'Transaksi',
    show: true,
    items: [
      { name: 'Kasir',     to: { name: 'POS' },        icon: ShoppingCart, roles: ['KASIR'] },
      { name: 'Penjualan', to: { name: 'Sales' },       icon: Receipt,      roles: ['ADMIN', 'KASIR'] },
      { name: 'Piutang',   to: { name: 'Receivables' }, icon: CreditCard,   roles: ['ADMIN', 'KASIR'] },
    ],
  },
  {
    label: 'Master Data',
    show: isAdmin.value,
    items: [
      { name: 'Produk',   to: { name: 'Products' },   icon: Package, roles: ['ADMIN', 'KASIR'] },
      { name: 'Kategori', to: { name: 'Categories' }, icon: Tag,     roles: ['ADMIN'] },
      { name: 'Stok',     to: { name: 'Stock' },      icon: Layers,  roles: ['ADMIN', 'KASIR'] },
    ],
  },
  {
    label: 'Keuangan',
    show: isAdmin.value,
    items: [
      { name: 'Laporan Penjualan', to: { name: 'SalesReport' },  icon: BarChart3,  roles: ['ADMIN'] },
      { name: 'Laporan Keuangan',  to: { name: 'ProfitReport' }, icon: DollarSign, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Sistem',
    show: isAdmin.value,
    items: [
      { name: 'Pengguna',    to: { name: 'Users' },    icon: Users,   roles: ['ADMIN'] },
      { name: 'Shift Kasir', to: { name: 'Shifts' },   icon: Clock,    roles: ['ADMIN', 'KASIR'] },
      { name: 'Pengaturan',  to: { name: 'Settings' }, icon: Settings, roles: ['ADMIN'] },
    ],
  },
])

function isActive(to)     { return route.name === to.name }
function canSeeItem(item) { return item.roles.includes(role.value) }

// Cek apakah ada item aktif di grup ini
function hasActiveItem(group) {
  return group.items?.some(item => isActive(item.to) && canSeeItem(item))
}

function navigate(to) {
  router.push(to)
  emit('close')
}

async function logout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <aside
    :class="[
      'bg-white text-gray-900 flex flex-col h-full overflow-hidden',
      'transition-[width] duration-300 ease-in-out',
      'shadow-[4px_0_14px_rgba(0,0,0,0.10)]',
      collapsed ? 'w-[76px]' : 'w-64',
    ]"
  >

    <!-- ═══════════════════════════════════════════════
         HEADER — Logo + Tombol Toggle
         ═══════════════════════════════════════════════ -->
    <div
      :class="[
        'h-16 shrink-0 flex items-center border-b border-gray-100',
        collapsed ? 'px-1 justify-between' : 'px-4 gap-3',
      ]"
    >
      <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 overflow-hidden">
        <img src="@/assets/budhi-warman-logo.jpg" alt="Logo" class="w-full h-full object-contain" />
      </div>

      <div v-show="!collapsed" class="flex-1 min-w-0 leading-tight overflow-hidden">
        <p class="text-sm font-bold text-green-700 truncate">Budhi Warman II</p>
        <p class="text-[11px] font-medium text-gray-500 truncate">Jakarta</p>
      </div>

      <button
        class="hidden lg:flex shrink-0 items-center justify-center
               w-7 h-7 rounded-lg bg-green-600 hover:bg-green-700
               text-white transition-colors"
        :title="collapsed ? 'Buka Menu' : 'Ciutkan Menu'"
        @click="$emit('toggle-collapse')"
      >
        <ChevronLeft  v-if="!collapsed" class="w-[18px] h-[18px]" />
        <ChevronRight v-else            class="w-[18px] h-[18px]" />
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════
         NAV — Hanya bagian ini yang bisa scroll
         ═══════════════════════════════════════════════ -->
    <nav
      class="flex-1 min-h-0 overflow-y-auto py-2 space-y-0.5"
      :class="collapsed ? 'px-1.5' : 'px-3'"
    >
      <template v-for="group in navGroups" :key="group.label ?? '__root'">
        <div v-if="group.show !== false">

          <!-- ─── Grup tanpa label (Dashboard) ─── -->
          <template v-if="!group.label">
            <template v-for="item in group.items" :key="item.name">
              <button
                v-if="canSeeItem(item)"
                :title="collapsed ? item.name : ''"
                :class="[
                  'w-full flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive(item.to)
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700',
                ]"
                @click="navigate(item.to)"
              >
                <component
                  :is="item.icon"
                  :class="['w-[18px] h-[18px] shrink-0', isActive(item.to) ? 'text-white' : 'text-green-600']"
                />
                <span v-show="!collapsed" class="truncate">{{ item.name }}</span>
              </button>
            </template>
          </template>

          <!-- ─── Grup dengan label (accordion) ─── -->
          <template v-else>
            <div :class="collapsed ? 'mt-1' : 'mt-3'">

              <!-- Separator tipis di mode collapsed -->
              <div v-if="collapsed" class="border-t border-gray-100 mb-1 mx-1" />

              <!-- Header grup — klikable untuk expand/collapse (hanya saat expanded) -->
              <button
                v-if="!collapsed"
                class="w-full flex items-center justify-between px-2 py-1 mb-0.5
                       rounded-md hover:bg-gray-50 transition-colors group"
                @click="toggleGroup(group.label)"
              >
                <span
                  :class="[
                    'text-[10.5px] font-bold uppercase tracking-wider transition-colors',
                    hasActiveItem(group) ? 'text-green-700' : 'text-green-600 group-hover:text-green-700',
                  ]"
                >
                  {{ group.label }}
                </span>
                <ChevronDown
                  :class="[
                    'w-3.5 h-3.5 text-green-500 transition-transform duration-200',
                    isGroupOpen(group.label) ? 'rotate-0' : '-rotate-90',
                  ]"
                />
              </button>

              <!-- Item-item subnav -->
              <Transition name="subnav">
                <div
                  v-show="collapsed || isGroupOpen(group.label)"
                  class="space-y-0.5"
                  :class="collapsed ? '' : 'pl-2'"
                >
                  <template v-for="item in group.items" :key="item.name">
                    <button
                      v-if="canSeeItem(item)"
                      :title="collapsed ? item.name : ''"
                      :class="[
                        'w-full flex items-center rounded-lg text-sm font-medium transition-colors',
                        collapsed ? 'justify-center py-2.5' : 'gap-2.5 px-2.5 py-2',
                        isActive(item.to)
                          ? 'bg-green-600 text-white'
                          : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                      ]"
                      @click="navigate(item.to)"
                    >
                      <component
                        :is="item.icon"
                        :class="['w-[17px] h-[17px] shrink-0', isActive(item.to) ? 'text-white' : 'text-green-500']"
                      />
                      <span v-show="!collapsed" class="truncate text-[13px]">{{ item.name }}</span>
                    </button>
                  </template>
                </div>
              </Transition>

            </div>
          </template>

        </div>
      </template>
    </nav>

    <!-- ═══════════════════════════════════════════════
         FOOTER — Tombol Keluar
         ═══════════════════════════════════════════════ -->
    <div
      class="shrink-0 border-t border-gray-100"
      :class="collapsed ? 'p-1.5' : 'p-2.5'"
    >
      <button
        :title="collapsed ? 'Keluar' : ''"
        :class="[
          'w-full flex items-center rounded-lg text-sm font-medium transition-colors',
          'text-red-500 hover:bg-red-50 hover:text-red-600',
          collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5',
        ]"
        @click="logout"
      >
        <LogOut class="w-[18px] h-[18px] shrink-0" />
        <span v-show="!collapsed">Keluar</span>
      </button>
    </div>

  </aside>
</template>

<style scoped>
/* Animasi accordion subnav */
.subnav-enter-active,
.subnav-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.subnav-enter-from,
.subnav-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.subnav-enter-to,
.subnav-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
