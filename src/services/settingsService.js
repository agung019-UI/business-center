export const settingsService = {
  async getSettings() {
    const stored = localStorage.getItem('bcs_settings')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      store_name: 'Business Center',
      store_address: 'Jl. Sekolah No. 1',
      store_phone: '08123456789',
      tax_rate: 0,
      receipt_footer: 'Terima kasih atas kunjungan Anda'
    }
  },

  async updateSettings(payload) {
    localStorage.setItem('bcs_settings', JSON.stringify(payload))
    return payload
  },
}
