import sys

def patch_categories():
    with open('src/views/Categories.vue', 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("import { Plus, Search, Pencil, Trash2, Tag } from 'lucide-vue-next'", "import { Plus, Search, Pencil, Trash2, Tag, Check, X } from 'lucide-vue-next'")
    c = c.replace("const editing = ref(null)\n", "")
    c = c.replace("const showModal = ref(false)", "const showModal = ref(false)\nconst inlineEditId = ref(null)\nconst inlineEditForm = ref({ name: '' })")
    
    c = c.replace("""function openAdd() {
  editing.value = null
  form.value = { name: '' }
  showModal.value = true
}

function openEdit(c) {
  editing.value = c
  form.value = { name: c.name }
  showModal.value = true
}

async function save() {
  if (!form.value.name.trim()) { toast?.('Nama kategori wajib diisi.', 'error'); return }
  saving.value = true
  try {
    if (editing.value) {
      await categoryService.updateCategory(editing.value.id, form.value)
      toast?.('Kategori diperbarui.', 'success')
    } else {
      await categoryService.createCategory(form.value)
      toast?.('Kategori ditambahkan.', 'success')
    }
    showModal.value = false
    fetchCategories()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}""", """function openAdd() {
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
}""")

    c = c.replace("""          <div
            v-for="c in filtered()"
            :key="c.id"
            class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-green-200 transition"
          >
            <div class="flex items-center gap-2.5">
              <Tag class="w-4 h-4 text-green-500 shrink-0" />
              <div>
                <p class="font-semibold text-gray-800 text-sm">{{ c.name }}</p>
                <p class="text-[11px] text-gray-400">{{ c.products_count ?? 0 }} produk</p>
              </div>
            </div>
            <div class="flex gap-1">
              <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="openEdit(c)"><Pencil class="w-3.5 h-3.5" /></button>
              <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" @click="deleteTarget = c"><Trash2 class="w-3.5 h-3.5" /></button>
            </div>
          </div>""", """          <div
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
          </div>""")
    c = c.replace(":title=\"editing ? 'Edit Kategori' : 'Tambah Kategori'\"", ":title=\"'Tambah Kategori'\"")
    with open('src/views/Categories.vue', 'w', encoding='utf-8') as f:
        f.write(c)

def patch_suppliers():
    with open('src/views/Suppliers.vue', 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("import { Plus, Search, Pencil, Trash2, Eye, X } from 'lucide-vue-next'", "import { Plus, Search, Pencil, Trash2, Eye, X, Check } from 'lucide-vue-next'")
    c = c.replace("const editing = ref(null)\n", "")
    c = c.replace("const showModal = ref(false)", "const showModal = ref(false)\nconst inlineEditId = ref(null)\nconst inlineEditForm = ref(defaultForm())")
    
    c = c.replace("""function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(s) {
  editing.value = s
  form.value = { name: s.name, contact: s.contact || '', phone: s.phone || '', email: s.email || '', address: s.address || '', note: s.note || '', status: s.status || 'AKTIF' }
  showModal.value = true
}

async function save() {
  if (!form.value.name.trim()) { toast?.('Nama supplier wajib diisi.', 'error'); return }
  saving.value = true
  try {
    if (editing.value) {
      await supplierService.updateSupplier(editing.value.id, form.value)
      toast?.('Supplier diperbarui.', 'success')
    } else {
      await supplierService.createSupplier(form.value)
      toast?.('Supplier ditambahkan.', 'success')
    }
    showModal.value = false
    fetchSuppliers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}""", """function openAdd() {
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
}""")

    c = c.replace("""              <tr v-for="s in filtered()" :key="s.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
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
                    <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="openEdit(s)"><Pencil class="w-4 h-4" /></button>
                    <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" @click="deleteTarget = s"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>""", """              <tr v-for="s in filtered()" :key="s.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
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
              </tr>""")
    c = c.replace(":title=\"editing ? 'Edit Supplier' : 'Tambah Supplier'\"", ":title=\"'Tambah Supplier'\"")
    with open('src/views/Suppliers.vue', 'w', encoding='utf-8') as f:
        f.write(c)

def patch_users():
    with open('src/views/Users.vue', 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("import { Plus, Pencil, Trash2, Search } from 'lucide-vue-next'", "import { Plus, Pencil, Trash2, Search, Check, X, Eye, EyeOff } from 'lucide-vue-next'")
    c = c.replace("const editing = ref(null)\n", "")
    c = c.replace("const showModal = ref(false)", "const showModal = ref(false)\nconst inlineEditId = ref(null)\nconst inlineEditForm = ref(defaultForm())\nconst visiblePasswords = ref(new Set())\nfunction togglePassword(id) { const s = new Set(visiblePasswords.value); if (s.has(id)) s.delete(id); else s.add(id); visiblePasswords.value = s; }")
    
    c = c.replace("""function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(u) {
  editing.value = u
  form.value = { name: u.name, username: u.username, password: '', role: u.role }
  showModal.value = true
}

async function save() {
  if (!form.value.name.trim()) { toast?.('Nama lengkap wajib diisi.', 'error'); return }
  if (!form.value.username.trim()) { toast?.('Username wajib diisi.', 'error'); return }
  if (!editing.value && !form.value.password.trim()) { toast?.('Password wajib diisi untuk pengguna baru.', 'error'); return }
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password
    if (editing.value) {
      await userService.updateUser(editing.value.id, payload)
      toast?.('Pengguna diperbarui.', 'success')
    } else {
      await userService.createUser(payload)
      toast?.('Pengguna berhasil ditambahkan.', 'success')
    }
    showModal.value = false
    fetchUsers()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}""", """function openAdd() {
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
}""")

    # Update Table Header
    c = c.replace("""<th class="px-3 py-3 font-semibold">Role</th>
              <th class="px-3 py-3 font-semibold">Dibuat</th>""", """<th class="px-3 py-3 font-semibold">Role</th>
              <th class="px-3 py-3 font-semibold">Password</th>
              <th class="px-3 py-3 font-semibold">Dibuat</th>""")
              
    # Update Table Row
    c = c.replace("""              <tr v-for="u in filtered()" :key="u.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-gray-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {{ u.name.slice(0, 2).toUpperCase() }}
                    </div>
                    <span class="font-semibold text-gray-800">{{ u.name }}</span>
                  </div>
                </td>
                <td class="px-3 py-3 text-gray-500 font-mono text-xs">@{{ u.username }}</td>
                <td class="px-3 py-3">
                  <span :class="['text-[10.5px] font-bold px-2 py-0.5 rounded-full', roleClass(u.role)]">{{ u.role }}</span>
                </td>
                <td class="px-3 py-3 text-gray-400 text-xs">{{ fmtDate(u.created_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" @click="openEdit(u)"><Pencil class="w-4 h-4" /></button>
                    <button
                      v-if="u.id !== authStore.user?.id"
                      class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      @click="deleteTarget = u"
                    ><Trash2 class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>""", """              <tr v-for="u in filtered()" :key="u.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
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
                        {{ u.name.slice(0, 2).toUpperCase() }}
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
              </tr>""")
              
    c = c.replace("""<div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">Role</label>
          <select v-model="form.role" class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
            <option>ADMIN</option>
            <option>KASIR</option>
          </select>
        </div>""", "")
    c = c.replace(":title=\"editing ? 'Edit Pengguna' : 'Tambah Pengguna'\"", ":title=\"'Tambah Pengguna'\"")
    c = c.replace("Password {{ editing ? '(kosongkan jika tidak diubah)' : '*' }}", "Password *")
    with open('src/views/Users.vue', 'w', encoding='utf-8') as f:
        f.write(c)

def patch_products():
    with open('src/views/Products.vue', 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("import { Plus, Search, Pencil, Trash2 } from 'lucide-vue-next'", "import { Plus, Search, Pencil, Trash2, Check, X } from 'lucide-vue-next'")
    c = c.replace("const editing = ref(null)\n", "")
    c = c.replace("const showModal = ref(false)", "const showModal = ref(false)\nconst inlineEditId = ref(null)\nconst inlineEditForm = ref(defaultForm())")
    
    c = c.replace("""function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(p) {
  editing.value = p
  form.value = {
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
  showModal.value = true
}

async function saveProduct() {
  if (!form.value.name.trim()) { toast?.('Nama produk wajib diisi.', 'error'); return }
  if (!form.value.category_id) { toast?.('Kategori wajib dipilih.', 'error'); return }
  savingLoading.value = true
  try {
    if (editing.value) {
      await productStore.updateProduct(editing.value.id, form.value)
      toast?.('Produk berhasil diperbarui.', 'success')
    } else {
      await productStore.createProduct(form.value)
      toast?.('Produk berhasil ditambahkan.', 'success')
    }
    showModal.value = false
    fetchProducts()
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    savingLoading.value = false
  }
}""", """function openAdd() {
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
}""")

    c = c.replace("""              <tr
                v-for="p in productStore.products"
                :key="p.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
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
                      @click="openEdit(p)"
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
              </tr>""", """              <tr
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
              </tr>""")
    c = c.replace(":title=\"editing ? 'Edit Produk' : 'Tambah Produk'\"", ":title=\"'Tambah Produk'\"")
    with open('src/views/Products.vue', 'w', encoding='utf-8') as f:
        f.write(c)

if __name__ == '__main__':
    patch_categories()
    patch_suppliers()
    patch_users()
    patch_products()
    print('Done patching')
