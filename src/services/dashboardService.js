import { salesService } from './salesService'
import { stockService } from './stockService'

export const dashboardService = {
  async getSummary() {
    // Backend doesn't have a specific dashboard endpoint,
    // so we aggregate data from sales and stock endpoints.
    try {
      const sales = await salesService.getSales()
      const stocks = await stockService.getStock()

      const today = new Date().toISOString().split('T')[0]
      const todaySales = sales.filter(s => s.date.startsWith(today))
      
      const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0)
      const todayTransactions = todaySales.length
      const monthRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0) // simplified to all time for now
      const monthProfit = monthRevenue * 0.2 // dummy profit margin
      
      let inventoryValue = 0
      let lowStockCount = 0
      let outOfStockCount = 0
      
      stocks.forEach(s => {
        inventoryValue += s.stock * (s.product.sell_price || 10000) // fallback if price not available
        if (s.stock <= 0) outOfStockCount++
        else if (s.stock <= s.min_stock) lowStockCount++
      })

      // Group sales by day for chart
      const chartData = {}
      sales.slice(0, 100).forEach(s => {
        const d = s.date.split('T')[0]
        if (!chartData[d]) chartData[d] = 0
        chartData[d] += Number(s.total)
      })

      const salesChart = Object.keys(chartData).map(k => ({
        date: k,
        total: chartData[k]
      })).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-7)

      return {
        todayRevenue,
        todayTransactions,
        monthRevenue,
        monthProfit,
        inventoryValue,
        lowStockCount,
        outOfStockCount,
        salesChart,
        topProducts: [], // Skip for now
        recentTransactions: sales.slice(0, 5),
        lowStockProducts: stocks.filter(s => s.stock <= s.min_stock).slice(0, 5)
      }
    } catch (e) {
      console.error('Failed to load dashboard summary', e)
      throw new Error('Gagal memuat ringkasan dashboard')
    }
  },
}
