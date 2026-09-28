<script setup>
import { ref, onMounted, inject } from 'vue'
import { receivablesService } from '@/services/receivablesService'
import { rupiah } from '@/utils/currency'
import { fmtDate } from '@/utils/date'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Plus, CheckCircle, Trash2, Search } from 'lucide-vue-next'

const toast = inject('toast')
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')

const showAddModal = ref(false)
const defaultForm = () => ({ name: '', item: '', qty: 1, price: 0 })
const form = ref(defaultForm())

const deleteTarget = ref(null)

const filtered = () =>
  search.value.trim()
    ? items.value.filter((i) =>
        i.name.toLowerCase().includes(search.value.toLowerCase()) ||
        i.item.toLowerCase().includes(search.value.toLowerCase()),
      )
    : items.value

async function fetchData() {
  loading.value = true
  try {
    items.value = await receivablesService.getReceivables()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  form.value = defaultForm()
  showAddModal.value = true
}

async function save() {
  if (!form.value.name.trim() || !form.value.item.trim()) {
    toast?.('Nama Penghutang dan Nama Barang wajib diisi.', 'error')
    return
  }
  saving.value = true
  try {
    await receivablesService.createReceivable(form.value)
    toast?.('Data piutang berhasil ditambahkan.', 'success')
    showAddModal.value = false
    fetchData()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function markAsPaid(id) {
  try {
    await receivablesService.markAsPaid(id)
    toast?.('Status piutang diubah menjadi lunas.', 'success')
    fetchData()
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

async function remove() {
  try {
    await receivablesService.deleteReceivable(deleteTarget.value.id)
    toast?.('Data piutang dihapus.', 'success')
    deleteTarget.value = null
    fetchData()
  } catch (e) {
    toast?.(e.message, 'error')
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Piutang (Catatan Kasbon)</h1>
        <p class="text-sm text-gray-400">Kelola catatan utang pelanggan</p>
      </div>
      <button class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm" @click="openAdd">
        <Plus class="w-4 h-4" />Tambah Piutang
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
        <div class="relative max-w-sm w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" placeholder="Cari nama pelanggan atau barang..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 outline-none text-sm border border-transparent focus:border-green-400 transition" />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Piutang (Pelanggan)</th>
                <th class="px-3 py-3 font-semibold">Nama Barang</th>
                <th class="px-3 py-3 font-semibold text-center">Jumlah</th>
                <th class="px-3 py-3 font-semibold text-right">Harga</th>
                <th class="px-3 py-3 font-semibold text-center">Status</th>
                <th class="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filtered()" :key="item.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3 font-semibold text-gray-800">{{ item.name }}</td>
                <td class="px-3 py-3 text-gray-600">{{ item.item }}</td>
                <td class="px-3 py-3 text-gray-800 font-medium text-center">{{ item.qty }}</td>
                <td class="px-3 py-3 text-green-700 font-bold num text-right">{{ rupiah(item.price) }}</td>
                <td class="px-3 py-3 text-center">
                  <span :class="['text-[10px] font-bold px-2 py-1 rounded-full', item.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600']">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button v-if="item.status !== 'LUNAS'" title="Tandai Lunas" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" @click="markAsPaid(item.id)">
                      <CheckCircle class="w-4 h-4" />
                    </button>
                    <button title="Hapus" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" @click="deleteTarget = item">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!filtered().length" title="Tidak ada data piutang" />
      </template>
    </div>

    <!-- Add Modal -->
    <BaseModal :show="showAddModal" title="Tambah Data Piutang" size="sm" @close="showAddModal = false">
      <form @submit.prevent="save" class="p-5 space-y-4">
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Nama Penghutang (Pelanggan) *</label>
          <input v-model="form.name" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm" required placeholder="Mis. Pak Pardi" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Nama Barang *</label>
          <input v-model="form.item" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm" required placeholder="Mis. j water" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Jumlah *</label>
            <input v-model="form.qty" type="number" min="1" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Total Harga (Rp) *</label>
            <input v-model="form.price" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm" required />
          </div>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50" @click="showAddModal = false">Batal</button>
          <button type="submit" :disabled="saving" class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm">
            {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="!!deleteTarget"
      title="Hapus Piutang"
      :description="`Yakin ingin menghapus catatan utang dari ${deleteTarget?.name}?`"
      confirm-label="Hapus"
      @confirm="remove"
      @close="deleteTarget = null"
    />
  </div>
</template>

