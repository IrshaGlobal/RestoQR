import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Settings, Search, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDialog from './ConfirmDialog'
import { supabase, GlobalCustomization } from '@/lib/supabase'
import { toast } from 'sonner'

interface GlobalCustomizationManagerProps {
  restaurantId: string
}

export default function GlobalCustomizationManager({ restaurantId }: GlobalCustomizationManagerProps) {
  const [customizations, setCustomizations] = useState<GlobalCustomization[]>([])
  const [filteredCustomizations, setFilteredCustomizations] = useState<GlobalCustomization[]>([])
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'addon' | 'removal' | 'substitution'>('all')
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCustomization, setEditingCustomization] = useState<GlobalCustomization | null>(null)
  const [deleteCustomizationId, setDeleteCustomizationId] = useState<string | null>(null)
  
  // Form state
  const [formState, setFormState] = useState({
    name: '',
    type: 'addon' as 'addon' | 'removal' | 'substitution',
    default_price: 0,
    max_selections: 1,
    is_active: true
  })

  // Fetch customizations on mount
  useEffect(() => {
    fetchCustomizations()
  }, [restaurantId])

  // Filter customizations when search or filter changes
  useEffect(() => {
    let filtered = customizations

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query)
      )
    }

    setFilteredCustomizations(filtered)
  }, [customizations, searchQuery, filterType])

  const fetchCustomizations = async () => {
    try {
      setLoading(true)
      
      // Fetch addons
      const { data: customizationsData, error: customError } = await supabase
        .from('global_customizations')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order')

      if (customError) throw customError

      if (customizationsData) {
        setCustomizations(customizationsData)
        
        // Fetch usage counts for each customization
        const counts: Record<string, number> = {}
        for (const cust of customizationsData) {
          const { count } = await supabase
            .from('menu_item_customizations')
            .select('*', { count: 'exact', head: true })
            .eq('customization_id', cust.id)
            .eq('is_enabled', true)
          
          counts[cust.id] = count || 0
        }
        setUsageCounts(counts)
      }
    } catch (error) {
      console.error('Failed to fetch extra-addons:', error)
      toast.error('Failed to load extra-addons')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormState({
      name: '',
      type: 'addon',
      default_price: 0,
      max_selections: 1,
      is_active: true
    })
    setEditingCustomization(null)
  }

  const openEditDialog = (customization: GlobalCustomization) => {
    setEditingCustomization(customization)
    setFormState({
      name: customization.name,
      type: customization.type,
      default_price: customization.default_price,
      max_selections: customization.max_selections || 1,
      is_active: customization.is_active ?? true
    })
    setShowAddDialog(true)
  }

  const saveCustomization = async () => {
    if (!formState.name.trim()) {
      toast.error('Extra-addon name is required')
      return
    }

    try {
      // First, find or create the "Add-ons" category
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', 'add-ons')
        .limit(1)
      
      let addonsCategoryId = categories?.[0]?.id
      
      // If Add-ons category doesn't exist, create it
      if (!addonsCategoryId) {
        const { data: newCategory, error: catError } = await supabase
          .from('categories')
          .insert({
            restaurant_id: restaurantId,
            name: 'Add-ons',
            sort_order: 999
          })
          .select()
        
        if (catError) throw catError
        addonsCategoryId = newCategory?.[0]?.id
      }

      if (editingCustomization) {
        // Update existing customization in library
        const { error: custError } = await supabase
          .from('global_customizations')
          .update({
            name: formState.name.trim(),
            type: formState.type,
            default_price: formState.default_price,
            max_selections: formState.max_selections,
            is_active: formState.is_active
          })
          .eq('id', editingCustomization.id)

        if (custError) throw custError

        // Find and update corresponding menu item by name match
        const { data: existingItems } = await supabase
          .from('menu_items')
          .select('id')
          .eq('category_id', addonsCategoryId)
          .ilike('name', `%${formState.name.trim()}%`)
          .limit(1)

        if (existingItems && existingItems.length > 0) {
          const { error: itemError } = await supabase
            .from('menu_items')
            .update({
              name: `Extra ${formState.name.trim()}`,
              price: formState.default_price,
              is_available: formState.is_active,
              category_id: addonsCategoryId
            })
            .eq('id', existingItems[0].id)

          if (itemError) {
            console.error('Failed to update menu item:', itemError)
          }
        }

        toast.success('Extra-addon updated')
      } else {
        // Create new customization in library
        const maxSortOrder = Math.max(...customizations.map(c => c.sort_order || 0), 0)
        const { error: custError } = await supabase
          .from('global_customizations')
          .insert({
            restaurant_id: restaurantId,
            name: formState.name.trim(),
            type: formState.type,
            default_price: formState.default_price,
            max_selections: formState.max_selections,
            is_active: formState.is_active,
            sort_order: maxSortOrder + 1
          })
          .select()

        if (custError) throw custError

        // Create corresponding menu item in Add-ons category
        const { error: itemError } = await supabase
          .from('menu_items')
          .insert({
            restaurant_id: restaurantId,
            name: `Extra ${formState.name.trim()}`,
            description: `Add extra ${formState.name.trim().toLowerCase()} to your order`,
            price: formState.default_price,
            category_id: addonsCategoryId,
            is_available: formState.is_active,
            prep_time: 0
          })

        if (itemError) {
          console.error('Failed to create menu item:', itemError)
        }

        toast.success('Extra-addon added')
      }

      await fetchCustomizations()
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('Failed to save extra-addon:', error)
      toast.error('Failed to save extra-addon')
    }
  }

  const deleteCustomization = async () => {
    if (!deleteCustomizationId) return

    try {
      // Get the customization name before deleting
      const customizationToDelete = customizations.find(c => c.id === deleteCustomizationId)
      
      if (!customizationToDelete) {
        toast.error('Extra-addon not found')
        return
      }

      // Delete the customization from library
      const { error: custError } = await supabase
        .from('global_customizations')
        .delete()
        .eq('id', deleteCustomizationId)

      if (custError) throw custError

      // Find and delete corresponding menu item by name match
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', 'add-ons')
        .limit(1)
      
      const addonsCategoryId = categories?.[0]?.id
      
      if (addonsCategoryId) {
        const { data: itemsToDelete } = await supabase
          .from('menu_items')
          .select('id')
          .eq('category_id', addonsCategoryId)
          .ilike('name', `%${customizationToDelete.name}%`)
          .limit(1)

        if (itemsToDelete && itemsToDelete.length > 0) {
          const { error: itemError } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', itemsToDelete[0].id)

          if (itemError) {
            console.error('Failed to delete menu item:', itemError)
          }
        }
      }

      toast.success('Extra-addon deleted')
      await fetchCustomizations()
    } catch (error) {
      console.error('Failed to delete extra-addon:', error)
      toast.error('Failed to delete extra-addon')
    } finally {
      setDeleteCustomizationId(null)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Get the customization
      const customization = customizations.find(c => c.id === id)
      if (!customization) return

      // Update customization
      const { error: custError } = await supabase
        .from('global_customizations')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (custError) throw custError

      // Find and update corresponding menu item by name match
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', 'add-ons')
        .limit(1)
      
      const addonsCategoryId = categories?.[0]?.id
      
      if (addonsCategoryId) {
        const { data: itemsToUpdate } = await supabase
          .from('menu_items')
          .select('id')
          .eq('category_id', addonsCategoryId)
          .ilike('name', `%${customization.name}%`)
          .limit(1)

        if (itemsToUpdate && itemsToUpdate.length > 0) {
          const { error: itemError } = await supabase
            .from('menu_items')
            .update({ is_available: !currentStatus })
            .eq('id', itemsToUpdate[0].id)

          if (itemError) {
            console.error('Failed to update menu item availability:', itemError)
          }
        }
      }

      setCustomizations(prev =>
        prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c)
      )
      toast.success(`Extra-addon ${!currentStatus ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Failed to toggle status:', error)
      toast.error('Failed to update status')
    }
  }

  const moveCustomization = async (id: string, direction: 'up' | 'down') => {
    const index = customizations.findIndex(c => c.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= customizations.length) return

    const currentCust = customizations[index]
    const swapCust = customizations[newIndex]

    try {
      await Promise.all([
        supabase
          .from('global_customizations')
          .update({ sort_order: swapCust.sort_order })
          .eq('id', currentCust.id),
        supabase
          .from('global_customizations')
          .update({ sort_order: currentCust.sort_order })
          .eq('id', swapCust.id)
      ])

      await fetchCustomizations()
    } catch (error) {
      console.error('Failed to reorder:', error)
      toast.error('Failed to reorder extra-addons')
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
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading customizations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Extra-Addons Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reusable addon options for all menu items
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Extra-Addon
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Type Filter Tabs */}
            <div className="flex gap-2">
              {(['all', 'addon', 'removal', 'substitution'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type}
                  {type === 'all' && ` (${customizations.length})`}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search extra-addons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customizations List */}
      {filteredCustomizations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No extra-addons found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first extra-addon to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Extra-Addon
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredCustomizations.map((customization, index) => (
            <Card key={customization.id} className={!customization.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-lg">{customization.name}</h4>
                      <Badge variant={getTypeColor(customization.type)} className="text-xs capitalize">
                        {customization.type}
                      </Badge>
                      {!customization.is_active && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Price: ${customization.default_price.toFixed(2)}</span>
                      {customization.max_selections && customization.max_selections > 1 && (
                        <span>Max selections: {customization.max_selections}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Used by {usageCounts[customization.id] || 0} item(s)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveCustomization(customization.id, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveCustomization(customization.id, 'down')}
                      disabled={index === filteredCustomizations.length - 1}
                      className="h-8 w-8 p-0"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(customization.id, customization.is_active ?? true)}
                      className="h-8 w-8 p-0"
                      title={customization.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {customization.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(customization)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteCustomizationId(customization.id)}
                      className="h-8 w-8 p-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomization ? 'Edit Extra-Addon' : 'Add Extra-Addon'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cust-name">Name *</Label>
              <Input
                id="cust-name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g., Extra Raita, Extra Cheese"
              />
            </div>

            <div>
              <Label htmlFor="cust-type">Type *</Label>
              <select
                id="cust-type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value as any })}
              >
                <option value="addon">Addon (adds to item)</option>
                <option value="removal">Removal (removes ingredient)</option>
                <option value="substitution">Substitution (replaces ingredient)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="cust-price">Default Price ($)</Label>
              <Input
                id="cust-price"
                type="number"
                step="0.01"
                min="0"
                value={formState.default_price}
                onChange={(e) => setFormState({ ...formState, default_price: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Price modifier when customer selects this option
              </p>
            </div>

            {formState.type === 'addon' && (
              <div>
                <Label htmlFor="cust-max">Maximum Selections</Label>
                <Input
                  id="cust-max"
                  type="number"
                  min="1"
                  value={formState.max_selections}
                  onChange={(e) => setFormState({ ...formState, max_selections: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How many times customers can select this option (1 = single select)
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cust-active"
                checked={formState.is_active}
                onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="cust-active">Active (available for use)</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={saveCustomization} className="flex-1">
                {editingCustomization ? 'Update' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteCustomizationId}
        onOpenChange={(open) => !open && setDeleteCustomizationId(null)}
        title="Delete Extra-Addon"
        description={`Are you sure you want to delete "${customizations.find(c => c.id === deleteCustomizationId)?.name}"? This will remove it from all menu items that use it.`}
        onConfirm={deleteCustomization}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  )
}
