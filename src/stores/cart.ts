import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MenuItem, CustomizationState } from '@/lib/supabase'

export interface CartItem {
  item: MenuItem
  quantity: number
  customizations?: CustomizationState
}

export interface CustomerDetails {
  name?: string
  phone?: string
  email?: string
  address?: string
}

interface CartStore {
  items: CartItem[]
  notes: string
  orderType: 'dine-in' | 'takeout' | 'delivery'
  tableId: string | null
  customerDetails: CustomerDetails
  deliveryFee: number
  onItemAdded?: (item: MenuItem) => void
  onItemRemoved?: (item: MenuItem) => void
  addItem: (item: MenuItem, customizations?: CustomizationState) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setNotes: (notes: string) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number  // Total without delivery fee
  getItemCount: () => number
  setCallbacks: (callbacks: { onItemAdded?: (item: MenuItem) => void; onItemRemoved?: (item: MenuItem) => void }) => void
  setOrderType: (orderType: 'dine-in' | 'takeout' | 'delivery') => void
  setTableId: (tableId: string | null) => void
  setCustomerDetails: (details: CustomerDetails) => void
  setDeliveryFee: (fee: number) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      notes: '',
      orderType: 'dine-in',
      tableId: null,
      customerDetails: {},
      deliveryFee: 0,
      onItemAdded: undefined,
      onItemRemoved: undefined,
      
      setCallbacks: (callbacks) => set(callbacks),
      
      addItem: (item, customizations) => set((state) => {
        const existing = state.items.find(i => i.item.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(customizations))
        if (existing) {
          return {
            items: state.items.map(i =>
              i.item.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          }
        }
        // Call the callback if set
        state.onItemAdded?.(item)
        return { items: [...state.items, { item, quantity: 1, customizations }] }
      }),
      
      removeItem: (itemId) => set((state) => {
        const item = state.items.find(i => i.item.id === itemId)
        if (item) {
          state.onItemRemoved?.(item.item)
        }
        return {
          items: state.items.filter(i => i.item.id !== itemId)
        }
      }),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.item.id === itemId ? { ...i, quantity: Math.max(0, quantity) } : i
        ).filter(i => i.quantity > 0)
      })),
      
      setNotes: (notes) => set({ notes }),
      
      clearCart: () => set({ items: [], notes: '' }),
      
      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, i) => {
          let itemTotal = i.item.price * i.quantity
          
          // Add customization prices
          if (i.customizations && i.item.customization_config) {
            i.item.customization_config.forEach(option => {
              if (i.customizations!.addons.includes(option.id)) {
                itemTotal += option.default_price * i.quantity
              }
              if (option.type === 'substitution' && Object.values(i.customizations!.substitutions).includes(option.id)) {
                itemTotal += option.default_price * i.quantity
              }
            })
          }
          
          return sum + itemTotal
        }, 0)
      },
      
      getTotal: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, i) => {
          let itemTotal = i.item.price * i.quantity
          
          // Add customization prices
          if (i.customizations && i.item.customization_config) {
            i.item.customization_config.forEach(option => {
              if (i.customizations!.addons.includes(option.id)) {
                itemTotal += option.default_price * i.quantity
              }
              if (option.type === 'substitution' && Object.values(i.customizations!.substitutions).includes(option.id)) {
                itemTotal += option.default_price * i.quantity
              }
            })
          }
          
          return sum + itemTotal
        }, 0)
        
        // Add delivery fee for delivery orders
        if (state.orderType === 'delivery') {
          return subtotal + state.deliveryFee
        }
        
        return subtotal
      },
      
      getItemCount: () => {
        const state = get()
        return state.items.reduce((count, i) => count + i.quantity, 0)
      },
      
      setOrderType: (orderType) => set({ orderType }),
      
      setTableId: (tableId) => set({ tableId }),
      
      setCustomerDetails: (customerDetails) => set({ customerDetails }),
      
      setDeliveryFee: (deliveryFee) => set({ deliveryFee }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
