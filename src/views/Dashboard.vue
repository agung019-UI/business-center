<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { rupiah } from '@/utils/currency'
import StatCard from '@/components/dashboard/StatCard.vue'
import SalesChart from '@/components/dashboard/SalesChart.vue'
import TopProductsList from '@/components/dashboard/TopProductsList.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import LowStockAlert from '@/components/dashboard/LowStockAlert.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Receipt, Package, BarChart3, Wallet, ShoppingCart, AlertTriangle } from 'lucide-vue-next'

const router = useRouter()
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

onMounted(() => {
  dashboardStore.fetchSummary()
})

const s = dashboardStore
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-sm text-gray-400">Ringkasan aktivitas Business Center hari ini</p>
      </div>
      <RouterLink
        to="/pos"
        class="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
      >
        <ShoppingCart class="w-4 h-4" />
        Buka Kasir
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="dashboardStore.loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error -->
    <div
      v-else-if="dashboardStore.error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3 text-red-600"
    >
      <AlertTriangle class="w-5 h-5 shrink-0" />
      <div>
        <p class="font-semibold text-sm">Gagal memuat data dashboard</p>
        <p class="text-xs mt-0.5">{{ dashboardStore.error }}</p>
      </div>
      <button
        class="ml-auto text-xs font-semibold hover:underline"
        @click="dashboardStore.fetchSummary()"
      >
        Coba lagi
      </button>
    </div>

    <template v-else-if="dashboardStore.summary">
      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <StatCard
          label="Penjualan Hari Ini"
          :value="rupiah(dashboardStore.summary.today_revenue ?? 0)"
          :sub="`${dashboardStore.summary.today_transactions ?? 0} transaksi`"
        >
          <template #icon><Receipt class="w-4 h-4" /></template>
        </StatCard>

        <StatCard
          label="Total Produk"
          :value="String(dashboardStore.summary.total_products ?? 0)"
          :sub="`${dashboardStore.summary.low_stock_count ?? 0} stok menipis`"
          sub-color="text-amber-600"
        >
          <template #icon><Package class="w-4 h-4 text-gray-400" /></template>
        </StatCard>

        <StatCard
          label="Pendapatan Bulan Ini"
          :value="rupiah(dashboardStore.summary.month_revenue ?? 0)"
          :sub="`${dashboardStore.summary.month_transactions ?? 0} transaksi`"
        >
          <template #icon><BarChart3 class="w-4 h-4" /></template>
        </StatCard>

        <StatCard
          label="Nilai Persediaan"
          :value="rupiah(dashboardStore.summary.inventory_value ?? 0)"
          :sub="`Keuntungan bulan ini ${rupiah(dashboardStore.summary.month_profit ?? 0)}`"
        >
          <template #icon><Wallet class="w-4 h-4 text-gray-400" /></template>
        </StatCard>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div class="lg:col-span-2">
          <SalesChart :data="dashboardStore.summary.sales_chart ?? []" />
        </div>
        <TopProductsList :products="dashboardStore.summary.top_products ?? []" />
      </div>

      <!-- Bottom row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <RecentTransactions :sales="dashboardStore.summary.recent_transactions ?? []" />
        </div>
        <LowStockAlert
          :products="[
            ...(dashboardStore.summary.out_of_stock_products ?? []),
            ...(dashboardStore.summary.low_stock_products ?? []),
          ]"
        />
      </div>
    </template>

    <!-- Empty state when no data yet -->
    <div v-else class="flex items-center justify-center py-20 text-gray-400 text-sm">
      Klik tombol "Coba lagi" untuk memuat data.
    </div>
  </div>
</template>

