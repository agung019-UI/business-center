import { salesService } from './salesService'

export const shiftService = {
  async getCurrentShift() {
    const stored = localStorage.getItem('bcs_current_shift')
    return stored ? JSON.parse(stored) : null
  },

  async getShifts(params = {}) {
    const stored = localStorage.getItem('bcs_shifts')
    return stored ? JSON.parse(stored) : []
  },

  async openShift(payload) {
    const shift = {
      id: Date.now(),
      start_time: new Date().toISOString(),
      start_cash: Number(payload.start_cash) || 0,
      status: 'OPEN',
      cashier_name: 'Kasir Aktif'
    }
    localStorage.setItem('bcs_current_shift', JSON.stringify(shift))
    
    const shifts = await this.getShifts()
    shifts.unshift(shift)
    localStorage.setItem('bcs_shifts', JSON.stringify(shifts))
    
    return shift
  },

  async closeShift(id, payload) {
    const current = await this.getCurrentShift()
    if (!current || current.id !== Number(id)) {
      throw new Error('Shift tidak valid')
    }
    
    current.end_time = new Date().toISOString()
    current.end_cash = Number(payload.actual_cash) || 0
    current.status = 'CLOSED'
    
    // Attempt to calculate total sales during shift (simplified)
    current.total_sales = 0 // In a real app, query salesService between start_time and end_time
    
    localStorage.removeItem('bcs_current_shift')
    
    const shifts = await this.getShifts()
    const idx = shifts.findIndex(s => s.id === current.id)
    if (idx !== -1) {
      shifts[idx] = current
      localStorage.setItem('bcs_shifts', JSON.stringify(shifts))
    }
    
    return current
  },
}
