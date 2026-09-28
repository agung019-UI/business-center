/**
 * Menu access per role.
 * Key = route name, Value = allowed roles.
 */
export const ROUTE_PERMISSIONS = {
  Dashboard: ['ADMIN', 'KASIR'],
  POS: ['ADMIN', 'KASIR'],
  Sales: ['ADMIN', 'KASIR'],
  Purchases: ['ADMIN'],
  Products: ['ADMIN', 'KASIR'],
  Categories: ['ADMIN'],
  Suppliers: ['ADMIN'],
  Stock: ['ADMIN', 'KASIR'],
  Cash: ['ADMIN'],
  Shifts: ['ADMIN', 'KASIR'],
  SalesReport: ['ADMIN'],
  ProfitReport: ['ADMIN'],
  StockReport: ['ADMIN'],
  Users: ['ADMIN'],
  Settings: ['ADMIN'],
}

/**
 * Check if a role can access a route
 * @param {string} role
 * @param {string} routeName
 * @returns {boolean}
 */
export function canAccess(role, routeName) {
  const allowed = ROUTE_PERMISSIONS[routeName]
  if (!allowed) return true // public route
  return allowed.includes(role)
}

/**
 * Get stock status label and CSS classes
 * @param {{ stock: number, min_stock: number }} product
 * @returns {{ label: string, cls: string, variant: string }}
 */
export function stockStatus(product) {
  const stock = product.stock ?? product.stock_qty ?? 0
  const min = product.min_stock ?? product.minStock ?? 0

  if (stock <= 0) {
    return {
      label: 'STOK HABIS',
      cls: 'bg-red-50 text-red-600 ring-1 ring-red-200',
      variant: 'danger',
    }
  }
  if (stock <= min) {
    return {
      label: 'STOK MENIPIS',
      cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      variant: 'warning',
    }
  }
  return {
    label: 'STOK AMAN',
    cls: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    variant: 'success',
  }
}

