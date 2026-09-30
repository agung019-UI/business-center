<script setup>
import { ref, onMounted, inject } from 'vue'
import { settingsService } from '@/services/settingsService'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Save } from 'lucide-vue-next'

const toast = inject('toast')

const loading = ref(false)
const saving = ref(false)

const form = ref({
  bc_name: '',
  school_name: '',
  address: '',
  phone: '',
  email: '',
  receipt_footer: 'Terima kasih\nSelamat berbelanja kembali',
  tax_percent: 0,
  currency: 'IDR',
  receipt_prefix: 'TRX',
  printer_note: '',
  receipt_width: '80mm',
})

async function fetchSettings() {
  loading.value = true
  try {
    const data = await settingsService.getSettings()
    const s = data.data || data
    Object.assign(form.value, s)
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await settingsService.updateSettings(form.value)
    toast?.('Pengaturan berhasil disimpan.', 'success')
  } catch (e) {
    toast?.(e.message, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Pengaturan</h1>
        <p class="text-sm text-gray-400">Konfigurasi Budhi Warman II</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>

    <form v-else class="space-y-5" @submit.prevent="save">
      <!-- Business Info -->
      <div class="bg-white rounded-xl shadow-card p-5">
        <h3 class="font-bold text-gray-800 mb-4">Informasi Budhi Warman II</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Nama Usaha / Unit *</label>
            <input v-model="form.bc_name" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Nama Sekolah</label>
            <input v-model="form.school_name" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Nomor Telepon</label>
            <input v-model="form.phone" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Email</label>
            <input v-model="form.email" type="email" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Alamat</label>
            <textarea v-model="form.address" rows="2" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" />
          </div>
        </div>
      </div>

      <!-- Transaksi -->
      <div class="bg-white rounded-xl shadow-card p-5">
        <h3 class="font-bold text-gray-800 mb-4">Pengaturan Transaksi</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Pajak (%)</label>
            <input v-model="form.tax_percent" type="number" min="0" max="100" step="0.5" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 no-spin" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Prefix Nomor Transaksi</label>
            <input v-model="form.receipt_prefix" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" placeholder="TRX" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">Lebar Struk</label>
            <select v-model="form.receipt_width" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500">
              <option>58mm</option>
              <option>80mm</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Struk -->
      <div class="bg-white rounded-xl shadow-card p-5">
        <h3 class="font-bold text-gray-800 mb-4">Pengaturan Struk</h3>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5">Footer Struk</label>
          <textarea v-model="form.receipt_footer" rows="3" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition font-mono" placeholder="Terima kasih&#10;Selamat berbelanja kembali" />
          <p class="text-xs text-gray-400 mt-1">Tekan Enter untuk pindah baris.</p>
        </div>
        <div class="mt-3">
          <label class="text-xs font-semibold text-gray-600 block mb-1.5">Catatan Printer</label>
          <input v-model="form.printer_note" class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-green-500 transition" />
        </div>
      </div>

      <!-- Save -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-semibold text-sm shadow-sm transition"
        >
          <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <Save v-else class="w-4 h-4" />
          {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </form>
  </div>
</template>

