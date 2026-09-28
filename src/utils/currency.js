/**
 * Format number as Indonesian Rupiah
 * @param {number} amount
 * @returns {string} e.g. "Rp10.000"
 */
export function rupiah(amount) {
  return 'Rp' + Math.round(amount || 0).toLocaleString('id-ID')
}

/**
 * Parse rupiah string back to number
 * @param {string} str
 * @returns {number}
 */
export function parseRupiah(str) {
  return Number(String(str).replace(/[^0-9-]/g, '')) || 0
}

/**
 * Format number with thousands separator (no currency symbol)
 * @param {number} amount
 * @returns {string}
 */
export function formatNumber(amount) {
  return Math.round(amount || 0).toLocaleString('id-ID')
}

