import { useState, useEffect } from 'react'
import { Plus, X, ArrowUp, ArrowDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase, MenuItem, GlobalCustomization, MenuItemCustomizationLink } from '@/lib/supabase'
import { toast } from 'sonner'

interface MenuItemCustomizationSelectorProps {
  menuItem: MenuItem
  restaurantId: string
  onSave: (selectedIds: string[]) => void
}

interface SelectedCustomization extends MenuItemCustomizationLink {
  customization: GlobalCustomization
}

export default function MenuItemCustomizationSelector({
  menuItem,
  restaurantId,
  onSave
}: MenuItemCustomizationSelectorProps) {
  const [availableCustomizations, setAvailableCustomizations] = useState<GlobalCustomization[]>([])
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'addon' | 'removal' | 'substitution'>('all')

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [menuItem.id, restaurantId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all active global customizations for this restaurant
      const { data: allCustomizations, error: custError } = await supabase
        .from('global_customizations')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('sort_order')

      if (custError) throw custError

      // Fetch currently selected customizations for this menu item
      const { data: links, error: linkError } = await supabase
        .from('menu_item_customizations')
        .select(`
          *,
          global_customizations (*)
        `)
        .eq('menu_item_id', menuItem.id)
        .eq('is_enabled', true)
        .order('sort_order')

      if (linkError) throw linkError

      if (allCustomizations) {
        setAvailableCustomizations(allCustomizations)
      }

      if (links) {
        const selected = links
          .filter(link => link.global_customizations)
          .map(link => ({
            ...link,
            customization: link.global_customizations as GlobalCustomization
          })) as SelectedCustomization[]
        setSelectedCustomizations(selected)
      }
    } catch (error) {
      console.error('Failed to fetch customization data:', error)
      toast.error('Failed to load customization options')
    } finally {
      setLoading(false)
    }
  }

  // Filter available customizations
  const filteredAvailable = availableCustomizations.filter(cust => {
    // Exclude already selected
    if (selectedCustomizations.some(s => s.customization_id === cust.id)) {
      return false
    }

    // Apply type filter
    if (filterType !== 'all' && cust.type !== filterType) {
      return false
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return cust.name.toLowerCase().includes(query)
    }

    return true
  })

  const toggleSelection = (customization: GlobalCustomization) => {
    const isSelected = selectedCustomizations.some(s => s.customization_id === customization.id)

    if (isSelected) {
      // Remove from selection
      setSelectedCustomizations(prev => prev.filter(s => s.customization_id !== customization.id))
    } else {
      // Add to selection
      const newLink: SelectedCustomization = {
        id: crypto.randomUUID(),
        menu_item_id: menuItem.id,
        customization_id: customization.id,
        price_override: null,
        is_enabled: true,
        sort_order: selectedCustomizations.length,
        customization
      }
      setSelectedCustomizations(prev => [...prev, newLink])
    }
  }

  const updatePriceOverride = (customizationId: string, price: number | null) => {
    setSelectedCustomizations(prev =>
      prev.map(s =>
        s.customization_id === customizationId
          ? { ...s, price_override: price }
          : s
      )
    )
  }

  const moveCustomization = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === selectedCustomizations.length - 1) return

    const newSelected = [...selectedCustomizations]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSelected[index], newSelected[newIndex]] = [newSelected[newIndex], newSelected[index]]

    // Update sort_order
    newSelected.forEach((s, idx) => {
      s.sort_order = idx
    })

    setSelectedCustomizations(newSelected)
  }

  const handleSave = async () => {
    try {
      const selectedIds = selectedCustomizations.map(s => s.customization_id)
      await onSave(selectedIds)
      toast.success('Extra-addon suggestions saved successfully')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save extra-addon suggestions')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'addon': return 'default'
      case 'removal': return 'destructive'
      case 'substitution': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading customization options...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">Extra-Addon Suggestions</h3>
        <p className="text-sm text-muted-foreground">
          Select extra-addons from the library to suggest with this menu item
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left Column: Available Customizations */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Available Extra-Addons
            </h4>

            {/* Filters */}
            <div className="space-y-2 mb-3">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-1 flex-wrap">
                {(['all', 'addon', 'removal', 'substitution'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="h-7 text-xs capitalize px-2"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available extra-addons
                </p>
              ) : (
                filteredAvailable.map((cust) => (
                  <div
                    key={cust.id}
                    className="flex items-start gap-2 p-2 rounded border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => toggleSelection(cust)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleSelection(cust)}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-sm">{cust.name}</span>
                        <Badge variant={getTypeColor(cust.type)} className="text-xs">
                          {cust.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${cust.default_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Selected Customizations */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Selected Extra-Addons
              </span>
              <Badge variant="outline">{selectedCustomizations.length}</Badge>
            </h4>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedCustomizations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No extra-addons selected</p>
                  <p className="text-xs mt-1">Select from available options on the left</p>
                </div>
              ) : (
                selectedCustomizations.map((selected, index) => (
                  <div
                    key={selected.customization_id}
                    className="p-3 rounded border border-border bg-card space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-medium text-sm">{selected.customization.name}</span>
                          <Badge variant={getTypeColor(selected.customization.type)} className="text-xs">
                            {selected.customization.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Base price: ${selected.customization.default_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCustomization(index, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCustomization(index, 'down')}
                          disabled={index === selectedCustomizations.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSelection(selected.customization)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Price Override */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={selected.customization.default_price.toFixed(2)}
                        value={selected.price_override ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          updatePriceOverride(
                            selected.customization_id,
                            value === '' ? null : parseFloat(value)
                          )
                        }}
                        className="h-7 text-sm"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        (override price)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={loading}>
          Save Customizations
        </Button>
      </div>
    </div>
  )
}

// Helper component for checkbox icon
function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
