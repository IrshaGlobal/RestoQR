import { useState, useEffect } from 'react'
import { 
  TrendingUp, DollarSign, ShoppingCart, 
  Clock, Users, Calendar, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart as PieChartIcon, Activity, Download, FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalItems: number
  revenueChange: number
  ordersChange: number
  popularItems: Array<{ name: string; quantity: number; revenue: number }>
  hourlyDistribution: Array<{ hour: number; orders: number; revenue: number }>
  dailyStats: Array<{ date: string; orders: number; revenue: number }>
  categoryBreakdown: Array<{ category: string; orders: number; revenue: number }>
}

interface AnalyticsDashboardProps {
  restaurantId: string
}

export default function AnalyticsDashboard({ restaurantId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    fetchAnalytics()
  }, [restaurantId, timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate = new Date()

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }

      // Fetch orders with items
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, category_id, price)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Calculate analytics
      const deliveredOrders = (orders || []).filter(o => o.status === 'delivered')
      const allOrders = orders || []

      // Revenue and order stats
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0)
      const totalOrders = deliveredOrders.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Item statistics
      const itemCounts = new Map<string, { name: string; quantity: number; revenue: number }>()
      allOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const itemId = item.menu_item_id
          const existing = itemCounts.get(itemId) || { 
            name: item.menu_items?.name || 'Unknown', 
            quantity: 0, 
            revenue: 0 
          }
          existing.quantity += item.quantity
          existing.revenue += item.quantity * parseFloat(item.price_at_time_of_order.toString())
          itemCounts.set(itemId, existing)
        })
      })

      const popularItems = Array.from(itemCounts.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      // Hourly distribution
      const hourlyDist = Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0, revenue: 0 }))
      deliveredOrders.forEach(order => {
        const hour = new Date(order.created_at).getHours()
        hourlyDist[hour].orders += 1
        hourlyDist[hour].revenue += parseFloat(order.total.toString())
      })

      // Daily stats
      const dailyMap = new Map<string, { orders: number; revenue: number }>()
      deliveredOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString()
        const existing = dailyMap.get(date) || { orders: 0, revenue: 0 }
        existing.orders += 1
        existing.revenue += parseFloat(order.total.toString())
        dailyMap.set(date, existing)
      })

      const dailyStats = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Category breakdown
      const categoryMap = new Map<string, { orders: number; revenue: number }>()
      allOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const categoryId = item.menu_items?.category_id || 'uncategorized'
          const existing = categoryMap.get(categoryId) || { orders: 0, revenue: 0 }
          existing.orders += item.quantity
          existing.revenue += item.quantity * parseFloat(item.price_at_time_of_order.toString())
          categoryMap.set(categoryId, existing)
        })
      })

      // Fetch category names
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('restaurant_id', restaurantId)

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([id, stats]) => {
        const category = categories?.find(c => c.id === id)
        return {
          category: category?.name || 'Uncategorized',
          ...stats
        }
      }).sort((a, b) => b.revenue - a.revenue)

      // Calculate changes (compare to previous period)
      const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
      const { data: prevOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'delivered')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString())

      const prevRevenue = (prevOrders || []).reduce((sum, o) => sum + parseFloat(o.total.toString()), 0)
      const prevOrdersCount = prevOrders?.length || 0

      const revenueChange = prevRevenue > 0 
        ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
        : 0
      const ordersChange = prevOrdersCount > 0
        ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100
        : 0

      setAnalytics({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalItems: Array.from(itemCounts.values()).reduce((sum, i) => sum + i.quantity, 0),
        revenueChange,
        ordersChange,
        popularItems,
        hourlyDistribution: hourlyDist,
        dailyStats,
        categoryBreakdown
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!analytics) return

    const csvRows = []
    
    // Summary section
    csvRows.push(['Analytics Report'])
    csvRows.push(['Period', timeRange])
    csvRows.push(['Generated', new Date().toLocaleString()])
    csvRows.push([])
    
    // Key Metrics
    csvRows.push(['Key Metrics'])
    csvRows.push(['Total Revenue', formatCurrency(analytics.totalRevenue)])
    csvRows.push(['Total Orders', analytics.totalOrders.toString()])
    csvRows.push(['Avg Order Value', formatCurrency(analytics.avgOrderValue)])
    csvRows.push(['Items Sold', analytics.totalItems.toString()])
    csvRows.push(['Revenue Change', `${analytics.revenueChange.toFixed(1)}%`])
    csvRows.push(['Orders Change', `${analytics.ordersChange.toFixed(1)}%`])
    csvRows.push([])
    
    // Popular Items
    csvRows.push(['Top Selling Items'])
    csvRows.push(['Rank', 'Item', 'Quantity', 'Revenue'])
    analytics.popularItems.forEach((item, idx) => {
      csvRows.push([(idx + 1).toString(), item.name, item.quantity.toString(), formatCurrency(item.revenue)])
    })
    csvRows.push([])
    
    // Category Breakdown
    csvRows.push(['Category Breakdown'])
    csvRows.push(['Category', 'Items Sold', 'Revenue'])
    analytics.categoryBreakdown.forEach(cat => {
      csvRows.push([cat.category, cat.orders.toString(), formatCurrency(cat.revenue)])
    })
    csvRows.push([])
    
    // Daily Stats
    csvRows.push(['Daily Performance'])
    csvRows.push(['Date', 'Orders', 'Revenue', 'Avg Order'])
    analytics.dailyStats.forEach(day => {
      csvRows.push([
        day.date, 
        day.orders.toString(), 
        formatCurrency(day.revenue),
        formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0)
      ])
    })

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSV exported successfully')
  }

  const exportToPDF = () => {
    if (!analytics) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to export PDF')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report - ${timeRange}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #f97316; border-bottom: 3px solid #f97316; padding-bottom: 10px; }
          h2 { color: #f97316; margin-top: 30px; }
          .header { margin-bottom: 30px; }
          .period { color: #666; font-size: 14px; }
          .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .metric-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 28px; font-weight: bold; color: #f97316; }
          .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f97316; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Analytics Report</h1>
          <p class="period">Period: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} | Generated: ${new Date().toLocaleString()}</p>
        </div>

        <h2>Key Metrics</h2>
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(analytics.totalRevenue)}</div>
            <div class="metric-label">Total Revenue</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${analytics.totalOrders}</div>
            <div class="metric-label">Total Orders</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(analytics.avgOrderValue)}</div>
            <div class="metric-label">Avg Order Value</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${analytics.totalItems}</div>
            <div class="metric-label">Items Sold</div>
          </div>
        </div>

        <h2>Top Selling Items</h2>
        <table>
          <thead>
            <tr><th>Rank</th><th>Item</th><th>Quantity</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${analytics.popularItems.map((item, idx) => `
              <tr>
                <td>#${idx + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr><th>Category</th><th>Items Sold</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${analytics.categoryBreakdown.map(cat => `
              <tr>
                <td>${cat.category}</td>
                <td>${cat.orders}</td>
                <td>${formatCurrency(cat.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Daily Performance</h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Orders</th><th>Revenue</th><th>Avg Order</th></tr>
          </thead>
          <tbody>
            ${analytics.dailyStats.map(day => `
              <tr>
                <td>${day.date}</td>
                <td>${day.orders}</td>
                <td>${formatCurrency(day.revenue)}</td>
                <td>${formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated by Restaurant Analytics Dashboard</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
    
    toast.success('PDF export opened')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted/50 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Time Range Selector - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics Dashboard
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCSV}
            className="flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportToPDF}
            className="flex-1 sm:flex-none"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'today' ? 'default' : 'outline'}
            onClick={() => setTimeRange('today')}
            className="flex-1 sm:flex-none"
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            className="flex-1 sm:flex-none"
          >
            This Week
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            className="flex-1 sm:flex-none"
          >
            This Month
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-success opacity-50" />
              {analytics.revenueChange >= 0 ? (
                <Badge variant="success" className="text-xs">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {analytics.revenueChange.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  {Math.abs(analytics.revenueChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(analytics.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-primary opacity-50" />
              {analytics.ordersChange >= 0 ? (
                <Badge variant="success" className="text-xs">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {analytics.ordersChange.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  {Math.abs(analytics.ordersChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{analytics.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-info opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
            <p className="text-2xl font-bold text-info">{formatCurrency(analytics.avgOrderValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-warning opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">Items Sold</p>
            <p className="text-2xl font-bold text-warning">{analytics.totalItems}</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items & Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                      #{idx + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(item.revenue)}</p>
                </div>
              ))}
              {analytics.popularItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.categoryBreakdown.map((cat, idx) => {
                const maxRevenue = Math.max(...analytics.categoryBreakdown.map(c => c.revenue))
                const percentage = maxRevenue > 0 ? (cat.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(cat.revenue)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {analytics.categoryBreakdown.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No category data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Hourly Order Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {analytics.hourlyDistribution.map((hour, idx) => {
              const maxOrders = Math.max(...analytics.hourlyDistribution.map(h => h.orders))
              const height = maxOrders > 0 ? (hour.orders / maxOrders) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t transition-all ${
                      hour.orders > 0 ? 'bg-primary/60 hover:bg-primary' : 'bg-muted'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${hour.hour}:00 - ${hour.orders} orders`}
                  />
                  <span className="text-xs text-muted-foreground">{hour.hour}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Daily Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-right p-3 font-semibold">Orders</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                  <th className="text-right p-3 font-semibold">Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {analytics.dailyStats.map((day, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">{day.date}</td>
                    <td className="p-3 text-right">{day.orders}</td>
                    <td className="p-3 text-right font-medium text-success">
                      {formatCurrency(day.revenue)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0)}
                    </td>
                  </tr>
                ))}
                {analytics.dailyStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-8">
                      No data for selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
