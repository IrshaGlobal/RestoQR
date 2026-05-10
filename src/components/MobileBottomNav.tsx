import { useState } from 'react'
import { 
  LayoutDashboard, ShoppingCart, UtensilsCrossed, BarChart3, MoreHorizontal,
  LayoutGrid, Users, Settings, SlidersHorizontal, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface MobileBottomNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
  newOrdersCount?: number
}

export default function MobileBottomNav({ 
  activeSection, 
  onSectionChange,
  newOrdersCount = 0
}: MobileBottomNavProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Primary tabs (max 5 for optimal mobile UX)
  const primaryTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'menu-items', label: 'Menu', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'tables', label: 'Tables', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ]

  // Secondary tabs (shown in "More" menu)
  const secondaryTabs: TabItem[] = [
    { id: 'categories', label: 'Categories', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'customizations', label: 'Customizations', icon: <SlidersHorizontal className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ]

  // Map submenu items to their parent for active state detection
  const getParentSection = (section: string): string => {
    if (section === 'categories' || section === 'menu-items') return 'menu-items'
    return section
  }

  const handleTabClick = (tabId: string) => {
    onSectionChange(tabId)
    setShowMoreMenu(false)
  }

  const isActive = (tabId: string) => {
    const parent = getParentSection(activeSection)
    return parent === tabId || activeSection === tabId
  }

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-premium border-t border-white/30 lg:hidden safe-area-bottom theme-transition shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-around px-2 py-2">
          {primaryTabs.map((tab) => {
            const active = isActive(tab.id)
            const showBadge = tab.id === 'orders' && newOrdersCount > 0
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-2 py-1 transition-all duration-200 active:scale-95 ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                      {newOrdersCount > 9 ? '9+' : newOrdersCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-full" />
                )}
              </button>
            )
          })}

          {/* More Menu Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-2 py-1 transition-all duration-200 active:scale-95 ${
              secondaryTabs.some(tab => isActive(tab.id)) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* More Menu Card - Slides up from bottom */}
          <Card className="fixed bottom-0 left-0 right-0 z-50 lg:hidden animate-slide-up theme-transition glass-premium rounded-t-lg">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 theme-transition">
                <h3 className="text-sm font-bold text-foreground">More Options</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoreMenu(false)}
                  className="h-8 w-8 p-0 hover:bg-primary/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {secondaryTabs.map((tab) => {
                  const active = isActive(tab.id)
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 theme-transition rounded-lg mx-2 ${
                        active ? 'bg-gradient-to-r from-primary/15 to-accent/15' : 'hover:bg-primary/10'
                      }`}
                    >
                      <span className={active ? 'text-primary' : 'text-muted-foreground'}>
                        {tab.icon}
                      </span>
                      <span className={`text-sm font-medium ${active ? 'text-primary font-semibold' : 'text-foreground'}`}>
                        {tab.label}
                      </span>
                      {active && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-gradient-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
