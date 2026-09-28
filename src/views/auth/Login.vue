<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Store, AlertCircle, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')

const form = ref({ username: '', password: '' })
const error = ref('')
const showPassword = ref(false)
const loginRole = ref('KASIR') // Default tab KASIR

async function handleLogin() {
  error.value = ''
  if (!form.value.username.trim() || !form.value.password.trim()) {
    error.value = 'Username dan password wajib diisi.'
    return
  }
  try {
    const user = await authStore.login(form.value.username.trim(), form.value.password)
    
    // Verifikasi kecocokan role yang dipilih dengan role asli akun
    if (loginRole.value === 'ADMIN' && user.role !== 'ADMIN') {
      authStore.clearSession()
      error.value = 'Akun Anda tidak memiliki akses sebagai Admin.'
      return
    }

    toast?.(`Selamat datang, ${user.name}!`, 'success')
    
    // Arahkan sesuai pilihan role tab, agar admin juga bisa login masuk ke kasir jika dia mau
    if (loginRole.value === 'KASIR') {
      router.push({ name: 'POS' })
    } else {
      router.push({ name: 'Dashboard' })
    }
  } catch (e) {
    error.value = e.message || 'Username atau password salah.'
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">

      <!-- Card Header — logo + nama + subtitle -->
      <div class="bg-green-600 px-7 py-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Store class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-white leading-tight">Business Center Sekolah</h1>
          <p class="text-green-100 text-xs mt-0.5">Sistem Kasir &amp; Manajemen Unit Usaha</p>
        </div>
      </div>

      <!-- Card Body — form login -->
      <div class="px-7 py-6">
        <h2 class="text-base font-bold text-gray-800 mb-0.5">Masuk ke akun Anda</h2>
        <p class="text-sm text-gray-400 mb-5">Silakan pilih akses dan masukkan kredensial Anda.</p>

        <!-- Pilihan Role Login -->
        <div class="flex p-1 bg-gray-100 rounded-lg mb-5">
          <button 
            type="button"
            :class="['flex-1 py-2 text-sm font-semibold rounded-md transition duration-200', loginRole === 'KASIR' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700']"
            @click="loginRole = 'KASIR'"
          >
            Masuk Kasir
          </button>
          <button 
            type="button"
            :class="['flex-1 py-2 text-sm font-semibold rounded-md transition duration-200', loginRole === 'ADMIN' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700']"
            @click="loginRole = 'ADMIN'"
          >
            Masuk Admin
          </button>
        </div>

        <!-- Error banner -->
        <div
          v-if="error"
          class="mb-4 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 ring-1 ring-red-100"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ error }}
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">

          <!-- Username / NISN -->
          <div>
            <label class="text-sm font-semibold text-gray-700 block mb-1.5">
              {{ loginRole === 'KASIR' ? 'NISN' : 'Username' }}
            </label>
            <input
              v-model="form.username"
              type="text"
              :placeholder="loginRole === 'KASIR' ? 'Masukkan NISN' : 'Masukkan username'"
              autocomplete="username"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200
                     focus:border-green-500 focus:ring-2 focus:ring-green-100
                     outline-none transition text-sm"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                autocomplete="current-password"
                class="no-reveal w-full px-3.5 py-2.5 pr-11 rounded-lg border border-gray-200
                       focus:border-green-500 focus:ring-2 focus:ring-green-100
                       outline-none transition text-sm"
              />
              <!--
                Eye   = password sedang tersembunyi → klik untuk tampilkan
                EyeOff = password sedang tampil    → klik untuk sembunyikan
              -->
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 hover:text-gray-600
                       cursor-pointer transition-colors"
                :title="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >
                <!-- Satu komponen dinamis — tidak pernah render dua icon sekaligus -->
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2.5 mt-2 rounded-lg
                   bg-green-600 hover:bg-green-700
                   disabled:opacity-60
                   text-white font-semibold text-sm
                   transition flex items-center justify-center gap-2 shadow-sm"
          >
            <svg v-if="authStore.loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ authStore.loading ? 'Memproses...' : 'Masuk' }}
          </button>

        </form>
      </div>

    </div>
  </AuthLayout>
</template>

<style>
/* Sembunyikan icon mata bawaan Microsoft Edge / IE
   agar tidak dobel dengan icon Eye custom (Lucide).
   Harus non-scoped agar pseudo-element dapat diakses browser. */
.no-reveal::-ms-reveal,
.no-reveal::-ms-clear {
  display: none !important;
}
</style>
