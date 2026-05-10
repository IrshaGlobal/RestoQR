import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ShoppingCart, Plus, Minus, X, Clock, AlertCircle, CheckCircle2, ChefHat, Bell, Loader2, Image as ImageIcon, Flame, Leaf, WheatOff, Utensils, ArrowUpDown, ArrowUpNarrowWide, Timer, Milk, Wheat, Nut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore } from '@/stores/cart'
import { supabase, createOrder, createHelpRequest, MenuItem, Category, Restaurant } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { checkRateLimit, sanitizeInput, isValidUUID } from '@/lib/security'
import ItemCustomization from '@/components/ItemCustomization'
import { toast } from 'sonner'

// Demo data for testing without backend
const demoCategories: Category[] = [
  { id: '1', restaurant_id: 'demo', name: 'Appetizers', sort_order: 1, created_at: '' },
  { id: '2', restaurant_id: 'demo', name: 'Main Courses', sort_order: 2, created_at: '' },
  { id: '3', restaurant_id: 'demo', name: 'Desserts', sort_order: 3, created_at: '' },
  { id: '4', restaurant_id: 'demo', name: 'Beverages', sort_order: 4, created_at: '' },
]

const demoMenuItems: MenuItem[] = [
  { id: '1', restaurant_id: 'demo', category_id: '1', name: 'Crispy Calamari', description: 'Golden fried squid rings served with marinara sauce and lemon wedges', price: 12.99, image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop', allergens: 'Contains: Shellfish, Gluten', prep_time: 10, is_available: true, created_at: '', updated_at: '' },
  { id: '2', restaurant_id: 'demo', category_id: '1', name: 'Bruschetta', description: 'Toasted bread topped with fresh tomatoes, basil, garlic, and balsamic glaze', price: 9.99, image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', allergens: 'Contains: Gluten', prep_time: 8, is_available: true, created_at: '', updated_at: '' },
  { id: '3', restaurant_id: 'demo', category_id: '1', name: 'Caesar Salad', description: 'Crisp romaine lettuce with parmesan, croutons, and classic Caesar dressing', price: 11.99, image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', allergens: 'Contains: Dairy, Eggs, Gluten', prep_time: 7, is_available: true, created_at: '', updated_at: '' },
  { id: '4', restaurant_id: 'demo', category_id: '2', name: 'Grilled Salmon', description: 'Atlantic salmon fillet with seasonal vegetables and herb butter sauce', price: 28.99, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', allergens: 'Contains: Fish, Dairy', prep_time: 20, is_available: true, created_at: '', updated_at: '' },
  { id: '5', restaurant_id: 'demo', category_id: '2', name: 'Ribeye Steak', description: '12oz prime ribeye with garlic mashed potatoes and grilled asparagus', price: 34.99, image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop', allergens: 'Contains: Dairy', prep_time: 25, is_available: true, created_at: '', updated_at: '' },
  { id: '6', restaurant_id: 'demo', category_id: '2', name: 'Chicken Parmesan', description: 'Breaded chicken breast with marinara sauce, melted mozzarella, and pasta', price: 22.99, image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop', allergens: 'Contains: Dairy, Gluten, Eggs', prep_time: 18, is_available: true, created_at: '', updated_at: '' },
  { id: '7', restaurant_id: 'demo', category_id: '2', name: 'Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms, parmesan, and truffle oil', price: 19.99, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', allergens: 'Contains: Dairy', prep_time: 22, is_available: false, created_at: '', updated_at: '' },
  { id: '8', restaurant_id: 'demo', category_id: '3', name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream', price: 10.99, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', allergens: 'Contains: Dairy, Eggs, Gluten, Caffeine', prep_time: 5, is_available: true, created_at: '', updated_at: '' },
  { id: '9', restaurant_id: 'demo', category_id: '3', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center, vanilla ice cream, and berry compote', price: 12.99, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', allergens: 'Contains: Dairy, Eggs, Gluten', prep_time: 15, is_available: true, created_at: '', updated_at: '' },
  { id: '10', restaurant_id: 'demo', category_id: '4', name: 'Fresh Lemonade', description: 'House-made lemonade with fresh mint and a hint of ginger', price: 5.99, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', allergens: '', prep_time: 3, is_available: true, created_at: '', updated_at: '' },
  { id: '11', restaurant_id: 'demo', category_id: '4', name: 'Iced Coffee', description: 'Cold brew coffee with your choice of milk and sweetener', price: 6.99, image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop', allergens: 'Contains: Dairy (optional)', prep_time: 5, is_available: true, created_at: '', updated_at: '' },
  { id: '12', restaurant_id: 'demo', category_id: '4', name: 'Sparkling Water', description: 'Premium sparkling mineral water with lemon slice', price: 3.99, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop', allergens: '', prep_time: 2, is_available: true, created_at: '', updated_at: '' },
]

export default function CustomerMenu() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table') || '1'
  const restaurantId = searchParams.get('restaurant') || ''
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [dietaryFilters, setDietaryFilters] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'prepTime'>('name')
  const [showCart, setShowCart] = useState(false)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [orderStatus, setOrderStatus] = useState<'new' | 'preparing' | 'ready' | 'delivered'>('new')
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [helpRequested, setHelpRequested] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [cartItemSuggestions, setCartItemSuggestions] = useState<Record<string, MenuItem[]>>({}) // Suggestions for each cart item
  
  // Data from Supabase
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>(demoCategories)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(demoMenuItems)
  const [addonItems, setAddonItems] = useState<MenuItem[]>([]) // Separate add-on items
  
  const { items, addItem, removeItem, updateQuantity, notes, setNotes, getTotal, getItemCount, clearCart, setCallbacks, tableId: cartTableId, setTableId: setCartTableId } = useCartStore()
  
  // Handle add to cart with animation
  const handleAddToCart = (item: MenuItem, customizations?: any) => {
    setAddingToCart(item.id)
    addItem(item, customizations)
    setTimeout(() => setAddingToCart(null), 300)
  }
  
  // Get suggested add-ons for a menu item (ONLY connected ones)
  const getSuggestedAddons = async (menuItemId: string): Promise<MenuItem[]> => {
    if (addonItems.length === 0) return []
    
    try {
      // Get ONLY linked add-ons from addon_suggestions table
      const { data: suggestions } = await supabase
        .from('addon_suggestions')
        .select('addon_menu_item_id')
        .eq('parent_menu_item_id', menuItemId)
        .order('priority', { ascending: false })
      
      if (suggestions && suggestions.length > 0) {
        // Return the linked add-ons
        const addonIds = suggestions.map(s => s.addon_menu_item_id)
        return addonItems.filter(addon => addonIds.includes(addon.id))
      }
      
      // If no linked add-ons, return empty array (don't show random ones under items)
      return []
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      return []
    }
  }
  
  // Set up cart callbacks for toast notifications
  useEffect(() => {
    setCallbacks({
      onItemAdded: (item) => {
        toast.success(`${item.name} added to cart`)
      },
      onItemRemoved: (item) => {
        toast.info(`${item.name} removed from cart`)
      }
    })
    
    return () => {
      setCallbacks({ onItemAdded: undefined, onItemRemoved: undefined })
    }
  }, [setCallbacks])
  
  // Load suggestions for cart items
  useEffect(() => {
    const loadSuggestions = async () => {
      const newSuggestions: Record<string, MenuItem[]> = {}
      
      for (const cartItem of items) {
        if (!cartItemSuggestions[cartItem.item.id]) {
          const suggestions = await getSuggestedAddons(cartItem.item.id)
          newSuggestions[cartItem.item.id] = suggestions
        } else {
          newSuggestions[cartItem.item.id] = cartItemSuggestions[cartItem.item.id]
        }
      }
      
      if (Object.keys(newSuggestions).length > 0) {
        setCartItemSuggestions(prev => ({ ...prev, ...newSuggestions }))
      }
    }
    
    if (items.length > 0 && addonItems.length > 0) {
      loadSuggestions()
    }
  }, [items, addonItems])
  
  // Fetch data from Supabase on mount
  useEffect(() => {
    if (!restaurantId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single()
        
        if (restaurantError) throw restaurantError
        
        if (restaurantData) {
          setRestaurant(restaurantData)
          setIsClosed(!restaurantData.is_open)
        }

        // Fetch table number if tableId is provided
        if (tableId && isValidUUID(tableId)) {
          const { data: tableData } = await supabase
            .from('tables')
            .select('table_number')
            .eq('id', tableId)
            .single()
          
          if (tableData) {
            setTableNumber(tableData.table_number)
            setCartTableId(tableId)
          }
        }

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('sort_order')
        
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData)
        }

        // Fetch menu items
        const { data: menuItemsData } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_available', true)
        
        if (menuItemsData && menuItemsData.length > 0) {
          // Parse customization_config from JSONB (legacy) and fetch from junction table (new)
          const parsedItems = await Promise.all(menuItemsData.map(async (item) => {
            // Try to fetch from junction table first (new system)
            const { data: itemCustomizations } = await supabase
              .from('menu_item_customizations')
              .select(`
                *,
                global_customizations (*)
              `)
              .eq('menu_item_id', item.id)
              .eq('is_enabled', true)
              .order('sort_order')

            // If junction table has data, use it; otherwise fall back to legacy customization_config
            if (itemCustomizations && itemCustomizations.length > 0) {
              const customizations = itemCustomizations
                .filter(link => link.global_customizations)
                .map(link => ({
                  id: link.global_customizations!.id,
                  name: link.global_customizations!.name,
                  type: link.global_customizations!.type,
                  default_price: link.price_override ?? link.global_customizations!.default_price,
                  max_selections: link.global_customizations!.max_selections,
                  sort_order: link.sort_order
                }))
              
              return {
                ...item,
                customization_config: customizations
              }
            } else {
              // Fallback to legacy system
              return {
                ...item,
                customization_config: item.customization_config || []
              }
            }
          }))
          setMenuItems(parsedItems)
        }

        // Fetch add-on items (from Add-ons category)
        const addonsCategory = categoriesData?.find(c => c.name.toLowerCase() === 'add-ons')
        if (addonsCategory) {
          const { data: addonsData } = await supabase
            .from('menu_items')
            .select('*')
            .eq('category_id', addonsCategory.id)
            .eq('is_available', true)
          
          if (addonsData) {
            setAddonItems(addonsData)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load menu. Using demo data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [restaurantId])
  
  // Subscribe to order status updates when order is placed
  useEffect(() => {
    if (!orderId || !restaurantId) return

    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrderStatus(payload.new.status)
          toast.info(`Order status updated: ${payload.new.status}`)
        }
      )
      .subscribe()

    // Fetch queue position and ETA
    const fetchQueueInfo = async () => {
      try {
        // Get all active orders before this order
        const { data: activeOrders, error } = await supabase
          .from('orders')
          .select('id, status, created_at')
          .eq('restaurant_id', restaurantId)
          .in('status', ['new', 'preparing', 'ready'])
          .order('created_at', { ascending: true })

        if (error) throw error

        // Find position in queue
        const position = activeOrders.findIndex(o => o.id === orderId) + 1
        setQueuePosition(position > 0 ? position : null)

        // Calculate ETA based on position and avg prep time
        if (position > 0 && items.length > 0) {
          const maxPrepTimeVal = items.reduce((max, cartItem) => 
            Math.max(max, cartItem.item.prep_time), 15)
          const etaMinutes = position * maxPrepTimeVal
          setEstimatedTime(etaMinutes)
        }
      } catch (error) {
        console.error('Failed to fetch queue info:', error)
      }
    }

    fetchQueueInfo()
    const interval = setInterval(fetchQueueInfo, 30000) // Update every 30 seconds

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [orderId, restaurantId, items.length])
  
  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDietary = dietaryFilters.size === 0 || 
                          (item.allergens && Array.from(dietaryFilters).every(filter => 
                            !item.allergens.toLowerCase().includes(filter.toLowerCase())
                          ))
    return matchesCategory && matchesSearch && matchesDietary
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price.toString()) - parseFloat(b.price.toString())
      case 'prepTime':
        return a.prep_time - b.prep_time
      default:
        return a.name.localeCompare(b.name)
    }
  })
  
  // Get search suggestions
  const getSearchSuggestions = () => {
    if (!searchQuery || searchQuery.length < 2) return []
    const query = searchQuery.toLowerCase()
    return menuItems
      .filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description?.toLowerCase().includes(query)
      )
      .slice(0, 5)
  }
  
  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-[#C47A3D]/20 text-[#C47A3D] font-semibold">{part}</mark> : part
    )
  }


  // Count items per category
  const getCategoryItemCount = (categoryId: string) => {
    if (categoryId === 'all') return menuItems.length
    return menuItems.filter(item => item.category_id === categoryId).length
  }
  
  // Calculate max prep time in cart
  const maxPrepTime = items.reduce((max, cartItem) => 
    Math.max(max, cartItem.item.prep_time), 0)
  
  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    if (!restaurantId) {
      toast.error('Restaurant ID is missing')
      return
    }

    // Validate table ID
    if (!cartTableId && !tableId) {
      toast.error('Table ID is missing')
      return
    }

    // Validate restaurant and table IDs
    if (!isValidUUID(restaurantId)) {
      toast.error('Invalid restaurant ID')
      return
    }

    // Rate limiting: max 3 orders per table per minute
    const rateLimitKey = `order-${restaurantId}-${tableId}`
    if (!checkRateLimit(rateLimitKey, 3, 60000)) {
      toast.error(`Too many orders. Please wait before placing another order.`)
      return
    }
    
    setPlacingOrder(true)
    
    try {
      // Prepare order items with validation
      const orderItems = items.map(cartItem => {
        // Calculate price with customizations
        let priceAtOrder = parseFloat(cartItem.item.price.toString())
        
        if (cartItem.customizations && cartItem.item.customization_config) {
          cartItem.item.customization_config.forEach(option => {
            if (cartItem.customizations!.addons.includes(option.id)) {
              priceAtOrder += option.default_price
            }
            if (option.type === 'substitution' && Object.values(cartItem.customizations!.substitutions).includes(option.id)) {
              priceAtOrder += option.default_price
            }
          })
        }
        
        return {
          menu_item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          price_at_time_of_order: priceAtOrder,
          customizations: cartItem.customizations || null
        }
      })
      
      // Sanitize notes
      const sanitizedNotes = notes ? sanitizeInput(notes) : undefined
      
      // Create order using helper function
      const order = await createOrder(
        restaurantId, 
        cartTableId || tableId, 
        orderItems, 
        sanitizedNotes
      )
      
      setOrderId(order.id)
      setOrderNumber(order.order_number)
      setOrderPlaced(true)
      setShowCart(false)
      setOrderStatus(order.status)
      clearCart()
      
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Failed to place order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      toast.error(errorMessage)
    } finally {
      setPlacingOrder(false)
    }
  }
  
  const handleHelpRequest = async () => {
    if (!restaurantId) {
      toast.error('Restaurant ID is missing')
      return
    }

    // Rate limiting: max 2 help requests per table per 5 minutes
    const rateLimitKey = `help-${restaurantId}-${tableId}`
    if (!checkRateLimit(rateLimitKey, 2, 300000)) {
      toast.error(`Too many help requests. Please wait.`)
      return
    }
    
    try {
      await createHelpRequest(restaurantId, tableId)
      setHelpRequested(true)
      toast.success('Help request sent! A staff member will assist you shortly.')
      setTimeout(() => setHelpRequested(false), 3000)
    } catch (error) {
      console.error('Failed to send help request:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send help request. Please try again.'
      toast.error(errorMessage)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] p-6" style={{
        backgroundImage: 'linear-gradient(#E2DDD5 1px, transparent 1px), linear-gradient(90deg, #E2DDD5 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center center'
      }}>
        <div className="max-w-[960px] mx-auto space-y-4">
          {/* Hero skeleton */}
          <div className="space-y-3 border-b border-[#E2DDD5] pb-5">
            <Skeleton className="h-[28px] w-64" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-[44px] w-full mt-4" />
          </div>
          
          {/* Categories skeleton */}
          <div className="flex gap-3 overflow-hidden py-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-[88px] flex-shrink-0" />
            ))}
          </div>
          
          {/* Filters skeleton */}
          <div className="flex gap-3 overflow-hidden pb-5 border-b border-[#E2DDD5]">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 flex-shrink-0" />
            ))}
          </div>
          
          {/* Menu items skeleton with shimmer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border border-[#E2DDD5]">
                <div className="relative aspect-[4/3] bg-[#F0EDE8] animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between pb-3 border-b border-[#E2DDD5]">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-[40px] w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EB] p-6" style={{
        backgroundImage: 'linear-gradient(#E2DDD5 1px, transparent 1px), linear-gradient(90deg, #E2DDD5 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center center'
      }}>
        <Card className="max-w-md w-full text-center p-8 border border-[#E2DDD5] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <Clock className="w-16 h-16 text-[#8A857B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>We're Currently Closed</h1>
          <p className="text-[#5A554B]">Please check back during our operating hours.</p>
        </Card>
      </div>
    )
  }
  
  if (orderPlaced && orderId) {
    return (
      <div className="min-h-screen bg-[#F5F1EB]" style={{
        backgroundImage: 'linear-gradient(#E2DDD5 1px, transparent 1px), linear-gradient(90deg, #E2DDD5 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center center'
      }}>
        <div className="container mx-auto px-6 py-8 max-w-lg">
          <Card className="p-8 text-center animate-enter border border-[#E2DDD5] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-[#2D6A4F]" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Order Placed!</h1>
            <p className="text-[#5A554B] mb-6">Your order has been sent to the kitchen</p>
            
            <div className="bg-[#F5F1EB]/50 border border-[#E2DDD5] p-6 mb-6">
              <p className="text-sm text-[#5A554B] mb-2">Order Number</p>
              <p className="text-5xl font-bold text-[#C47A3D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderNumber || '0000'}</p>
              <p className="text-sm text-[#5A554B] mt-2">Table {tableNumber || tableId}</p>
            </div>

            {/* Queue Position and ETA */}
            {queuePosition && orderStatus !== 'delivered' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="border border-[#E2DDD5]">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-[#5A554B] mb-1">Queue Position</p>
                    <p className="text-3xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>#{queuePosition}</p>
                  </CardContent>
                </Card>
                <Card className="border border-[#E2DDD5]">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-[#5A554B] mb-1">Estimated Time</p>
                    <p className="text-3xl font-bold text-[#C47A3D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{estimatedTime} min</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              <StatusStep 
                status="new" 
                current={orderStatus} 
                label="Order Received" 
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
              <StatusStep 
                status="preparing" 
                current={orderStatus} 
                label="Preparing" 
                icon={<ChefHat className="w-5 h-5" />}
              />
              <StatusStep 
                status="ready" 
                current={orderStatus} 
                label="Ready for Pickup" 
                icon={<Bell className="w-5 h-5" />}
              />
              <StatusStep 
                status="delivered" 
                current={orderStatus} 
                label="Delivered" 
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
            </div>
            
            <Button onClick={() => { setOrderPlaced(false); setOrderId(null); setOrderStatus('new'); }} variant="outline" className="w-full border-[#E2DDD5] hover:border-[#0A0A0A]">
              Place Another Order
            </Button>
          </Card>
          
          <Button 
            onClick={handleHelpRequest}
            variant="outline" 
            className="w-full mt-4 border-[#E2DDD5] hover:border-[#0A0A0A]"
            disabled={helpRequested}
          >
            <Bell className="w-4 h-4 mr-2" />
            {helpRequested ? 'Help Requested!' : 'Call Waiter'}
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#F5F1EB] pb-24 pt-8 px-6 md:px-8 lg:px-12" style={{
      backgroundImage: 'linear-gradient(#E2DDD5 1px, transparent 1px), linear-gradient(90deg, #E2DDD5 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      backgroundPosition: 'center center'
    }} role="main" id="main-content">
      {/* Centered Card Container - Main Content */}
      <div className="max-w-[960px] mx-auto bg-white border border-[#E2DDD5] shadow-[0_2px_12px_rgba(0,0,0,0.04)] min-h-[80vh] flex flex-col">
      {/* HEADER - Ultra-Minimal: Search Only */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2DDD5] px-6 py-4" role="banner">
        {/* SEARCH - Sharp & Crisp */}
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#8A857B] pointer-events-none" />
          <Input
            placeholder="Search dishes, ingredients, or dietary preferences..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchSuggestions(true)
            }}
            onFocus={() => setShowSearchSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
            className="pl-10 pr-8 h-[44px] text-[14px] bg-white border-[#E2DDD5] focus:border-[#0A0A0A] focus:ring-0 focus:ring-offset-0 transition-all placeholder:text-[#8A857B]" style={{ borderRadius: 0 }}
            aria-label="Search menu items by name or description"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#0A0A0A] transition-colors p-0.5"
              aria-label="Clear search"
            >
              <X className="w-[14px] h-[14px]" />
            </button>
          )}
          
          {/* Search count indicator */}
          {searchQuery && filteredItems.length > 0 && (
            <div className="absolute -bottom-5 left-0 text-[10px] text-[#8A857B]">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </div>
          )}
          
          {/* Search Suggestions */}
          {showSearchSuggestions && searchQuery && getSearchSuggestions().length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-[#E2DDD5] shadow-2xl z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ borderRadius: 0 }}
              role="listbox"
            >
              <div className="px-3 py-2 border-b border-[#E2DDD5] text-[10px] font-medium text-[#8A857B] uppercase tracking-wide">
                Suggestions
              </div>
              {getSearchSuggestions().map((item) => (
                <button
                  key={item.id}
                  className="w-full px-4 py-3 text-left hover:bg-[#F5F1EB]/50 transition-colors border-b border-[#E2DDD5]/30 last:border-b-0 flex items-center gap-3 group/item"
                  onClick={() => {
                    setSearchQuery(item.name)
                    setShowSearchSuggestions(false)
                  }}
                  role="option"
                  aria-selected={false}
                >
                  <div className="relative w-12 h-12 overflow-hidden bg-[#F0EDE8] flex-shrink-0" style={{ borderRadius: 0 }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[#8A857B]/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover/item:text-[#0A0A0A] transition-colors">
                      {highlightMatch(item.name, searchQuery)}
                    </p>
                    <p className="text-xs text-[#5A554B] truncate">
                      {highlightMatch(item.description || '', searchQuery)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-[#C47A3D]">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-1 text-[10px] text-[#8A857B] mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {item.prep_time}m
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>


      
      {/* CATEGORIES - Small Sharp Cards */}
      <nav className="flex gap-3 overflow-x-auto px-6 py-5 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 snap-start w-[88px] h-[88px] border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-[2px] focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
            selectedCategory === 'all' 
              ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white hover:border-[#0A0A0A]' 
              : 'bg-white border-[#E2DDD5] text-[#0A0A0A] hover:border-[#0A0A0A]'
          }`}
        >
          <Utensils className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-white opacity-100' : 'text-[#0A0A0A] opacity-80'}`} />
          <span className={`text-[11px] font-bold tracking-wide uppercase leading-none ${selectedCategory === 'all' ? 'text-white' : 'text-[#0A0A0A]'}`}>All</span>
          <span className={`text-[10px] ${selectedCategory === 'all' ? 'text-white opacity-100' : 'text-[#0A0A0A] opacity-60'}`}>
            {getCategoryItemCount('all')}
          </span>
        </button>
        
        {categories.map(cat => {
          // Map category names to icons
          const getCategoryIcon = (name: string) => {
            const lowerName = name.toLowerCase()
            if (lowerName.includes('biryani') || lowerName.includes('rice')) return <Utensils className="w-4 h-4" />
            if (lowerName.includes('tandoor') || lowerName.includes('grill')) return <Flame className="w-4 h-4" />
            if (lowerName.includes('curry') || lowerName.includes('bowl')) return <Utensils className="w-4 h-4" />
            if (lowerName.includes('seafood') || lowerName.includes('fish')) return <Utensils className="w-4 h-4" />
            if (lowerName.includes('veg')) return <Leaf className="w-4 h-4" />
            return <Utensils className="w-4 h-4" />
          }
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 snap-start w-[88px] h-[88px] border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-[2px] focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                selectedCategory === cat.id 
                  ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white hover:border-[#0A0A0A]' 
                  : 'bg-white border-[#E2DDD5] text-[#0A0A0A] hover:border-[#0A0A0A]'
              }`}
            >
              <span className={selectedCategory === cat.id ? 'text-white opacity-100' : 'text-[#0A0A0A] opacity-80'}>
                {getCategoryIcon(cat.name)}
              </span>
              <span className={`text-[11px] font-bold tracking-wide uppercase leading-none ${selectedCategory === cat.id ? 'text-white' : 'text-[#0A0A0A]'}`}>{cat.name}</span>
              <span className={`text-[10px] ${selectedCategory === cat.id ? 'text-white opacity-100' : 'text-[#0A0A0A] opacity-60'}`}>
                {getCategoryItemCount(cat.id)}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Smart Filter Bar - Premium Minimal Enhanced (Single Line) */}
      <section className="px-6 pb-5 border-b border-[#E2DDD5]">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Dietary Filters */}
          {restaurant?.filter_config?.dietary !== false && (
            <>
              {[
                { key: 'dairy', label: 'Dairy-Free', Icon: Milk },
                { key: 'gluten', label: 'Gluten-Free', Icon: Wheat },
                { key: 'nuts', label: 'Nut-Free', Icon: Nut }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => {
                    const newFilters = new Set(dietaryFilters)
                    newFilters.has(filter.key) ? newFilters.delete(filter.key) : newFilters.add(filter.key)
                    setDietaryFilters(newFilters)
                  }}
                  className={`flex-shrink-0 h-9 px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 gap-2 border flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                    dietaryFilters.has(filter.key)
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] border-t-2 border-t-[#C47A3D] shadow-[0_2px_8px_rgba(0,0,0,0.12)]' 
                      : 'bg-white border-[#E2DDD5] text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-[#F5F1EB]/50 hover:-translate-y-0.5'
                  }`}
                  style={{ borderRadius: 0 }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={dietaryFilters.has(filter.key)}
                >
                  <filter.Icon className="w-3.5 h-3.5" />
                  <span>{filter.label}</span>
                </button>
              ))}
            </>
          )}

          {/* Sort Controls */}
          {restaurant?.filter_config?.sort !== false && (
            <>
              <button
                onClick={() => setSortBy('name')}
                className={`flex-shrink-0 h-9 px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 gap-2 border flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                  sortBy === 'name' 
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] border-t-2 border-t-[#C47A3D] shadow-[0_2px_8px_rgba(0,0,0,0.12)]' 
                    : 'bg-white border-[#E2DDD5] text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-[#F5F1EB]/50 hover:-translate-y-0.5'
                }`}
                style={{ borderRadius: 0 }}
                title="Sort alphabetically"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>A-Z</span>
              </button>

              <button
                onClick={() => setSortBy('price')}
                className={`flex-shrink-0 h-9 px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 gap-2 border flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                  sortBy === 'price' 
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] border-t-2 border-t-[#C47A3D] shadow-[0_2px_8px_rgba(0,0,0,0.12)]' 
                    : 'bg-white border-[#E2DDD5] text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-[#F5F1EB]/50 hover:-translate-y-0.5'
                }`}
                style={{ borderRadius: 0 }}
                title="Sort by price"
              >
                <ArrowUpNarrowWide className="w-3.5 h-3.5" />
                <span>$</span>
              </button>

              <button
                onClick={() => setSortBy('prepTime')}
                className={`flex-shrink-0 h-9 px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 gap-2 border flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                  sortBy === 'prepTime' 
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] border-t-2 border-t-[#C47A3D] shadow-[0_2px_8px_rgba(0,0,0,0.12)]' 
                    : 'bg-white border-[#E2DDD5] text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-[#F5F1EB]/50 hover:-translate-y-0.5'
                }`}
                style={{ borderRadius: 0 }}
                title="Sort by preparation time"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Fast</span>
              </button>
            </>
          )}

        </div>
      </section>
      
      {/* Menu Items */}
      <main className="px-6 py-6" role="main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Menu items">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAdd={(customizations) => handleAddToCart(item, customizations)}
              onViewDetails={() => setSelectedItem(item)}
              quantity={items.find(i => i.item.id === item.id)?.quantity || 0}
              onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
              isAdding={addingToCart === item.id}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12" role="status" aria-live="polite">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </main>
      </div>
      
      {/* Credit Card - Immediately after main card, matching main card width */}
      <div className="max-w-[960px] mx-auto mt-2">
        <div 
          className="w-full inline-block px-4 py-2 bg-white border border-[#E2DDD5] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          style={{ borderRadius: 0 }}
        >
          <p className="text-[9px] font-medium tracking-[0.15em] uppercase text-[#8A857B] text-center">
            Designed & Developed by <span className="text-[#0A0A0A] font-semibold">sqadri</span>
          </p>
        </div>
      </div>
      
      {/* Full Width Restaurant Name Logo - Vertically centered in remaining space */}
      <footer className="w-full py-0.5 mt-2 flex-1 flex items-center justify-center">
        <div className="w-full text-center px-4">
          <h2 
            className="font-bold text-[#0A0A0A] leading-none tracking-tight"
            style={{ 
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.5rem, 5vw, 8rem)',
              fontStyle: 'italic',
              fontWeight: 600
            }}
          >
            {restaurant?.name || 'Restaurant'}
          </h2>
        </div>
      </footer>
      
      {/* Floating Help Button - Left Side */}
      <button
        onClick={handleHelpRequest}
        className="fixed bottom-6 left-6 z-50 bg-white border border-[#E2DDD5] shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-[#0A0A0A] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98] min-h-[48px] px-4 flex items-center gap-2"
        aria-label="Request assistance from staff"
        role="button"
        style={{ borderRadius: 0 }}
        disabled={helpRequested}
      >
        <Bell className="w-4 h-4" />
        <span className="text-xs font-medium tracking-wide">{helpRequested ? 'Help Requested!' : 'Help'}</span>
      </button>
      
      {/* Floating Cart Button */}
      {getItemCount() > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white shadow-[0_2px_8px_rgba(196,122,61,0.2)] hover:bg-[#1A1A1A] transition-all active:scale-[0.98] min-h-[56px] px-6 flex items-center gap-3"
          aria-label={`Shopping cart with ${getItemCount()} items`}
          role="button"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C47A3D] text-xs flex items-center justify-center font-bold">
              {getItemCount()}
            </span>
          </div>
          <div className="text-left">
            <p className="text-xs opacity-80">View Cart</p>
            <p className="font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(getTotal())}</p>
          </div>
        </button>
      )}
      
      {/* Cart Drawer - Matching Menu Theme */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCart(false)}>
          <div 
            className="absolute inset-x-0 bottom-0 bg-white max-h-[92vh] overflow-hidden animate-slide-up shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            style={{ borderRadius: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setShowCart(false)}>
              <div className="w-12 h-1 bg-[#E2DDD5]" />
            </div>

            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Header - Sharp & Clean */}
              <div className="px-6 pb-4 border-b border-[#E2DDD5]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-[#0A0A0A] tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your Order</h2>
                    <p className="text-xs text-[#8A857B] mt-1">{getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setShowCart(false)} 
                    className="min-h-[44px] min-w-[44px] hover:bg-[#F5F1EB] transition-all active:scale-95"
                    style={{ borderRadius: 0 }}
                  >
                    <X className="w-5 h-5 text-[#0A0A0A]" />
                  </Button>
                </div>
                
                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all items from cart?')) {
                        clearCart()
                      }
                    }}
                    className="text-xs text-[#8A857B] hover:text-[#0A0A0A] transition-colors font-medium uppercase tracking-wide"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
              
              {/* Cart Items - Horizontal Cards */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(92vh - 320px)' }}>
                {items.length === 0 ? (
                  // Empty State
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-[#F5F1EB] border border-[#E2DDD5] flex items-center justify-center mb-4" style={{ borderRadius: 0 }}>
                      <ShoppingCart className="w-10 h-10 text-[#8A857B] opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your cart is empty</h3>
                    <p className="text-sm text-[#8A857B] max-w-xs">Add some delicious items from the menu to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((cartItem, index) => (
                      <div 
                        key={cartItem.item.id} 
                        className="group relative bg-white border border-[#E2DDD5] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#0A0A0A] animate-in slide-in-from-bottom-2 fade-in"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          borderRadius: 0
                        }}
                      >
                        {/* Horizontal Card Layout */}
                        <div className="flex">
                          {/* Item Image - Left Side */}
                          <div className="relative w-28 h-28 flex-shrink-0 bg-[#F0EDE8]" style={{ borderRadius: 0 }}>
                            {cartItem.item.image_url ? (
                              <img 
                                src={cartItem.item.image_url} 
                                alt={cartItem.item.name}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-[#8A857B] opacity-50" />
                              </div>
                            )}
                          </div>
                          
                          {/* Item Details - Right Side */}
                          <div className="flex-1 flex flex-col p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-base text-[#0A0A0A] leading-tight flex-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cartItem.item.name}</h4>
                              <button
                                onClick={() => removeItem(cartItem.item.id)}
                                className="ml-2 p-1.5 text-[#8A857B] hover:text-[#0A0A0A] hover:bg-[#F5F1EB] transition-all flex-shrink-0"
                                style={{ borderRadius: 0 }}
                                aria-label="Remove item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <p className="text-sm text-[#8A857B] mb-3">{formatCurrency(cartItem.item.price)} each</p>
                            
                            {/* Quantity Controls - Sharp */}
                            <div className="flex items-center gap-3 mt-auto">
                              <div className="flex items-center bg-[#F5F1EB]/50 border border-[#E2DDD5]">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    if (cartItem.quantity === 1) {
                                      removeItem(cartItem.item.id)
                                    } else {
                                      updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                                    }
                                  }}
                                  className="min-h-[36px] min-w-[36px] h-9 w-9 p-0 border-[#E2DDD5] hover:border-[#0A0A0A] transition-all active:scale-95"
                                  style={{ borderRadius: 0 }}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-bold text-base text-[#0A0A0A]">{cartItem.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                                  className="min-h-[36px] min-w-[36px] h-9 w-9 p-0 border-[#E2DDD5] hover:border-[#0A0A0A] transition-all active:scale-95"
                                  style={{ borderRadius: 0 }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Item Total */}
                              <div className="ml-auto text-right">
                                <p className="text-xs text-[#8A857B] uppercase tracking-wide mb-0.5">Subtotal</p>
                                <p className="font-bold text-lg text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(cartItem.item.price * cartItem.quantity)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Suggested Add-ons Section */}
                        {cartItemSuggestions[cartItem.item.id] && cartItemSuggestions[cartItem.item.id].length > 0 && (
                          <div className="border-t border-[#E2DDD5] bg-[#FAFAF8] px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ChefHat className="w-3.5 h-3.5 text-[#C47A3D]" />
                                <span className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wide">Suggested Add-ons</span>
                              </div>
                              <button
                                onClick={() => setSelectedCategory('add-ons')}
                                className="text-[10px] text-[#8A857B] hover:text-[#0A0A0A] transition-colors uppercase tracking-wide"
                              >
                                More →
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {cartItemSuggestions[cartItem.item.id].slice(0, 3).map(addon => (
                                <div 
                                  key={addon.id}
                                  className="bg-white border border-[#E2DDD5] hover:border-[#0A0A0A] transition-all cursor-pointer group flex flex-col"
                                  style={{ borderRadius: 0 }}
                                  onClick={() => handleAddToCart(addon)}
                                >
                                  {/* Image */}
                                  <div className="w-full h-16 bg-[#F0EDE8] relative overflow-hidden" style={{ borderRadius: 0 }}>
                                    {addon.image_url ? (
                                      <img 
                                        src={addon.image_url} 
                                        alt={addon.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ChefHat className="w-6 h-6 text-[#C47A3D] opacity-50" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Name and Price */}
                                  <div className="p-2 flex-1 flex flex-col">
                                    <p className="text-[10px] font-medium text-[#0A0A0A] truncate leading-tight mb-1">{addon.name}</p>
                                    <p className="text-[9px] text-[#8A857B] font-semibold">{formatCurrency(addon.price)}</p>
                                  </div>
                                  
                                  {/* Add Button */}
                                  <button
                                    className="w-full py-1.5 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-wide hover:bg-[#1A1A1A] transition-all active:scale-95"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddToCart(addon)
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Special Instructions */}
                {items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E2DDD5]">
                    <label className="text-xs font-bold text-[#0A0A0A] mb-2 flex items-center gap-2 uppercase tracking-wide">
                      <Utensils className="w-4 h-4" />
                      Special Instructions
                    </label>
                    <Textarea
                      placeholder="Any allergies or special requests..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="resize-none border border-[#E2DDD5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-all placeholder:text-[#8A857B]/60"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                )}

                {/* Upsell Suggestions - Horizontal Cards */}
                {items.length > 0 && items.length < 5 && (
                  <div className="mt-4 pt-4 border-t border-[#E2DDD5]">
                    <div className="flex items-center gap-2 mb-3">
                      <ChefHat className="w-4 h-4 text-[#0A0A0A]" />
                      <div>
                        <h3 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Complete your meal</h3>
                        <p className="text-[10px] text-[#8A857B]">Popular additions</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {menuItems
                        .filter(item => !items.some(ci => ci.item.id === item.id) && item.is_available)
                        .slice(0, 3)
                        .map(suggestion => (
                          <div 
                            key={suggestion.id} 
                            className="flex items-center gap-3 p-2 bg-white border border-[#E2DDD5] hover:border-[#0A0A0A] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all cursor-pointer group active:scale-[0.98]"
                            style={{ borderRadius: 0 }}
                            onClick={() => addItem(suggestion)}
                          >
                            {suggestion.image_url && (
                              <div className="w-16 h-16 overflow-hidden bg-[#F0EDE8] flex-shrink-0" style={{ borderRadius: 0 }}>
                                <img src={suggestion.image_url} alt={suggestion.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-[#0A0A0A] truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{suggestion.name}</p>
                              <p className="text-xs text-[#8A857B] mt-0.5">{formatCurrency(suggestion.price)}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                addItem(suggestion)
                              }}
                              className="min-h-[36px] min-w-[36px] h-9 w-9 p-0 border-[#E2DDD5] hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all active:scale-95"
                              style={{ borderRadius: 0 }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer - Sharp & Clean */}
              <div className="pt-4 px-6 pb-6 border-t border-[#E2DDD5] space-y-3 mt-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5A554B] font-medium">Subtotal</span>
                    <span className="font-semibold text-[#0A0A0A]">{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5A554B] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Estimated Prep Time
                    </span>
                    <span className="font-semibold text-[#0A0A0A]">{maxPrepTime} min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E2DDD5]">
                  <span className="text-base font-bold text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Total</span>
                  <span className="text-2xl font-bold text-[#0A0A0A] tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(getTotal())}</span>
                </div>
                <Button 
                  size="lg" 
                  className="w-full min-h-[48px] text-sm font-bold uppercase tracking-wide bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white transition-all active:scale-[0.98] shadow-[0_2px_12px_rgba(0,0,0,0.08)]" 
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  style={{ borderRadius: 0 }}
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-bottom shadow-2xl border border-[#E2DDD5]"
            style={{ borderRadius: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Image */}
            <div className="relative aspect-video bg-[#F0EDE8]">
              {selectedItem.image_url ? (
                <img 
                  src={selectedItem.image_url} 
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/50" />
                </div>
              )}
              <Button 
                size="icon" 
                variant="secondary"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg min-h-[44px] min-w-[44px] hover:bg-white border border-[#E2DDD5]"
                onClick={() => setSelectedItem(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {selectedItem.allergens?.toLowerCase().includes('spicy') && (
                  <span className="px-3 py-1.5 bg-white border border-[#E2DDD5] text-[10px] font-bold tracking-widest uppercase text-[#0A0A0A] shadow-md">
                    Spicy
                  </span>
                )}
                {selectedItem.allergens?.toLowerCase().includes('vegan') && (
                  <span className="px-3 py-1.5 bg-white border border-[#E2DDD5] text-[10px] font-bold tracking-widest uppercase text-[#0A0A0A] shadow-md">
                    Vegan
                  </span>
                )}
                {selectedItem.allergens?.toLowerCase().includes('gluten-free') && (
                  <span className="px-3 py-1.5 bg-white border border-[#E2DDD5] text-[10px] font-bold tracking-widest uppercase text-[#0A0A0A] shadow-md">
                    Gluten-Free
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2DDD5]">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{selectedItem.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-3 py-1.5 border border-[#E2DDD5] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedItem.prep_time} min prep
                    </span>
                    {!selectedItem.is_available && (
                      <span className="text-xs px-3 py-1.5 bg-destructive text-white">Out of Stock</span>
                    )}
                  </div>
                </div>
                <span className="text-3xl font-bold text-[#C47A3D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(selectedItem.price)}</span>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-[#8A857B]">Description</h3>
                <p className="text-base leading-relaxed text-[#5A554B]">{selectedItem.description}</p>
              </div>

              {/* Allergen Info */}
              {selectedItem.allergens && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-[#8A857B]">Allergens & Dietary</h3>
                  <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{selectedItem.allergens}</p>
                  </div>
                </div>
              )}

              {/* Customization Options */}
              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-[#8A857B]">Customization</h3>
                <ItemCustomization 
                  item={selectedItem} 
                  onAddToOrder={(customizations) => {
                    handleAddToCart(selectedItem, customizations)
                    setSelectedItem(null)
                  }}
                />
              </div>

              {/* Add to Cart Button */}
              <div className="pt-4 border-t border-[#E2DDD5]">
                <Button 
                  size="lg" 
                  className="w-full min-h-[56px] text-lg font-semibold bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white"
                  onClick={() => {
                    handleAddToCart(selectedItem)
                    setSelectedItem(null)
                  }}
                  disabled={!selectedItem.is_available}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Order - {formatCurrency(selectedItem.price)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ 
  item, 
  onAdd, 
  onViewDetails,
  quantity,
  onUpdateQuantity,
  isAdding
}: { 
  item: MenuItem
  onAdd: (customizations?: any) => void
  onViewDetails: () => void
  quantity: number
  onUpdateQuantity: (qty: number) => void
  isAdding?: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Reset states when image URL changes
    setImageLoaded(false)
    setImageError(false)
    
    if (!item.image_url) {
      setImageError(true)
      return
    }

    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      setImageError(false)
    }
    img.onerror = () => {
      setImageLoaded(false)
      setImageError(true)
    }
    img.src = item.image_url
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [item.image_url])

  return (
    <Card className={`overflow-hidden border border-[#E2DDD5] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#0A0A0A] ${!item.is_available ? 'opacity-60' : ''}`} style={{ borderRadius: 0 }}>
      <div className="relative">
        {/* Image with 4:3 aspect ratio */}
        {!imageLoaded && !imageError && (
          <div className="w-full aspect-[4/3] bg-[#F0EDE8] flex items-center justify-center animate-pulse">
            <ImageIcon className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Error state */}
        {imageError && (
          <div className="w-full aspect-[4/3] bg-[#F0EDE8] flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No image available</p>
            </div>
          </div>
        )}
        
        {/* Actual image */}
        {item.image_url && (
          <img 
            src={item.image_url} 
            alt={item.name}
            className={`w-full aspect-[4/3] object-cover transition-transform duration-[400ms] cursor-pointer ${imageLoaded ? 'opacity-100' : 'hidden'} hover:scale-[1.02]`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onClick={onViewDetails}
          />
        )}
        
        {/* Badge - Sharp, top-left */}
        {item.allergens?.toLowerCase().includes('spicy') && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-white border border-[#E2DDD5] text-[10px] font-bold tracking-widest uppercase text-[#0A0A0A] z-[2]">
            Spicy
          </span>
        )}
        {item.allergens?.toLowerCase().includes('vegan') && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-white border border-[#E2DDD5] text-[10px] font-bold tracking-widest uppercase text-[#0A0A0A] z-[2]">
            Vegan
          </span>
        )}
        
        {/* Unavailable overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-base px-4 py-2 font-semibold">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        {/* Item name and price */}
        <div className="flex justify-between items-baseline gap-3 mb-3 pb-3 border-b border-[#E2DDD5]">
          <h3 className="font-semibold text-[18px] tracking-tight leading-tight flex-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.name}</h3>
          <span className="font-semibold text-[16px] text-[#0A0A0A] flex-shrink-0" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(item.price)}</span>
        </div>
        
        {/* Description */}
        <p className="text-[13px] text-[#5A554B] leading-relaxed mb-4 line-clamp-2 flex-1">{item.description}</p>
        
        {/* Meta info */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#8A857B] mb-5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.prep_time} min
          </span>
          {item.allergens?.toLowerCase().includes('spicy') && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Spicy
            </span>
          )}
          <div className="flex gap-2 ml-auto text-[12px] opacity-70">
            {item.allergens?.toLowerCase().includes('gluten-free') && <WheatOff className="w-3 h-3" />}
            {item.allergens?.toLowerCase().includes('vegan') && <Leaf className="w-3 h-3" />}
          </div>
        </div>
        
        {/* Actions: Sharp Buttons */}
        <div className="flex gap-3 mt-auto">
          {quantity === 0 ? (
            <Button 
              size="sm" 
              variant={item.is_available ? "default" : "secondary"}
              onClick={() => onAdd()}
              disabled={!item.is_available}
              className={`flex-1 h-[40px] text-[12px] font-bold tracking-wide uppercase transition-all active:scale-[0.98] ${
                item.is_available 
                  ? 'bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white' 
                  : ''
              } ${isAdding ? 'bg-[#2D6A4F]' : ''}`}
              style={{ borderRadius: 0 }}
            >
              <span className={`transition-opacity ${isAdding ? 'opacity-0' : 'opacity-100'}`}>
                <Plus className="w-4 h-4 mr-2 inline" />
                Add
              </span>
              {isAdding && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />
                </span>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-[#F5F1EB]/50 border border-[#E2DDD5] p-1 w-full">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onUpdateQuantity(quantity - 1)}
                className="min-h-[36px] min-w-[36px] p-0 h-9 w-9 border-[#E2DDD5] hover:border-[#0A0A0A]"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-bold text-base">{quantity}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="min-h-[36px] min-w-[36px] p-0 h-9 w-9 border-[#E2DDD5] hover:border-[#0A0A0A]"
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusStep({ status, current, label, icon }: { status: string; current: string; label: string; icon: React.ReactNode }) {
  const isActive = status === current
  const isCompleted = ['new', 'preparing', 'ready', 'delivered'].indexOf(status) <= ['new', 'preparing', 'ready', 'delivered'].indexOf(current)
  
  return (
    <div className={`flex items-center gap-3 p-3 border transition-all ${
      isActive ? 'bg-[#0A0A0A]/10 border-[#0A0A0A]/30' : isCompleted ? 'bg-[#2D6A4F]/10 border-[#2D6A4F]/30' : 'bg-[#F5F1EB]/30 border-[#E2DDD5]'
    }`}>
      <div className={`w-10 h-10 flex items-center justify-center ${
        isActive ? 'bg-[#0A0A0A] text-white' : isCompleted ? 'bg-[#2D6A4F] text-white' : 'bg-[#F5F1EB]'
      }`}>
        {icon}
      </div>
      <span className={`font-medium ${
        isActive ? 'text-[#0A0A0A]' : isCompleted ? 'text-[#2D6A4F]' : 'text-[#8A857B]'
      }`}>
        {label}
      </span>
      {isActive && <span className="ml-auto text-xs text-[#0A0A0A] animate-pulse">Current</span>}
    </div>
  )
}
