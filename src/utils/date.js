/**
 * Format ISO date string to Indonesian date
 * @param {string} iso
 * @param {boolean} withTime
 * @returns {string}
 */
export function fmtDate(iso, withTime = false) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  const date = d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  if (!withTime) return date
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Get date N days ago as YYYY-MM-DD
 */
export function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

/**
 * Get first day of current month as YYYY-MM-DD
 */
export function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

/**
 * Get first day of current year as YYYY-MM-DD
 */
export function startOfYear() {
  const d = new Date()
  return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10)
}

