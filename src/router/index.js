import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { canAccess } from '@/utils/permissions'

// ─── Route Components (lazy-loaded) ─────────────────────────────────────────
const Login = () => import('@/views/auth/Login.vue')
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const POS = () => import('@/views/POS.vue')
const Sales = () => import('@/views/Sales.vue')
const Receivables = () => import('@/views/Receivables.vue')
const Purchases = () => import('@/views/Purchases.vue')
const Products = () => import('@/views/Products.vue')
const Categories = () => import('@/views/Categories.vue')
const Suppliers = () => import('@/views/Suppliers.vue')
const Stock = () => import('@/views/Stock.vue')
const Cash = () => import('@/views/Cash.vue')
const Shifts = () => import('@/views/Shifts.vue')
const SalesReport = () => import('@/views/reports/SalesReport.vue')
const ProfitReport = () => import('@/views/reports/ProfitReport.vue')
const StockReport = () => import('@/views/reports/StockReport.vue')
const Users = () => import('@/views/Users.vue')
const Settings = () => import('@/views/Settings.vue')

// ─── Routes ──────────────────────────────────────────────────────────────────
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, roles: ['ADMIN', 'KASIR'], title: 'Dashboard' },
      },
      {
        path: 'pos',
        name: 'POS',
        component: POS,
        meta: { requiresAuth: true, roles: ['KASIR'], title: 'Kasir / POS' },
      },
      {
        path: 'penjualan',
        name: 'Sales',
        component: Sales,
        meta: { requiresAuth: true, roles: ['ADMIN', 'KASIR'], title: 'Riwayat Penjualan' },
      },
      {
        path: 'piutang',
        name: 'Receivables',
        component: Receivables,
        meta: { requiresAuth: true, roles: ['ADMIN', 'KASIR'], title: 'Catatan Piutang' },
      },
      {
        path: 'pembelian',
        name: 'Purchases',
        component: Purchases,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Pembelian Barang' },
      },
      {
        path: 'produk',
        name: 'Products',
        component: Products,
        meta: { requiresAuth: true, roles: ['ADMIN', 'KASIR'], title: 'Manajemen Produk' },
      },
      {
        path: 'kategori',
        name: 'Categories',
        component: Categories,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Kategori Produk' },
      },
      {
        path: 'supplier',
        name: 'Suppliers',
        component: Suppliers,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Supplier' },
      },
      {
        path: 'stok',
        name: 'Stock',
        component: Stock,
        meta: { requiresAuth: true, roles: ['ADMIN', 'KASIR'], title: 'Manajemen Stok' },
      },
      {
        path: 'kas',
        name: 'Cash',
        component: Cash,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Kas' },
      },
      {
        path: 'shift',
        name: 'Shifts',
        component: Shifts,
        meta: { requiresAuth: true, roles: ['ADMIN', 'KASIR'], title: 'Shift Kasir' },
      },
      {
        path: 'laporan/penjualan',
        name: 'SalesReport',
        component: SalesReport,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Laporan Penjualan' },
      },
      {
        path: 'laporan/keuntungan',
        name: 'ProfitReport',
        component: ProfitReport,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Laporan Keuntungan' },
      },
      {
        path: 'laporan/stok',
        name: 'StockReport',
        component: StockReport,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Laporan Stok' },
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Pengguna' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Pengaturan' },
      },
    ],
  },
  // Catch-all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// ─── Navigation Guard ─────────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Restore session from token on first load
  if (!authStore.initialized) {
    if (authStore.token) {
      await authStore.fetchMe()
    }
    authStore.setInitialized()
  }

  const isAuthenticated = authStore.isAuthenticated
  const role = authStore.userRole

  // Guest route: redirect logged-in users to dashboard
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Auth required
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login' })
  }

  // Role check
  if (to.meta.roles && role && !to.meta.roles.includes(role)) {
    return next({ name: 'Dashboard' })
  }

  // Update document title
  if (to.meta.title) {
    document.title = `${to.meta.title} — Business Center Sekolah`
  }

  next()
})

export default router

