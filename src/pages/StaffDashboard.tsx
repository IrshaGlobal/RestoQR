import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, ChefHat, CheckCircle2, Truck, Volume2, VolumeX, Maximize2, Minimize2, 
  Loader2, LogOut, QrCode, ShoppingBag, MapPin, User,
  TrendingUp, Clock, Filter, Printer, Search, Moon, Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedBadge } from '@/components/ui/animated-badge'
import { supabase, Order, OrderItem, HelpRequest, Table, getStaffInfo, getCurrentUser, signOut } from '@/lib/supabase'
import { formatCurrency, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import BatchOperations from '@/components/BatchOperations'
import TableManagementDialog from '@/components/TableManagementDialog'

// Audio context for notification sounds
const playOrderNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const frequencies = [800, 1000, 800]
    const startTime = audioContext.currentTime
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      const beepStart = startTime + (index * 0.2)
      gainNode.gain.setValueAtTime(0.5, beepStart)
      gainNode.gain.exponentialRampToValueAtTime(0.01, beepStart + 0.15)
      
      oscillator.start(beepStart)
      oscillator.stop(beepStart + 0.15)
    })
  } catch (error) {
    console.error('Failed to play order notification sound:', error)
  }
}

const playHelpRequestSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const startTime = audioContext.currentTime
    
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 600
      oscillator.type = 'sine'
      
      const beepStart = startTime + (i * 0.35)
      gainNode.gain.setValueAtTime(0.5, beepStart)
      gainNode.gain.exponentialRampToValueAtTime(0.01, beepStart + 0.25)
      
      oscillator.start(beepStart)
      oscillator.stop(beepStart + 0.25)
    }
  } catch (error) {
    console.error('Failed to play help request sound:', error)
  }
}

export default function StaffDashboard() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[], tables?: Table })[]>([])
  const [helpRequests, setHelpRequests] = useState<(HelpRequest & { tables?: Table })[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [isMuted, setIsMuted] = useState(false)
  const [isKitchenMode, setIsKitchenMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [showTableManagement, setShowTableManagement] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDark, setIsDark] = useState(true)
  const [batchOpsOpen, setBatchOpsOpen] = useState(false)
  
  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('staff-dashboard-muted')
    if (saved) setIsMuted(JSON.parse(saved))
    
    const savedKitchenMode = localStorage.getItem('staff-dashboard-kitchen-mode')
    if (savedKitchenMode) setIsKitchenMode(JSON.parse(savedKitchenMode))
    
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('staff-theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      // Default to dark theme for staff dashboard
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('staff-dashboard-muted', JSON.stringify(isMuted))
  }, [isMuted])

  useEffect(() => {
    localStorage.setItem('staff-dashboard-kitchen-mode', JSON.stringify(isKitchenMode))
  }, [isKitchenMode])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('staff-theme', newTheme ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout')
    }
  }

  // Initialize and fetch data
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          toast.error('Please log in')
          return
        }

        const staffInfo = await getStaffInfo(user.id)
        setRestaurantId(staffInfo.restaurant_id)

        // Fetch restaurant name
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', staffInfo.restaurant_id)
          .single()
        
        if (restaurantData?.name) {
          setRestaurantName(restaurantData.name)
        }

        // Fetch initial data
        await fetchOrders(staffInfo.restaurant_id)
        await fetchHelpRequests(staffInfo.restaurant_id)
      } catch (error) {
        console.error('Initialization failed:', error)
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!restaurantId) return

    const ordersChannel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            if (!isMuted) playOrderNotificationSound()
            toast.success(`New order received! #${(payload.new as Order).order_number}`)
          }
          fetchOrders(restaurantId)
        }
      )
      .subscribe()

    const helpChannel = supabase
      .channel('help-requests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'help_requests', filter: `restaurant_id=eq.${restaurantId}` },
        async (payload) => {
          if (!isMuted) playHelpRequestSound()
          const tableNumber = await getTableNumberForHelpRequest(payload.new.table_id)
          toast.warning(`Help requested from Table ${tableNumber || 'N/A'}`)
          fetchHelpRequests(restaurantId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(helpChannel)
    }
  }, [restaurantId, isMuted])

  const fetchOrders = async (restId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables(*),
          order_items(
            *,
            menu_items(name, image_url, allergens, price)
          )
        `)
        .eq('restaurant_id', restId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Debug: Log order items count
      if (data && data.length > 0) {
        console.log('Fetched orders:', data.length)
        data.forEach(order => {
          console.log(`Order ${order.order_number}: ${(order as any).order_items?.length || 0} items`)
        })
      }
      
      const transformedData = (data || []).map(order => ({
        ...order,
        items: order.order_items || []
      }))
      
      setOrders(transformedData)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    }
  }

  const fetchHelpRequests = async (restId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*, tables!inner(*)')
        .eq('restaurant_id', restId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHelpRequests(data || [])
    } catch (error) {
      console.error('Failed to fetch help requests:', error)
      toast.error('Failed to load help requests')
    }
  }

  const getTableNumberForHelpRequest = async (tableId: string): Promise<number | null> => {
    try {
      const { data } = await supabase
        .from('tables')
        .select('table_number')
        .eq('id', tableId)
        .single()
      
      return data?.table_number || null
    } catch (error) {
      console.error('Failed to fetch table number:', error)
      return null
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdatingStatus(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
      
      toast.success(`Order marked as ${status}`)
      if (restaurantId) fetchOrders(restaurantId)
    } catch (error) {
      console.error('Failed to update order:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const dismissAllHelpRequests = async () => {
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({ status: 'dismissed' })
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')

      if (error) throw error
      
      toast.success('All help requests dismissed')
      if (restaurantId) fetchHelpRequests(restaurantId)
    } catch (error) {
      console.error('Failed to dismiss all help requests:', error)
      toast.error('Failed to dismiss help requests')
    }
  }

  const toggleKitchenMode = () => {
    if (!isKitchenMode) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
    setIsKitchenMode(!isKitchenMode)
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!isKitchenMode) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch(e.key.toLowerCase()) {
        case 'm':
          setIsMuted(prev => {
            toast.info(prev ? 'Sound enabled' : 'Sound muted')
            return !prev
          })
          break
        case 'k':
        case 'escape':
          setIsKitchenMode(false)
          break
        case '1':
          const firstOrder = orders.find(o => o.status === 'new')
          if (firstOrder) updateOrderStatus(firstOrder.id, 'preparing')
          break
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {})
          } else {
            document.exitFullscreen?.().catch(() => {})
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isKitchenMode, orders])

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesType = filterType === 'all' || order.order_type === filterType || (!order.order_type && filterType === 'dinein')
    
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      order.order_number.toString().toLowerCase().includes(searchLower) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
      (order.customer_phone && order.customer_phone.toLowerCase().includes(searchLower)) ||
      (order.delivery_address && order.delivery_address.toLowerCase().includes(searchLower))
    
    return matchesStatus && matchesType && matchesSearch
  })

  const stats = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    total: orders.filter(o => {
      const today = new Date()
      const orderDate = new Date(o.created_at)
      return orderDate.toDateString() === today.toDateString()
    }).length,
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-black via-black to-[#00F0FF]/5' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'}`}>
        <div className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-slate-200/50'}`}>
          <Skeleton className={`h-8 w-48 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className={`h-32 w-full rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            ))}
          </div>
          <Skeleton className={`h-96 w-full rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${isKitchenMode ? 'p-0' : ''} ${isDark ? 'bg-[#141210]' : 'bg-[#F5F1EB]'}`}>
      {/* Hide scrollbar for filter pills */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Premium Minimalist Header */}
      {!isKitchenMode && (
        <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isDark ? 'bg-[#141210]/95 border-[#332F2C]' : 'bg-white/95 border-[#E2DDD5]'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Logo & Restaurant Name */}
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTableManagement(true)}
                    className="h-12 w-12 hover:bg-bg-secondary transition-all"
                    title="Manage Tables & QR Codes"
                  >
                    <QrCode className={`w-5 h-5 ${isDark ? 'text-text-primary' : 'text-text-primary'}`} />
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="hidden sm:block"
                >
                  <div className={`text-xs uppercase tracking-wider mb-1 font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>STAFF DASHBOARD</div>
                  <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-text-primary' : 'text-text-primary'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {restaurantName}
                  </h1>
                </motion.div>
              </div>
              
              {/* Right: Action Buttons */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-12 w-12 hover:bg-bg-secondary transition-all"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark ? <Sun className="w-5 h-5 text-text-primary" /> : <Moon className="w-5 h-5 text-text-primary" />}
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsMuted(!isMuted)
                      toast.info(isMuted ? 'Sound enabled' : 'Sound muted')
                    }}
                    className="h-12 w-12 hover:bg-bg-secondary transition-all"
                    title="Toggle Sound (M)"
                  >
                    {isMuted ? <VolumeX className={`w-5 h-5 ${isDark ? 'text-text-muted' : 'text-text-muted'}`} /> : <Volume2 className="w-5 h-5 text-accent" />}
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="default"
                    size="icon"
                    onClick={toggleKitchenMode}
                    className="h-12 w-12 bg-accent hover:bg-accent/90 text-white shadow-sm transition-all"
                    title={isKitchenMode ? 'Exit Kitchen Mode (K)' : 'Enter Kitchen Mode (K) - Fullscreen optimized view'}
                  >
                    {isKitchenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="h-12 px-6 font-semibold"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Table Management Dialog */}
      {restaurantId && (
        <TableManagementDialog 
          restaurantId={restaurantId}
          open={showTableManagement}
          onOpenChange={setShowTableManagement}
        />
      )}

      {/* Help Request Banner */}
      {!isKitchenMode && helpRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent text-white shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold">
                {helpRequests.length} table{helpRequests.length > 1 ? 's' : ''} need help
              </span>
              <div className="flex gap-2">
                {helpRequests.slice(0, 5).map(request => (
                  <span key={request.id} className="text-xs px-2.5 py-1 bg-white/20 rounded-full font-medium">
                    T{request.tables?.table_number}
                  </span>
                ))}
              </div>
            </div>
            <button 
              onClick={dismissAllHelpRequests}
              className="text-sm hover:opacity-80 transition-opacity font-medium underline underline-offset-2"
            >
              Dismiss All
            </button>
          </div>
        </motion.div>
      )}

      {/* Kitchen Mode Header */}
      {isKitchenMode && (
        <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isDark ? 'bg-[#141210]/95 border-[#332F2C]' : 'bg-white/95 border-[#E2DDD5]'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <div className={`text-xs uppercase tracking-wider mb-1 font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>KITCHEN MODE ACTIVE</div>
                  <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-text-primary' : 'text-text-primary'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {restaurantName}
                  </h1>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setIsKitchenMode(false)}
                  className="h-12 w-12 shadow-sm transition-all"
                  title="Exit Kitchen Mode (K)"
                >
                  <Minimize2 className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </header>
      )}

      {/* Orders Display - Shows in Both Normal and Kitchen Mode */}
      <main className={`max-w-7xl mx-auto ${isKitchenMode ? 'px-6 py-6' : 'px-4 sm:px-6 py-8'}`}>
        {!isKitchenMode && (
          <>
            {/* Brutalist Data Panels will be here - continuing below */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`relative overflow-hidden border transition-colors duration-300 ${isDark ? 'border-[#332F2C] bg-card' : 'border-[#E2DDD5] bg-white'}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`h-10 w-10 flex items-center justify-center bg-accent/10`}>
                      <Bell className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>{stats.new}</div>
                      <div className={`text-xs uppercase tracking-wide mt-1 font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>New Orders</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={`relative overflow-hidden border transition-colors duration-300 ${isDark ? 'border-[#332F2C] bg-card' : 'border-[#E2DDD5] bg-white'}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`h-10 w-10 flex items-center justify-center bg-warning/10`}>
                      <ChefHat className="w-5 h-5 text-warning" />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>{stats.preparing}</div>
                      <div className={`text-xs uppercase tracking-wide mt-1 font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>Cooking</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`relative overflow-hidden border transition-colors duration-300 ${isDark ? 'border-[#332F2C] bg-card' : 'border-[#E2DDD5] bg-white'}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`h-10 w-10 flex items-center justify-center bg-success/10`}>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>{stats.ready}</div>
                      <div className={`text-xs uppercase tracking-wide mt-1 font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>Ready</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className={`relative overflow-hidden border transition-colors duration-300 ${isDark ? 'border-[#332F2C] bg-card' : 'border-[#E2DDD5] bg-white'}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`h-10 w-10 flex items-center justify-center bg-info/10`}>
                      <TrendingUp className={`w-5 h-5 ${isDark ? 'text-info' : 'text-info'}`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>{stats.total}</div>
                      <div className={`text-xs uppercase tracking-wide mt-1 font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters and Orders */}
          <Tabs value={filterStatus} onValueChange={setFilterStatus}>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Mobile-Optimized Filter Pills with Horizontal Scrolling */}
                <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                  <TabsList className={`h-12 border p-1 shadow-sm inline-flex min-w-full sm:min-w-0 transition-colors duration-300 ${isDark ? 'bg-[#1A1816] border-[#332F2C]' : 'bg-white border-[#E2DDD5]'}`}>
                    <TabsTrigger 
                      value="all" 
                      className={`rounded-none px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap data-[state=active]:text-white transition-all font-semibold ${isDark ? 'data-[state=active]:bg-accent' : 'data-[state=active]:bg-accent'}`}
                    >
                      All ({orders.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="new" 
                      className={`rounded-none px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap data-[state=active]:text-white transition-all font-semibold ${isDark ? 'data-[state=active]:bg-info' : 'data-[state=active]:bg-info'}`}
                    >
                      New ({stats.new})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="preparing" 
                      className={`rounded-none px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap data-[state=active]:text-white transition-all font-semibold ${isDark ? 'data-[state=active]:bg-warning' : 'data-[state=active]:bg-warning'}`}
                    >
                      Cooking ({stats.preparing})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ready" 
                      className={`rounded-none px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap data-[state=active]:text-white transition-all font-semibold ${isDark ? 'data-[state=active]:bg-success' : 'data-[state=active]:bg-success'}`}
                    >
                      Ready ({stats.ready})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:flex-none">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`} />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full sm:w-64 h-12 pl-10 pr-4 rounded-none border focus:outline-none transition-colors text-sm ${isDark ? 'bg-[#1A1816] border-[#332F2C] focus:border-accent text-text-primary placeholder:text-text-muted' : 'bg-white border-[#E2DDD5] focus:border-accent text-text-primary placeholder:text-text-muted'}`}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-text-muted hover:text-text-secondary' : 'text-text-muted hover:text-text-secondary'}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 px-4 gap-2 rounded-none flex-shrink-0 font-semibold"
                      >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {filterType === 'all' ? 'All Types' : 
                           filterType === 'dinein' ? 'Dine-in' :
                           filterType === 'delivery' ? 'Delivery' : 'Takeout'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`w-48 rounded-none ${isDark ? 'bg-[#1A1816] border-[#332F2C]' : 'bg-white border-[#E2DDD5]'}`}>
                      <DropdownMenuItem onClick={() => setFilterType('all')} className={isDark ? 'text-text-primary hover:bg-bg-secondary' : ''}>
                        All Types
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('dinein')} className={isDark ? 'text-text-primary hover:bg-bg-secondary' : ''}>
                        <MapPin className="w-4 h-4 mr-2" />
                        Dine-in
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('delivery')} className={isDark ? 'text-text-primary hover:bg-bg-secondary' : ''}>
                        <Truck className="w-4 h-4 mr-2" />
                        Delivery
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('takeout')} className={isDark ? 'text-text-primary hover:bg-bg-secondary' : ''}>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Takeout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Search Results Info */}
              {searchTerm && (
                <div className={`text-sm px-2 ${isDark ? 'text-text-secondary' : 'text-text-secondary'}`}>
                  Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </div>
              )}
            </div>

            <TabsContent value={filterStatus} className="mt-0">
              {/* Batch Operations */}
              {restaurantId && (
                <details 
                  className="mb-6 group"
                  open={batchOpsOpen}
                  onToggle={(e) => setBatchOpsOpen((e.target as HTMLDetailsElement).open)}
                >
                  <summary className={`cursor-pointer text-sm font-semibold transition-all flex items-center gap-3 list-none p-4 rounded-none border ${
                    batchOpsOpen 
                      ? (isDark ? 'bg-accent/10 border-accent text-accent' : 'bg-accent/5 border-accent text-accent')
                      : (isDark ? 'text-text-secondary hover:text-accent border-[#332F2C] hover:border-accent' : 'text-text-secondary hover:text-accent border-[#E2DDD5] hover:border-accent')
                  }`}>
                    <div className={`h-10 w-10 flex items-center justify-center transition-all ${
                      batchOpsOpen
                        ? (isDark ? 'bg-accent/20' : 'bg-accent/10')
                        : (isDark ? 'bg-bg-secondary group-hover:bg-accent/10' : 'bg-bg-secondary group-hover:bg-accent/5')
                    }`}>
                      {batchOpsOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="m9 21 3-9 3 9"/></svg>
                      ) : (
                        <Filter className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold uppercase tracking-wider">
                        {batchOpsOpen ? 'Hide Batch Operations' : 'Show Batch Operations'}
                      </div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                        {batchOpsOpen ? 'Click to view order cards' : 'Click to access bulk actions'}
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 ${batchOpsOpen ? 'rotate-180' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </summary>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <BatchOperations 
                      restaurantId={restaurantId} 
                      orders={orders} 
                      onOrdersUpdated={() => fetchOrders(restaurantId)} 
                    />
                  </motion.div>
                </details>
              )}

              {/* Orders Grid - Only show when Batch Operations is closed */}
              <AnimatePresence mode="wait">
                {!batchOpsOpen && filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`p-16 text-center border shadow-sm rounded-none transition-colors duration-300 ${isDark ? 'bg-card border-[#332F2C]' : 'bg-white border-[#E2DDD5]'}`}>
                      <div className={`h-20 w-20 flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-bg-secondary' : 'bg-bg-secondary'}`}>
                        <ChefHat className={`w-10 h-10 ${isDark ? 'text-text-muted' : 'text-text-muted'}`} />
                      </div>
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>
                        {filterStatus === 'all' ? 'No active orders' : `No ${filterStatus} orders`}
                      </h3>
                      <p className={`text-sm max-w-md mx-auto mb-4 ${isDark ? 'text-text-secondary' : 'text-text-secondary'}`}>
                        {filterStatus === 'all' 
                          ? 'New orders will appear here automatically when customers place them.'
                          : 'Orders will appear here when they match this status.'}
                      </p>
                      {filterType !== 'all' && (
                        <Badge variant="secondary" className="rounded-full">
                          Filtering: {filterType}
                        </Badge>
                      )}
                    </Card>
                  </motion.div>
                ) : !batchOpsOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`grid ${isKitchenMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'} gap-3 sm:gap-4`}
                  >
                    {filteredOrders.map((order, idx) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={updateOrderStatus}
                        updating={updatingStatus === order.id}
                        kitchenMode={isKitchenMode}
                        index={idx}
                        isDark={isDark}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
          </>
        )}

        {/* Kitchen Mode Orders Grid */}
        {isKitchenMode && (
          <AnimatePresence mode="wait">
            {orders.filter(o => o.status !== 'delivered').length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-16 text-center border shadow-sm rounded-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-[#332F2C] bg-card' 
                    : 'border-[#E2DDD5] bg-white'
                }`}>
                  <div className={`h-20 w-20 flex items-center justify-center mx-auto mb-6 rounded-none ${
                    isDark ? 'bg-accent/10' : 'bg-accent/10'
                  }`}>
                    <ChefHat className={`w-10 h-10 ${isDark ? 'text-accent' : 'text-accent'}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 uppercase tracking-wide ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>
                    No Active Orders
                  </h3>
                  <p className={`text-sm max-w-md mx-auto mb-4 ${isDark ? 'text-text-secondary' : 'text-text-secondary'}`}>
                    All orders have been completed.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
              >
                {orders.filter(o => o.status !== 'delivered').map((order, idx) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                    updating={updatingStatus === order.id}
                    kitchenMode={isKitchenMode}
                    index={idx}
                    isDark={isDark}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}

// Modern Order Card Component
function OrderCard({ 
  order, 
  onUpdateStatus,
  updating,
  kitchenMode,
  index,
  isDark
}: {  
  order: Order & { items?: OrderItem[], tables?: Table }
  onUpdateStatus: (orderId: string, status: Order['status']) => void
  updating: boolean
  kitchenMode: boolean
  index: number
  isDark: boolean
}) {
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)

  const handlePrint = () => {
    // Create a print window with just this order's receipt
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) return

    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding: 4px 0;">${item.quantity}× ${item.menu_items?.name || 'Unknown Item'}</td>
        <td style="text-align: right; padding: 4px 0;"></td>
      </tr>
    `).join('') || ''

    const customerInfoHtml = (order.customer_name || order.customer_phone || order.delivery_address) ? `
      <div style="margin-top: 12px; padding: 8px; border: 1px dashed #ccc;">
        ${order.customer_name ? `<p style="margin: 4px 0;"><strong>${order.customer_name}</strong></p>` : ''}
        ${order.customer_phone ? `<p style="margin: 4px 0;">📞 ${order.customer_phone}</p>` : ''}
        ${order.order_type === 'delivery' && order.delivery_address ? `<p style="margin: 4px 0;">📍 ${order.delivery_address}</p>` : ''}
      </div>
    ` : ''

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.order_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .order-number {
            font-size: 24px;
            font-weight: bold;
            margin: 8px 0;
          }
          .meta {
            font-size: 12px;
            color: #666;
            margin: 4px 0;
          }
          .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border: 1px solid #000;
            margin: 4px 0;
            font-size: 11px;
            font-weight: bold;
          }
          .items {
            margin: 12px 0;
          }
          .total {
            border-top: 2px dashed #000;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            font-weight: bold;
            text-align: right;
          }
          .notes {
            background: #f5f5f5;
            padding: 8px;
            margin: 12px 0;
            border-left: 3px solid #FF006E;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="order-number">${order.order_number}</div>
          <div class="meta">${new Date(order.created_at).toLocaleString()}</div>
          <div class="type-badge">${order.order_type === 'delivery' ? 'DELIVERY' : order.order_type === 'takeout' ? 'TAKEOUT' : 'DINE-IN'}</div>
          ${order.tables?.table_number ? `<div class="meta">Table ${order.tables.table_number}</div>` : ''}
        </div>
        
        <div class="items">
          ${itemsHtml}
        </div>
        
        ${order.notes ? `<div class="notes"><strong>SPECIAL:</strong> ${order.notes}</div>` : ''}
        
        <div class="total">TOTAL: ${formatCurrency(order.total)}</div>
        
        ${customerInfoHtml}
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const statusActions = {
    new: { label: 'Start Preparing', nextStatus: 'preparing' as const, icon: <ChefHat className="w-4 h-4" />, color: 'bg-info' },
    preparing: { label: 'Mark Ready', nextStatus: 'ready' as const, icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-warning' },
    ready: { label: 'Mark Delivered', nextStatus: 'delivered' as const, icon: <Truck className="w-4 h-4" />, color: 'bg-success' },
    delivered: null,
  }

  const action = statusActions[order.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 rounded-none ${
        order.order_type === 'delivery' ? (isDark ? 'border-success/30 bg-card' : 'border-success/50 bg-white') : 
        order.status === 'new' ? (isDark ? 'border-info/30 bg-card' : 'border-info/50 bg-white') :
        order.status === 'preparing' ? (isDark ? 'border-warning/30 bg-card' : 'border-warning/50 bg-white') :
        order.status === 'ready' ? (isDark ? 'border-success/30 bg-card' : 'border-success/50 bg-white') :
        (isDark ? 'border-[#332F2C] bg-card' : 'border-[#E2DDD5] bg-white')
      }`}>
        {/* Status Gradient Bar */}
        <div className={`h-1 ${
          order.status === 'new' ? 'bg-info' :
          order.status === 'preparing' ? 'bg-warning' :
          order.status === 'ready' ? 'bg-success' :
          'bg-text-muted'
        }`} />
        
        <CardContent className={`space-y-4 ${kitchenMode ? 'p-6' : 'p-4 sm:p-6'}`}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 sm:gap-3 mb-2 flex-wrap">
                <h3 className={`font-bold tracking-tight truncate ${kitchenMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} ${isDark ? 'text-text-primary' : 'text-text-primary'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {order.order_number}
                </h3>
                <span className={`text-xs sm:text-sm flex items-center gap-1 flex-shrink-0 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(new Date(order.created_at))}
                </span>
              </div>
              
              {/* Order Type Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {order.order_type === 'delivery' && (
                  <AnimatedBadge variant="success">
                    <Truck className="w-3 h-3 mr-1" />
                    Delivery
                  </AnimatedBadge>
                )}
                {order.order_type === 'takeout' && (
                  <AnimatedBadge variant="warning">
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Takeout
                  </AnimatedBadge>
                )}
                {(order.order_type === 'dinein' || !order.order_type) && (
                  <AnimatedBadge variant="default">
                    <MapPin className="w-3 h-3 mr-1" />
                    Dine-in
                  </AnimatedBadge>
                )}
                
                {(order.order_type === 'dinein' || !order.order_type) && order.tables?.table_number && (
                  <span className={`text-sm font-semibold ml-2 ${isDark ? 'text-text-secondary' : 'text-text-secondary'}`}>
                    Table {order.tables.table_number}
                  </span>
                )}
              </div>
              
              {/* Customer Info for Delivery/Takeout */}
              {(order.order_type === 'delivery' || order.order_type === 'takeout') && (order.customer_name || order.customer_phone || order.delivery_address) && (
                <div className={`mt-3 p-4 border ${
                  order.order_type === 'delivery' ? (isDark ? 'bg-success/5 border-success/30' : 'bg-success/5 border-success/50') : (isDark ? 'bg-accent/5 border-accent/30' : 'bg-accent/5 border-accent/50')
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>Customer Details</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                      className={`h-6 w-6 p-0 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                      title={showCustomerInfo ? "Hide" : "Show"}
                    >
                      {showCustomerInfo ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-white/70' : 'text-slate-600'}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-white/70' : 'text-slate-600'}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </Button>
                  </div>
                  {showCustomerInfo && (
                    <div className="space-y-2">
                      {order.customer_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className={`w-4 h-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`} />
                          <span className={`font-semibold ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>{order.customer_name}</span>
                        </div>
                      )}
                      {order.customer_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Bell className={`w-4 h-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`} />
                          <span className={isDark ? 'text-text-secondary' : 'text-text-secondary'}>{order.customer_phone}</span>
                        </div>
                      )}
                      {order.order_type === 'delivery' && order.delivery_address && (
                        <div className="flex items-start gap-2 text-sm pt-1">
                          <MapPin className={`w-4 h-4 ${isDark ? 'text-text-muted' : 'text-text-muted'} mt-0.5 flex-shrink-0`} />
                          <span className={`leading-relaxed ${isDark ? 'text-text-secondary' : 'text-text-secondary'}`}>{order.delivery_address}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {!showCustomerInfo && (
                    <div className={`text-xs text-center py-2 italic ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                      Click eye icon to reveal customer details
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Status Badge & Print Button */}
            <div className="flex items-center gap-2">
              <AnimatedBadge 
                variant={
                  order.status === 'new' ? 'info' :
                  order.status === 'preparing' ? 'warning' :
                  order.status === 'ready' ? 'success' : 'default'
                }
              >
                {order.status}
              </AnimatedBadge>
              
              {!kitchenMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className={`h-8 w-8 p-0 rounded-none transition-colors ${isDark ? 'hover:bg-bg-secondary' : 'hover:bg-bg-secondary'}`}
                  title="Print Receipt"
                >
                  <Printer className={`w-4 h-4 transition-colors ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-text-secondary hover:text-text-primary'}`} />
                </Button>
              )}
            </div>
          </div>

          {/* Total */}
          <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-text-primary' : 'text-text-primary'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {formatCurrency(order.total)}
          </div>

          {/* Divider */}
          <div className={`border-t ${isDark ? 'border-[#332F2C]' : 'border-[#E2DDD5]'}`} />

          {/* Order Items */}
          <div className="space-y-2">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className={`font-bold flex-shrink-0 ${kitchenMode ? 'text-xl sm:text-2xl w-10 sm:w-12' : 'text-lg sm:text-xl w-8 sm:w-10'} text-accent`}>
                      {item.quantity}×
                    </span>
                    <span className={`font-medium truncate ${kitchenMode ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>
                      {item.menu_items?.name || 'Unknown Item'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-xs text-center py-2 italic ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                No items in this order
              </div>
            )}
          </div>

          {/* Special Instructions */}
          {order.notes && (
            <div className={`border-l-4 p-3 ${isDark ? 'bg-accent/10 border-accent' : 'bg-accent/5 border-accent'}`}>
              <p className={`text-sm ${isDark ? 'text-text-primary' : 'text-text-primary'}`}>{order.notes}</p>
            </div>
          )}

          {/* Action Button */}
          {action && (
            <Button
              size="lg"
              className={`w-full ${kitchenMode ? 'h-14 sm:h-16 text-sm sm:text-base' : 'h-12 sm:h-14 text-xs sm:text-sm'} font-bold uppercase tracking-wide transition-all active:scale-[0.98] rounded-none shadow-sm ${
                order.status === 'new' ? 'bg-info hover:bg-info/90 text-white' :
                order.status === 'preparing' ? 'bg-warning hover:bg-warning/90 text-white' :
                'bg-success hover:bg-success/90 text-white'
              }`}
              onClick={() => onUpdateStatus(order.id, action.nextStatus)}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              ) : (
                action.icon
              )}
              <span className="ml-2 hidden sm:inline">{action.label}</span>
              <span className="ml-2 sm:hidden">{action.label.split(' ')[0]}</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
