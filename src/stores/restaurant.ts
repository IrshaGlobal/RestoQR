import { create } from 'zustand'
import { Restaurant, Table, Category, MenuItem, Order, HelpRequest } from '@/lib/supabase'

interface RestaurantStore {
  restaurant: Restaurant | null
  tables: Table[]
  categories: Category[]
  menuItems: MenuItem[]
  orders: Order[]
  helpRequests: HelpRequest[]
  setRestaurant: (restaurant: Restaurant) => void
  setTables: (tables: Table[]) => void
  setCategories: (categories: Category[]) => void
  setMenuItems: (items: MenuItem[]) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  addHelpRequest: (request: HelpRequest) => void
  dismissHelpRequest: (requestId: string) => void
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurant: null,
  tables: [],
  categories: [],
  menuItems: [],
  orders: [],
  helpRequests: [],
  
  setRestaurant: (restaurant) => set({ restaurant }),
  setTables: (tables) => set({ tables }),
  setCategories: (categories) => set({ categories }),
  setMenuItems: (menuItems) => set({ menuItems }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, ...updates } : o)
  })),
  addHelpRequest: (request) => set((state) => ({ 
    helpRequests: [...state.helpRequests, request] 
  })),
  dismissHelpRequest: (requestId) => set((state) => ({
    helpRequests: state.helpRequests.filter(r => r.id !== requestId)
  })),
}))
