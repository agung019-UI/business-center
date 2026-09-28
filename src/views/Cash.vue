<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useCashStore } from '@/stores/cash'
import { rupiah } from '@/utils/currency'
import { fmtDate, today, startOfMonth } from '@/utils/date'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-vue-next'

const toast = inject('toast')
const cashStore = useCashStore()

const dateFrom = ref(startOfMonth())
const dateTo = ref(today())
const typeFilter = ref('')

const showModal = ref(false)
const defaultForm = () => ({ type: 'MASUK', category: 'Pendapatan Lainnya', desc: '', nominal: 0 })
const form = ref(defaultForm())

const masukCategories = ['Penjualan', 'Pendapatan Lainnya']
const keluarCategories = ['Pembelian Barang', 'Operasional', 'Pengeluaran Lainnya']

const categoryOptions = computed(() =>
  form.value.type === 'MASUK' ? masukCategories : keluarCategories,
)

function setType(type) {
  form.value.type = type
  form.value.category = type === 'MASUK' ? 'Pendapatan Lainnya' : 'Operasional'
}

const totalMasuk = computed(() =>
  cashStore.transactions.filter((t) => t.type === 'MASUK').reduce((s, t) => s + (t.amount || t.nominal || 0), 0),
)
const totalKeluar = computed(() =>
  cashStore.transactions.filter((t) => t.type === 'KELUAR').reduce((s, t) => s + (t.amount || t.nominal || 0), 0),
)

async function save() {
  if (!form.value.nominal || Number(form.value.nominal) <= 0) { toast?.('Nominal harus diisi.', 'error'); return }
  try {
    await cashStore.createTransaction({
      type: form.value.type,
      category: form.value.category,
      description: form.value.desc,
      amount: Number(form.value.nominal),
    })
    toast?.('Transaksi kas disimpan.', 'success')
    showModal.value = false
    form.value = defaultForm()
    fetchTransactions()
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

function fetchTransactions() {
  cashStore.fetchTransactions({
    type: typeFilter.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
  })
}

onMounted(fetchTransactions)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Kas</h1>
        <p class="text-sm text-gray-400">Kelola kas masuk dan keluar</p>
      </div>
      <button class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm" @click="showModal = true; form = defaultForm()">
        <Plus class="w-4 h-4" />Catat Transaksi
      </button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="bg-white rounded-xl p-4 shadow-card">
        <p class="text-xs font-semibold text-gray-400 mb-1">Kas Masuk</p>
        <p class="text-lg font-bold text-green-600 num">{{ rupiah(totalMasuk) }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-card">
        <p class="text-xs font-semibold text-gray-400 mb-1">Kas Keluar</p>
        <p class="text-lg font-bold text-red-500 num">{{ rupiah(totalKeluar) }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-card">
        <p class="text-xs font-semibold text-gray-400 mb-1">Saldo</p>
        <p class="text-lg font-bold num" :class="totalMasuk - totalKeluar >= 0 ? 'text-gray-800' : 'text-red-600'">
          {{ rupiah(totalMasuk - totalKeluar) }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-card p-4 mb-4 flex flex-wrap gap-2.5">
      <input v-model="dateFrom" type="date" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none focus:border-green-400" @change="fetchTransactions" />
      <input v-model="dateTo" type="date" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none focus:border-green-400" @change="fetchTransactions" />
      <select v-model="typeFilter" class="px-3 py-2 rounded-lg bg-gray-50 border border-transparent text-sm outline-none" @change="fetchTransactions">
        <option value="">Semua Tipe</option>
        <option>MASUK</option>
        <option>KELUAR</option>
      </select>
    </div>

    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div v-if="cashStore.loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Tanggal</th>
                <th class="px-3 py-3 font-semibold">Tipe</th>
                <th class="px-3 py-3 font-semibold">Kategori</th>
                <th class="px-3 py-3 font-semibold">Deskripsi</th>
                <th class="px-3 py-3 font-semibold">Nominal</th>
                <th class="px-4 py-3 font-semibold">Operator</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in cashStore.transactions" :key="t.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500 text-xs">{{ fmtDate(t.created_at || t.date, true) }}</td>
                <td class="px-3 py-3">
                  <span :class="['flex items-center gap-1 text-[10.5px] font-bold w-fit px-2 py-0.5 rounded', t.type === 'MASUK' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600']">
                    <ArrowDownCircle v-if="t.type === 'MASUK'" class="w-3 h-3" />
                    <ArrowUpCircle v-else class="w-3 h-3" />
                    {{ t.type }}
                  </span>
                </td>
                <td class="px-3 py-3 text-gray-500">{{ t.category }}</td>
                <td class="px-3 py-3 text-gray-600">{{ t.description || t.desc }}</td>
                <td class="px-3 py-3 font-bold num" :class="t.type === 'MASUK' ? 'text-green-600' : 'text-red-500'">
                  {{ t.type === 'MASUK' ? '+' : '-' }}{{ rupiah(t.amount || t.nominal) }}
                </td>
                <td class="px-4 py-3 text-gray-400">{{ t.user || t.operator }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!cashStore.transactions.length" title="Tidak ada transaksi kas" description="Catat transaksi kas masuk atau keluar." />
      </template>
    </div>

    <!-- Cash Modal -->
    <BaseModal :show="showModal" title="Catat Transaksi Kas" size="sm" @close="showModal = false">
      <form class="p-5 space-y-3" @submit.prevent="save">
        <div class="flex gap-2">
          <button type="button" :class="['flex-1 py-2 rounded-lg text-xs font-semibold border transition', form.type === 'MASUK' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500']" @click="setType('MASUK')">Kas Masuk</button>
          <button type="button" :class="['flex-1 py-2 rounded-lg text-xs font-semibold border transition', form.type === 'KELUAR' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500']" @click="setType('KELUAR')">Kas Keluar</button>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Kategori</label>
          <select v-model="form.category" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
            <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Deskripsi</label>
          <input v-model="form.desc" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Nominal *</label>
          <input v-model="form.nominal" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm no-spin focus:border-green-500" />
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50" @click="showModal = false">Batal</button>
          <button type="submit" :disabled="cashStore.saving" class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2">
            <svg v-if="cashStore.saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Simpan
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

