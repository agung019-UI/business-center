<script setup>
import { ref, onMounted, inject } from 'vue'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import { fmtDate } from '@/utils/date'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Plus, Pencil, Trash2, Search, Check, X, Eye, EyeOff } from 'lucide-vue-next'

const toast = inject('toast')
const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')

const showModal = ref(false)
const inlineEditId = ref(null)
const inlineEditForm = ref(defaultForm())
const visiblePasswords = ref(new Set())
function togglePassword(id) { const s = new Set(visiblePasswords.value); if (s.has(id)) s.delete(id); else s.add(id); visiblePasswords.value = s; }
const deleteTarget = ref(null)

const defaultForm = () => ({ name: '', username: '', password: '', role: 'KASIR' })
const form = ref(defaultForm())

const filtered = () =>
  search.value.trim()
    ? users.value.filter((u) =>
        (u.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(search.value.toLowerCase()),
      )
    : users.value

async function fetchUsers() {
  loading.value = true
  try {
    const data = await userService.getUsers()
    users.value = Array.isArray(data) ? data : (data.data || [])
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

function openInlineEdit(u) {
  inlineEditId.value = u.id
  inlineEditForm.value = { name: u.name, username: u.username, password: '', role: u.role }
}

function cancelInlineEdit() {
  inlineEditId.value = null
}

async function saveInlineEdit() {
  if (!inlineEditForm.value.name.trim()) { toast?.('Nama lengkap wajib diisi.', 'error'); return }
  if (!inlineEditForm.value.username.trim()) { toast?.('Username wajib diisi.', 'error'); return }
  saving.value = true
  try {
    const payload = { ...inlineEditForm.value }
    if (!payload.password) delete payload.password
    await userService.updateUser(inlineEditId.value, payload)
    toast?.('Pengguna diperbarui.', 'success')
    inlineEditId.value = null
    fetchUsers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function save() {
  if (!form.value.name.trim()) { toast?.('Nama lengkap wajib diisi.', 'error'); return }
  if (!form.value.username.trim()) { toast?.('Username wajib diisi.', 'error'); return }
  if (!form.value.password.trim()) { toast?.('Password wajib diisi untuk pengguna baru.', 'error'); return }
  saving.value = true
  try {
    const payload = { ...form.value }
    await userService.createUser(payload)
    toast?.('Pengguna berhasil ditambahkan.', 'success')
    showModal.value = false
    fetchUsers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function remove() {
  deleting.value = true
  try {
    await userService.deleteUser(deleteTarget.value.id)
    toast?.('Pengguna dihapus.', 'success')
    deleteTarget.value = null
    fetchUsers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    deleting.value = false
  }
}

function roleClass(role) {
  return role === 'ADMIN' ? 'bg-gray-700 text-white' : 'bg-green-50 text-green-700'
}

onMounted(fetchUsers)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <p class="text-sm text-gray-400">{{ users.length }} pengguna terdaftar</p>
      </div>
      <button class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm" @click="openAdd">
        <Plus class="w-4 h-4" />Tambah Kasir
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-card overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="relative max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" placeholder="Cari pengguna..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 outline-none text-sm border border-transparent focus:border-green-400 transition" />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16"><LoadingSpinner /></div>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
              <th class="px-4 py-3 font-semibold">Nama</th>
              <th class="px-3 py-3 font-semibold">Username</th>
              <th class="px-3 py-3 font-semibold">Role</th>
              <th class="px-3 py-3 font-semibold">Password</th>
              <th class="px-3 py-3 font-semibold">Dibuat</th>
              <th class="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr></thead>
            <tbody>
              <tr v-for="u in filtered()" :key="u.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <template v-if="inlineEditId === u.id">
                  <td class="px-4 py-3"><input v-model="inlineEditForm.name" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.username" class="w-full px-2 py-1 rounded border text-sm" /></td>
                  <td class="px-3 py-3">
                    <select v-model="inlineEditForm.role" class="w-full px-2 py-1 rounded border text-sm">
                      <option>ADMIN</option>
                      <option>KASIR</option>
                    </select>
                  </td>
                  <td class="px-3 py-3"><input v-model="inlineEditForm.password" placeholder="Kosongkan jika tdk diubah" class="w-full px-2 py-1 rounded border text-sm" type="password" /></td>
                  <td class="px-3 py-3"></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition" @click="saveInlineEdit"><Check class="w-4 h-4" /></button>
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition" @click="cancelInlineEdit"><X class="w-4 h-4" /></button>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-gray-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {{ (u.name || 'U').slice(0, 2).toUpperCase() }}
                      </div>
                      <span class="font-semibold text-gray-800">{{ u.name }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-gray-500 font-mono text-xs">@{{ u.username }}</td>
                  <td class="px-3 py-3">
                    <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded-full', roleClass(u.role)]">{{ u.role }}</span>
                  </td>
                  <td class="px-3 py-3 text-gray-500 text-xs">
                    <div class="flex items-center gap-1" v-if="u.password">
                      <span v-if="visiblePasswords.has(u.id)">{{ u.password }}</span>
                      <span v-else>••••••</span>
                      <button @click="togglePassword(u.id)" class="text-gray-400 hover:text-gray-600"><Eye class="w-3.5 h-3.5" v-if="!visiblePasswords.has(u.id)"/><EyeOff class="w-3.5 h-3.5" v-else/></button>
                    </div>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-3 py-3 text-gray-400 text-xs">{{ fmtDate(u.created_at) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="openInlineEdit(u)"><Pencil class="w-4 h-4" /></button>
                      <button
                        v-if="u.id !== authStore.user?.id"
                        class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                        @click="deleteTarget = u"
                      ><Trash2 class="w-4 h-4" /></button>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!filtered().length" title="Tidak ada pengguna" description="Tambah akun pengguna baru." />
      </template>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal :show="showModal" :title="'Tambah Kasir'" size="sm" @close="showModal = false">
      <form class="p-5 space-y-3" @submit.prevent="save">
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Nama Lengkap *</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Username *</label>
          <input v-model="form.username" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" autocomplete="off" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Password *</label>
          <input v-model="form.password" type="password" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500" autocomplete="new-password" />
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

    <ConfirmDialog
      :show="!!deleteTarget"
      :description="`Pengguna '${deleteTarget?.name}' akan dihapus secara permanen.`"
      :loading="deleting"
      @close="deleteTarget = null"
      @confirm="remove"
    />
  </div>
</template>

