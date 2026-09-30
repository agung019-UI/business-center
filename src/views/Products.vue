<script setup>
import { ref, onMounted, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import { stockStatus } from '@/utils/permissions'
import { rupiah } from '@/utils/currency'
import { categoryService } from '@/services/categoryService'
import { supplierService } from '@/services/supplierService'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Plus, Search, Pencil, Trash2, Check, X } from 'lucide-vue-next'

const toast = inject('toast')
const authStore = useAuthStore()
const productStore = useProductStore()

const search = ref('')
const categoryFilter = ref('')
const stockFilterAdmin = ref('')
const page = ref(1)

const categories = ref([])
const suppliers = ref([])

const showModal = ref(false)
const inlineEditId = ref(null)
const inlineEditForm = ref(defaultForm())
const deleteTarget = ref(null)
const deletingLoading = ref(false)
const savingLoading = ref(false)

const form = ref(defaultForm())

function defaultForm() {
  return {
    name: '',
    barcode: '',
    description: '',
    category_id: '',
    supplier_id: '',
    cost_price: 0,
    sell_price: 0,
    stock: 0,
    min_stock: 5,
    unit: 'Pcs',
    active: true,
  }
}

function openAdd() {
  form.value = defaultForm()
  showModal.value = true
}

function openInlineEdit(p) {
  inlineEditId.value = p.id
  inlineEditForm.value = {
    name: p.name,
    barcode: p.barcode || '',
    description: p.description || '',
    category_id: p.category_id || p.category?.id || '',
    supplier_id: p.supplier_id || '',
    cost_price: p.cost_price,
    sell_price: p.sell_price,
    stock: p.stock,
    min_stock: p.min_stock,
    unit: p.unit,
    active: p.active !== false,
  }
}

function cancelInlineEdit() {
  inlineEditId.value = null
}

async function saveInlineEdit() {
  if (!inlineEditForm.value.name.trim()) { toast?.('Nama produk wajib diisi.', 'error'); return }
  if (!inlineEditForm.value.category_id) { toast?.('Kategori wajib dipilih.', 'error'); return }
  savingLoading.value = true
  try {
    await productStore.updateProduct(inlineEditId.value, inlineEditForm.value)
    toast?.('Produk berhasil diperbarui.', 'success')
    inlineEditId.value = null
    fetchProducts()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    savingLoading.value = false
  }
}

async function saveProduct() {
  if (!form.value.name.trim()) { toast?.('Nama produk wajib diisi.', 'error'); return }
  if (!form.value.category_id) { toast?.('Kategori wajib dipilih.', 'error'); return }
  savingLoading.value = true
  try {
    await productStore.createProduct(form.value)
    toast?.('Produk berhasil ditambahkan.', 'success')
    showModal.value = false
    fetchProducts()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    savingLoading.value = false
  }
}

async function deleteProduct() {
  if (!deleteTarget.value) return
  deletingLoading.value = true
  try {
    await productStore.deleteProduct(deleteTarget.value.id)
    toast?.('Produk dihapus.', 'success')
    deleteTarget.value = null
    fetchProducts()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    deletingLoading.value = false
  }
}

let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchProducts() }, 400)
}

function fetchProducts() {
  productStore.fetchProducts({
    search: search.value || undefined,
    category: categoryFilter.value || undefined,
    stock_status: stockFilterAdmin.value || undefined,
    page: page.value,
    per_page: 20,
  })
}

onMounted(async () => {
  fetchProducts()
  try {
    const cData = await categoryService.getCategories()
    categories.value = Array.isArray(cData) ? cData : (cData.data || [])
  } catch {}
  try {
    const sData = await supplierService.getSuppliers()
    suppliers.value = Array.isArray(sData) ? sData : (sData.data || [])
  } catch {}
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Manajemen Produk</h1>
        <p class="text-sm text-gray-400">{{ productStore.pagination.total }} produk terdaftar</p>
      </div>
      <button
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm"
        @click="openAdd"
      >
        <Plus class="w-4 h-4" />
        Tambah Produk
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <!-- Filters -->
      <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            v-model="search"
            placeholder="Cari produk..."
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:border-green-400 outline-none text-sm"
            @input="onSearchInput"
          />
        </div>
        <select
          v-model="categoryFilter"
          class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none"
          @change="page = 1; fetchProducts()"
        >
          <option value="">Semua Kategori</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select
          v-model="stockFilterAdmin"
          class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none"
          @change="page = 1; fetchProducts()"
        >
          <option value="">Semua Status</option>
          <option value="STOK AMAN">STOK AMAN</option>
          <option value="STOK MENIPIS">STOK MENIPIS</option>
          <option value="STOK HABIS">STOK HABIS</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="productStore.loading" class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>

      <template v-else>
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Produk</th>
                <th class="px-3 py-3 font-semibold">Kategori</th>
                <th class="px-3 py-3 font-semibold">Harga Beli</th>
                <th class="px-3 py-3 font-semibold">Harga Jual</th>
                <th class="px-3 py-3 font-semibold">Stok</th>
                <th class="px-3 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in productStore.products"
                :key="p.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <template v-if="inlineEditId === p.id">
                  <td class="px-4 py-3">
                    <div class="flex flex-col gap-1">
                      <input v-model="inlineEditForm.name" placeholder="Nama Produk" class="w-full px-2 py-1 rounded border text-sm" />
                      <input v-model="inlineEditForm.barcode" placeholder="Barcode" class="w-full px-2 py-1 rounded border text-xs" />
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <select v-model="inlineEditForm.category_id" class="w-full px-2 py-1 rounded border text-sm">
                      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.cost_price" type="number" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.sell_price" type="number" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-1">
                      <input v-model="inlineEditForm.stock" type="number" class="w-16 px-2 py-1 rounded border text-sm" />
                      <input v-model="inlineEditForm.unit" placeholder="Satuan" class="w-12 px-2 py-1 rounded border text-sm" />
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <label class="flex items-center gap-1 text-xs whitespace-nowrap">
                      <input v-model="inlineEditForm.active" type="checkbox" /> Aktif
                    </label>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button class="p-1.5 rounded-lg text-green-600 hover:bg-green-50" @click="saveInlineEdit"><Check class="w-4 h-4" /></button>
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" @click="cancelInlineEdit"><X class="w-4 h-4" /></button>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td class="px-4 py-3">
                    <div>
                      <p class="font-semibold text-gray-800">{{ p.name }}</p>
                      <p class="text-[11px] text-gray-400 font-mono">{{ p.code }} • {{ p.barcode }}</p>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-gray-500">{{ p.category?.name || p.category }}</td>
                  <td class="px-3 py-3 text-gray-500 num">{{ rupiah(p.cost_price) }}</td>
                  <td class="px-3 py-3 font-semibold text-gray-800 num">{{ rupiah(p.sell_price) }}</td>
                  <td class="px-3 py-3 num">{{ p.stock }} {{ p.unit }}</td>
                  <td class="px-3 py-3">
                    <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded', stockStatus(p).cls]">
                      {{ stockStatus(p).label }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button
                        class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        @click="openInlineEdit(p)"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button
                        v-if="authStore.isAdmin"
                        class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                        @click="deleteTarget = p"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!productStore.products.length" class="py-4">
          <EmptyState title="Tidak ada produk" description="Tambah produk baru untuk memulai." />
        </div>

        <div class="px-4 pb-4">
          <BasePagination
            :current-page="productStore.pagination.current_page"
            :last-page="productStore.pagination.last_page"
            :total="productStore.pagination.total"
            :per-page="productStore.pagination.per_page"
            @change="(p) => { page = p; fetchProducts() }"
          />
        </div>
      </template>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      :show="showModal"
      :title="'Tambah Produk'"
      size="lg"
      @close="showModal = false"
    >
      <form class="p-5 space-y-3.5" @submit.prevent="saveProduct">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Barcode</label>
            <input v-model="form.barcode" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Satuan</label>
            <input v-model="form.unit" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Nama Produk *</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Deskripsi</label>
          <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Kategori *</label>
            <select v-model="form.category_id" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
              <option value="">Pilih kategori</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Supplier</label>
            <select v-model="form.supplier_id" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
              <option value="">-</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Harga Beli *</label>
            <input v-model="form.cost_price" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm no-spin focus:border-green-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Harga Jual *</label>
            <input v-model="form.sell_price" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm no-spin focus:border-green-500" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Stok Awal</label>
            <input v-model="form.stock" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm no-spin focus:border-green-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Stok Minimum</label>
            <input v-model="form.min_stock" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm no-spin focus:border-green-500" />
          </div>
          <div class="flex items-end pb-2">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input v-model="form.active" type="checkbox" class="rounded border-gray-300 text-green-600" />
              Aktif
            </label>
          </div>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50" @click="showModal = false">Batal</button>
          <button type="submit" :disabled="savingLoading" class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2">
            <svg v-if="savingLoading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ savingLoading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirm -->
    <ConfirmDialog
      :show="!!deleteTarget"
      :description="`Produk '${deleteTarget?.name}' akan dihapus secara permanen.`"
      :loading="deletingLoading"
      @close="deleteTarget = null"
      @confirm="deleteProduct"
    />
  </div>
</template>

