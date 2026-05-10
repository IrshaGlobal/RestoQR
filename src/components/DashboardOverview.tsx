import { useState, useEffect } from 'react'
import { 
  ShoppingCart, DollarSign, Users, TrendingUp,
  Plus, BarChart3, UtensilsCrossed, LayoutGrid
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase, Restaurant } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface DashboardOverviewProps {
  restaurantId: string
  restaurant: Restaurant | null
  onToggleStatus: () => void
  menuItemsCount: number
  tablesCount: number
  categoriesCount: number
  onViewSection: (section: string) => void
}

interface OrderSummary {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  tables?: { table_number: number } | null
}

export default function DashboardOverview({
  restaurantId,
  restaurant,
  onToggleStatus,
  menuItemsCount,
  tablesCount,
  categoriesCount,
  onViewSection
}: DashboardOverviewProps) {
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    revenue: 0,
    avgOrderValue: 0
  })
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Subscribe to real-time order updates
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        () => fetchDashboardData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  const fetchDashboardData = async () => {
    try {
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Fetch today's orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          tables (table_number)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (orders) {
        // Transform orders to match OrderSummary interface
        const transformedOrders: OrderSummary[] = (orders as any[]).map((order: any) => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total: order.total,
          created_at: order.created_at,
          tables: order.tables || null
        }))
        setRecentOrders(transformedOrders)
        
        // Calculate stats
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        setTodayStats({
          orders: totalOrders,
          revenue: totalRevenue,
          avgOrderValue
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info'
      case 'preparing': return 'warning'
      case 'ready': return 'success'
      case 'delivered': return 'secondary'
      default: return 'default'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-enter">
      {/* Key Metrics Cards - LUMINOUS CRYSTAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders Today */}
        <Card className="metric-card group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Orders Today</p>
                <p className="text-2xl sm:text-3xl font-bold truncate text-foreground">{todayStats.orders}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>Live</span>
                </div>
              </div>
              <div className="metric-card-icon bg-gradient-to-br from-info/20 to-info/10 flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-200">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Today */}
        <Card className="metric-card group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Revenue Today</p>
                <p className="text-2xl sm:text-3xl font-bold truncate text-foreground">{formatCurrency(todayStats.revenue)}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>Real-time</span>
                </div>
              </div>
              <div className="metric-card-icon bg-gradient-to-br from-success/20 to-success/10 flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-200">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tables */}
        <Card className="metric-card group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Tables</p>
                <p className="text-2xl sm:text-3xl font-bold truncate text-foreground">{tablesCount}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{categoriesCount} categories</span>
                </div>
              </div>
              <div className="metric-card-icon bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-200">
                <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="metric-card group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-2xl sm:text-3xl font-bold truncate text-foreground">{formatCurrency(todayStats.avgOrderValue)}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>{menuItemsCount} items</span>
                </div>
              </div>
              <div className="metric-card-icon bg-gradient-to-br from-warning/20 to-warning/10 flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - Recent Orders & Quick Actions */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Recent Orders */}
          <Card className="content-card theme-transition">
            <CardHeader className="px-6 py-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Recent Orders</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewSection('orders')}
                  className="text-sm h-9 hover:bg-primary/10 rounded-lg"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No orders today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div 
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg glass-card hover:bg-primary/5 transition-all duration-200 theme-transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          <span className="font-bold text-primary text-sm">
                            {order.order_number}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            Table {order.tables?.table_number || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatTime(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="font-semibold text-sm hidden sm:inline">
                          {formatCurrency(order.total)}
                        </span>
                        <Badge 
                          variant={getStatusColor(order.status) as any}
                          className="text-xs px-2 py-0.5 h-6"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="content-card theme-transition">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-5 flex flex-col gap-2 theme-transition hover:scale-[1.02] active:scale-[0.98] glass-card hover:bg-primary/10 rounded-lg shadow-md hover:shadow-lg"
                  onClick={() => onViewSection('menu-items')}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Add Menu Item</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-5 flex flex-col gap-2 theme-transition hover:scale-[1.02] active:scale-[0.98] glass-card hover:bg-primary/10 rounded-lg shadow-md hover:shadow-lg"
                  onClick={() => onViewSection('tables')}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-xs">Add Table</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-5 flex flex-col gap-2 theme-transition hover:scale-[1.02] active:scale-[0.98] glass-card hover:bg-primary/10 rounded-lg shadow-md hover:shadow-lg"
                  onClick={() => onViewSection('analytics')}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">View Analytics</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-5 flex flex-col gap-2 theme-transition hover:scale-[1.02] active:scale-[0.98] glass-card hover:bg-primary/10 rounded-lg shadow-md hover:shadow-lg"
                  onClick={() => onViewSection('staff')}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Manage Staff</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Restaurant Status & Stats */}
        <div className="space-y-6 sm:space-y-8">
          {/* Restaurant Status Card */}
          <Card className="content-card theme-transition">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg font-semibold text-foreground">Restaurant Status</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Status</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Toggle to accept orders
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={restaurant?.is_open ? 'success' : 'destructive'}
                  >
                    {restaurant?.is_open ? 'OPEN' : 'CLOSED'}
                  </Badge>
                  <Switch 
                    checked={restaurant?.is_open} 
                    onCheckedChange={onToggleStatus}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Quick Stats</p>
                <div className="space-y-2">
                  <div className="quick-stat">
                    <span className="text-sm text-muted-foreground">Menu Items</span>
                    <span className="font-semibold">{menuItemsCount}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className="font-semibold text-success">
                      {menuItemsCount} {/* Would need filtering logic */}
                    </span>
                  </div>
                  <div className="quick-stat">
                    <span className="text-sm text-muted-foreground">Tables</span>
                    <span className="font-semibold">{tablesCount}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="text-sm text-muted-foreground">Categories</span>
                    <span className="font-semibold">{categoriesCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Configuration Preview */}
          <Card className="content-card theme-transition">
            <CardHeader>
              <CardTitle className="text-lg font-semibold gradient-text-premium">Customer Menu Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dietary Filters</p>
                    <p className="text-xs text-muted-foreground">Dairy-Free, Gluten-Free, etc.</p>
                  </div>
                  <Badge variant={restaurant?.filter_config?.dietary !== false ? 'success' : 'secondary'}>
                    {restaurant?.filter_config?.dietary !== false ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sort Controls</p>
                    <p className="text-xs text-muted-foreground">A-Z, Price, Fast</p>
                  </div>
                  <Badge variant={restaurant?.filter_config?.sort !== false ? 'success' : 'secondary'}>
                    {restaurant?.filter_config?.sort !== false ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => onViewSection('settings')}
              >
                Configure Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
