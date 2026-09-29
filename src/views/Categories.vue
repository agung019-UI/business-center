<script setup>
import { ref, onMounted, inject } from 'vue'
import { categoryService } from '@/services/categoryService'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Plus, Search, Pencil, Trash2, Tag, Check, X } from 'lucide-vue-next'

const toast = inject('toast')

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')

const showModal = ref(false)
const inlineEditId = ref(null)
const inlineEditForm = ref({ name: '' })
const deleteTarget = ref(null)
const form = ref({ name: '' })

const filtered = () =>
  search.value.trim()
    ? categories.value.filter((c) => c.name.toLowerCase().includes(search.value.toLowerCase()))
    : categories.value

async function fetchCategories() {
  loading.value = true
  try {
    const data = await categoryService.getCategories()
    categories.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  form.value = { name: '' }
  showModal.value = true
}

function openInlineEdit(c) {
  inlineEditId.value = c.id
  inlineEditForm.value = { name: c.name }
}

function cancelInlineEdit() {
  inlineEditId.value = null
}

async function saveInlineEdit() {
  if (!inlineEditForm.value.name.trim()) { toast?.('Nama kategori wajib diisi.', 'error'); return }
  saving.value = true
  try {
    await categoryService.updateCategory(inlineEditId.value, inlineEditForm.value)
    toast?.('Kategori diperbarui.', 'success')
    inlineEditId.value = null
    fetchCategories()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function save() {
  if (!form.value.name.trim()) { toast?.('Nama kategori wajib diisi.', 'error'); return }
  saving.value = true
  try {
    await categoryService.createCategory(form.value)
    toast?.('Kategori ditambahkan.', 'success')
    showModal.value = false
    fetchCategories()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function remove() {
  deleting.value = true
  try {
    await categoryService.deleteCategory(deleteTarget.value.id)
    toast?.('Kategori dihapus.', 'success')
    deleteTarget.value = null
    fetchCategories()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Kategori Produk</h1>
        <p class="text-sm text-gray-400">{{ categories.length }} kategori terdaftar</p>
      </div>
      <button
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm"
        @click="openAdd"
      >
        <Plus class="w-4 h-4" />Tambah Kategori
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="relative max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input v-model="search" placeholder="Cari kategori..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 outline-none text-sm focus:bg-white focus:border-green-400 border border-transparent transition" />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>

      <template v-else>
        <div v-if="filtered().length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          <div
            v-for="c in filtered()"
            :key="c.id"
            class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-green-200 transition"
          >
            <template v-if="inlineEditId === c.id">
              <input v-model="inlineEditForm.name" class="flex-1 mr-3 px-2 py-1 rounded border border-gray-300 text-sm focus:border-green-500 outline-none" @keyup.enter="saveInlineEdit" />
              <div class="flex gap-1 shrink-0">
                <button class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition" @click="saveInlineEdit" :disabled="saving"><Check class="w-4 h-4" /></button>
                <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition" @click="cancelInlineEdit"><X class="w-4 h-4" /></button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-2.5">
                <Tag class="w-4 h-4 text-green-500 shrink-0" />
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ c.name }}</p>
                  <p class="text-[11px] text-gray-400">{{ c.products_count ?? 0 }} produk</p>
                </div>
              </div>
              <div class="flex gap-1">
                <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="openInlineEdit(c)"><Pencil class="w-3.5 h-3.5" /></button>
                <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" @click="deleteTarget = c"><Trash2 class="w-3.5 h-3.5" /></button>
              </div>
            </template>
          </div>
        </div>
        <EmptyState v-else title="Tidak ada kategori" description="Tambah kategori untuk mengorganisir produk." />
      </template>
    </div>

    <!-- Modal -->
    <BaseModal :show="showModal" :title="'Tambah Kategori'" size="sm" @close="showModal = false">
      <form class="p-6" @submit.prevent="save">
        <label class="text-sm font-semibold text-gray-700 block mb-1.5">Nama Kategori *</label>
        <input v-model="form.name" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 outline-none text-sm mb-5" placeholder="contoh: Makanan" />
        <div class="flex gap-2">
          <button type="button" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50" @click="showModal = false">Batal</button>
          <button type="submit" :disabled="saving" class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2">
            <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      :show="!!deleteTarget"
      :description="`Kategori '${deleteTarget?.name}' akan dihapus. Produk terkait tidak akan terhapus.`"
      :loading="deleting"
      @close="deleteTarget = null"
      @confirm="remove"
    />
  </div>
</template>

