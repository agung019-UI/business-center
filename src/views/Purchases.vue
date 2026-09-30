<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { usePurchaseStore } from '@/stores/purchase'
import { rupiah } from '@/utils/currency'
import { fmtDate } from '@/utils/date'
import { productService } from '@/services/productService'
import { supplierService } from '@/services/supplierService'
import BasePagination from '@/components/ui/BasePagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { Plus, Trash2 } from 'lucide-vue-next'

const toast = inject('toast')
const purchaseStore = usePurchaseStore()

const page = ref(1)
const showModal = ref(false)
const products = ref([])
const suppliers = ref([])

const defaultForm = () => ({ supplier_id: '', payment_method: 'CASH', note: '', items: [{ product_id: '', qty: 1, price: 0, expiration_date: '' }] })
const form = ref(defaultForm())

const formTotal = computed(() =>
  form.value.items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0), 0),
)

function addLine() {
  form.value.items.push({ product_id: '', qty: 1, price: 0, expiration_date: '' })
}

function removeLine(idx) {
  if (form.value.items.length > 1) form.value.items.splice(idx, 1)
}

function onProductChange(line) {
  const p = products.value.find((p) => p.id === line.product_id)
  if (p) line.price = p.cost_price ?? 0
}

async function save() {
  if (!form.value.supplier_id) { toast?.('Pilih supplier terlebih dahulu.', 'error'); return }
  if (!form.value.items.some((i) => i.product_id)) { toast?.('Tambahkan minimal satu produk.', 'error'); return }
  try {
    await purchaseStore.createPurchase({
      supplier_id: form.value.supplier_id,
      payment_method: form.value.payment_method,
      note: form.value.note,
      items: form.value.items.filter((i) => i.product_id).map((i) => ({
        product_id: i.product_id,
        qty: Number(i.qty),
        price: Number(i.price),
        subtotal: Number(i.qty) * Number(i.price),
        expiration_date: i.expiration_date || null
      })),
      total: formTotal.value,
    })
    toast?.('Pembelian berhasil disimpan.', 'success')
    showModal.value = false
    form.value = defaultForm()
    fetchPurchases()
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

function fetchPurchases() {
  purchaseStore.fetchPurchases({ page: page.value, per_page: 20 })
}

onMounted(async () => {
  fetchPurchases()
  try { const d = await productService.getProducts({ per_page: 200 }); products.value = Array.isArray(d) ? d : (d.data || []) } catch {}
  try { const d = await supplierService.getSuppliers(); suppliers.value = Array.isArray(d) ? d : (d.data || []) } catch {}
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Pembelian</h1>
      <p class="mt-1 text-sm text-gray-500">Kelola transaksi pembelian dan restok barang.</p>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Pembelian Barang</h2>
        <p class="text-sm text-gray-400">{{ purchaseStore.pagination.total }} pembelian tercatat</p>
      </div>
      <button
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm"
        @click="showModal = true; form = defaultForm()"
      >
        <Plus class="w-4 h-4" /> Pembelian Baru
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div v-if="purchaseStore.loading" class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">No Pembelian</th>
                <th class="px-3 py-3 font-semibold">Tanggal</th>
                <th class="px-3 py-3 font-semibold">Supplier</th>
                <th class="px-3 py-3 font-semibold">Total</th>
                <th class="px-3 py-3 font-semibold">Metode</th>
                <th class="px-3 py-3 font-semibold">Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in purchaseStore.purchases"
                :key="p.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ p.invoice_no || p.no }}</td>
                <td class="px-3 py-3 text-gray-500 text-xs">{{ fmtDate(p.created_at || p.date, true) }}</td>
                <td class="px-3 py-3 text-gray-700 font-medium">{{ p.supplier?.name || p.supplier_name }}</td>
                <td class="px-3 py-3 font-bold text-gray-800 num">{{ rupiah(p.total) }}</td>
                <td class="px-3 py-3">
                  <span class="text-[10.5px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {{ p.payment_method }}
                  </span>
                </td>
                <td class="px-3 py-3 text-gray-400 text-xs">{{ p.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState
          v-if="!purchaseStore.purchases.length"
          title="Belum ada pembelian"
          description="Catat pembelian barang dari supplier untuk menambah stok."
        />
        <div class="px-4 pb-4">
          <BasePagination
            :current-page="purchaseStore.pagination.current_page"
            :last-page="purchaseStore.pagination.last_page"
            :total="purchaseStore.pagination.total"
            :per-page="purchaseStore.pagination.per_page"
            @change="(p) => { page = p; fetchPurchases() }"
          />
        </div>
      </template>
    </div>

    <!-- Purchase Modal -->
    <BaseModal :show="showModal" title="Pembelian Baru" size="lg" @close="showModal = false">
      <form class="p-5 space-y-3.5" @submit.prevent="save">
        <!-- Supplier & Metode -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Supplier *</label>
            <select v-model="form.supplier_id" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
              <option value="">Pilih supplier</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Metode Pembayaran</label>
            <select v-model="form.payment_method" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
              <option>CASH</option>
              <option>TRANSFER</option>
              <option>KREDIT</option>
            </select>
          </div>
        </div>

        <!-- Items -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-gray-600">Item Pembelian *</label>
            <button type="button" class="text-xs font-semibold text-green-600 hover:text-green-700" @click="addLine">
              + Tambah item
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="(line, idx) in form.items" :key="idx" class="flex gap-2 items-center">
              <select
                v-model="line.product_id"
                class="flex-1 px-2.5 py-2 rounded-lg border border-gray-200 outline-none text-xs focus:border-green-500"
                @change="onProductChange(line)"
              >
                <option value="">Pilih produk</option>
                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
              <input
                v-model="line.qty"
                type="number"
                min="1"
                placeholder="Qty"
                class="w-16 px-2 py-2 rounded-lg border border-gray-200 outline-none text-xs no-spin focus:border-green-500"
              />
              <input
                v-model="line.price"
                type="number"
                min="0"
                placeholder="Harga"
                class="w-24 px-2 py-2 rounded-lg border border-gray-200 outline-none text-xs no-spin focus:border-green-500"
              />
              <input
                v-model="line.expiration_date"
                type="date"
                title="Tanggal Kedaluwarsa"
                class="w-32 px-2 py-2 rounded-lg border border-gray-200 outline-none text-xs focus:border-green-500"
              />
              <button type="button" class="text-gray-400 hover:text-red-500 shrink-0 transition" @click="removeLine(idx)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Catatan -->
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Catatan</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>

        <!-- Total -->
        <div class="flex justify-between items-center pt-2 border-t border-gray-200">
          <span class="text-sm font-semibold text-gray-600">Total Pembelian</span>
          <span class="text-lg font-bold text-gray-800 num">{{ rupiah(formTotal) }}</span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
            @click="showModal = false"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="purchaseStore.saving"
            class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <svg v-if="purchaseStore.saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Simpan Pembelian
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
