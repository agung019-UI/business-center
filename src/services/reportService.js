import { salesService } from './salesService'
import { stockService } from './stockService'

export const reportService = {
  async getSalesReport(params = {}) {
    const sales = await salesService.getSales()
    // Simple filter by date
    let filtered = sales
    if (params.date_from && params.date_to) {
      filtered = sales.filter(s => s.date >= params.date_from && s.date <= params.date_to)
    }
    
    const total_sales = filtered.reduce((sum, s) => sum + Number(s.total), 0)
    const gross_profit = total_sales * 0.2 // Dummy 20% margin
    
    // Group products
    const productMap = {}
    filtered.forEach(s => {
      s.items.forEach(i => {
        if (!productMap[i.name]) productMap[i.name] = 0
        productMap[i.name] += i.qty
      })
    })
    const top_products = Object.keys(productMap).map(k => ({
      name: k,
      qty_sold: productMap[k],
      revenue: productMap[k] * 10000 // Dummy revenue
    })).sort((a,b) => b.qty_sold - a.qty_sold).slice(0,5)
    
    return {
      total_sales,
      total_transactions: filtered.length,
      total_discount: 0,
      gross_profit,
      top_products,
      sales: filtered
    }
  },

  async getProfitReport(params = {}) {
    const salesReport = await this.getSalesReport(params)
    const total_cogs = salesReport.total_sales * 0.8
    const operational_expenses = 0
    return {
      total_sales: salesReport.total_sales,
      total_cogs,
      gross_profit: salesReport.gross_profit,
      operational_expenses,
      net_profit: salesReport.gross_profit - operational_expenses
    }
  },

  async getStockReport() {
    const stocks = await stockService.getStock()
    let inventory_value = 0
    let low_stock_count = 0
    let out_of_stock_count = 0
    
    stocks.forEach(s => {
      inventory_value += s.stock * 10000 // Dummy price
      if (s.stock <= 0) out_of_stock_count++
      else if (s.stock <= s.min_stock) low_stock_count++
    })
    
    return {
      total_products: stocks.length,
      low_stock_count,
      out_of_stock_count,
      inventory_value,
      products: stocks
    }
  },

  async exportSalesReport(params = {}) {
    throw new Error('Export Excel belum didukung oleh backend')
  },

  async exportStockReport(params = {}) {
    throw new Error('Export Excel belum didukung oleh backend')
  },
}
