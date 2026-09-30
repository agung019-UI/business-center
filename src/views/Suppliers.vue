<script setup>
import { ref, onMounted, inject } from 'vue'
import { supplierService } from '@/services/supplierService'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Plus, Search, Pencil, Trash2, Eye, X, Check } from 'lucide-vue-next'

const toast = inject('toast')

const suppliers = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')

const showModal = ref(false)
const inlineEditId = ref(null)
const inlineEditForm = ref(defaultForm())
const deleteTarget = ref(null)
const viewingSupplier = ref(null)

const defaultForm = () => ({ name: '', contact: '', phone: '', email: '', address: '', note: '', status: 'AKTIF' })
const form = ref(defaultForm())

const filtered = () =>
  search.value.trim()
    ? suppliers.value.filter((s) =>
        s.name.toLowerCase().includes(search.value.toLowerCase()) ||
        (s.code || '').toLowerCase().includes(search.value.toLowerCase()),
      )
    : suppliers.value

async function fetchSuppliers() {
  loading.value = true
  try {
    const data = await supplierService.getSuppliers()
    suppliers.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  form.value = defaultForm()
  showModal.value = true
}

function openInlineEdit(s) {
  inlineEditId.value = s.id
  inlineEditForm.value = { name: s.name, contact: s.contact || '', phone: s.phone || '', email: s.email || '', address: s.address || '', note: s.note || '', status: s.status || 'AKTIF' }
}
function cancelInlineEdit() {
  inlineEditId.value = null
}
async function saveInlineEdit() {
  if (!inlineEditForm.value.name.trim()) { toast?.('Nama supplier wajib diisi.', 'error'); return }
  saving.value = true
  try {
    await supplierService.updateSupplier(inlineEditId.value, inlineEditForm.value)
    toast?.('Supplier diperbarui.', 'success')
    inlineEditId.value = null
    fetchSuppliers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function save() {
  if (!form.value.name.trim()) { toast?.('Nama supplier wajib diisi.', 'error'); return }
  saving.value = true
  try {
    await supplierService.createSupplier(form.value)
    toast?.('Supplier ditambahkan.', 'success')
    showModal.value = false
    fetchSuppliers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function remove() {
  deleting.value = true
  try {
    await supplierService.deleteSupplier(deleteTarget.value.id)
    toast?.('Supplier dihapus.', 'success')
    deleteTarget.value = null
    fetchSuppliers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchSuppliers)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Supplier</h1>
        <p class="text-sm text-gray-400">{{ suppliers.length }} supplier terdaftar</p>
      </div>
      <button class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm" @click="openAdd">
        <Plus class="w-4 h-4" />Tambah Supplier
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="relative max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" placeholder="Cari supplier..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 outline-none text-sm border border-transparent focus:border-green-400 transition" />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-semibold">Kode</th>
                <th class="px-3 py-3 font-semibold">Nama</th>
                <th class="px-3 py-3 font-semibold">Kontak</th>
                <th class="px-3 py-3 font-semibold">Telepon</th>
                <th class="px-3 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in filtered()" :key="s.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <template v-if="inlineEditId === s.id">
                  <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ s.code }}</td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.name" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.contact" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.phone" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3">
                    <select v-model="inlineEditForm.status" class="w-full px-2 py-1 rounded border text-sm">
                      <option value="AKTIF">AKTIF</option>
                      <option value="NONAKTIF">NONAKTIF</option>
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition" @click="saveInlineEdit"><Check class="w-4 h-4" /></button>
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition" @click="cancelInlineEdit"><X class="w-4 h-4" /></button>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ s.code }}</td>
                  <td class="px-3 py-3 font-semibold text-gray-800">{{ s.name }}</td>
                  <td class="px-3 py-3 text-gray-500">{{ s.contact }}</td>
                  <td class="px-3 py-3 text-gray-500">{{ s.phone }}</td>
                  <td class="px-3 py-3">
                    <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded-full', s.status === 'AKTIF' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500']">
                      {{ s.status || 'AKTIF' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="viewingSupplier = s"><Eye class="w-4 h-4" /></button>
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="openInlineEdit(s)"><Pencil class="w-4 h-4" /></button>
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" @click="deleteTarget = s"><Trash2 class="w-4 h-4" /></button>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!filtered().length" title="Tidak ada supplier" description="Tambah supplier untuk mengelola pembelian barang." />
      </template>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal :show="showModal" :title="'Tambah Supplier'" size="md" @close="showModal = false">
      <form class="p-5 space-y-3" @submit.prevent="save">
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Nama Supplier *</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Nama Kontak</label>
            <input v-model="form.contact" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Nomor Telepon</label>
            <input v-model="form.phone" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Alamat</label>
          <textarea v-model="form.address" rows="2" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Catatan</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50" @click="showModal = false">Batal</button>
          <button type="submit" :disabled="saving" class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2">
            <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Supplier Detail Modal -->
    <BaseModal :show="!!viewingSupplier" :title="viewingSupplier?.name || ''" size="sm" @close="viewingSupplier = null">
      <div v-if="viewingSupplier" class="p-5 space-y-2 text-sm text-gray-600">
        <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">Kode</span><span class="font-mono">{{ viewingSupplier.code }}</span></div>
        <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">Kontak</span><span>{{ viewingSupplier.contact }}</span></div>
        <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">Telepon</span><span>{{ viewingSupplier.phone }}</span></div>
        <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">Email</span><span>{{ viewingSupplier.email }}</span></div>
        <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">Alamat</span><span>{{ viewingSupplier.address }}</span></div>
        <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">Catatan</span><span>{{ viewingSupplier.note }}</span></div>
        <button class="w-full mt-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm" @click="viewingSupplier = null">Tutup</button>
      </div>
    </BaseModal>

    <ConfirmDialog
      :show="!!deleteTarget"
      :description="`Supplier '${deleteTarget?.name}' akan dihapus secara permanen.`"
      :loading="deleting"
      @close="deleteTarget = null"
      @confirm="remove"
    />
  </div>
</template>

