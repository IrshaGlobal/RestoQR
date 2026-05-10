import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Restaurant, DeliverySettings } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, AlertTriangle, Loader2, Trash2, Truck } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

interface SettingsPageProps {
  restaurant: Restaurant | null
  restaurantId: string
  onUpdateRestaurant: (data: Partial<Restaurant>) => void
}

export default function SettingsPage({ 
  restaurant, 
  restaurantId, 
  onUpdateRestaurant 
}: SettingsPageProps) {
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    currency: restaurant?.currency || '$',
    filter_config: restaurant?.filter_config || { dietary: true, sort: true }
  })
  const [resetting, setResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [retentionDays, setRetentionDays] = useState(restaurant?.retention_config?.order_retention_days || 30)
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(restaurant?.retention_config?.auto_cleanup_enabled ?? true)
  const [cleaningUp, setCleaningUp] = useState(false)
  
  // Delivery settings state
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null)
  const [deliveryFee, setDeliveryFee] = useState<number>(5)
  const [minOrderAmount, setMinOrderAmount] = useState<number>(15)
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<number>(30)
  const [deliveryEnabled, setDeliveryEnabled] = useState<boolean>(true)
  const [savingDelivery, setSavingDelivery] = useState(false)
  
  // Load delivery settings on mount
  useEffect(() => {
    const loadDeliverySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_settings')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load delivery settings:', error)
          return
        }
        
        if (data) {
          setDeliverySettings(data)
          setDeliveryFee(Number(data.delivery_fee))
          setMinOrderAmount(Number(data.minimum_order_amount))
          setEstimatedDeliveryTime(data.estimated_delivery_minutes)
          setDeliveryEnabled(data.is_enabled)
        }
      } catch (error) {
        console.error('Error loading delivery settings:', error)
      }
    }
    
    if (restaurantId) {
      loadDeliverySettings()
    }
  }, [restaurantId])

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          currency: formData.currency,
          filter_config: formData.filter_config
        })
        .eq('id', restaurantId)

      if (error) throw error

      onUpdateRestaurant({
        name: formData.name,
        currency: formData.currency,
        filter_config: formData.filter_config
      })
      
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    }
  }

  const handleResetData = async () => {
    setShowResetConfirm(false)
    setResetting(true)
    
    try {
      // Delete in order (respect foreign keys)
      await supabase.from('order_items').delete().eq('restaurant_id', restaurantId)
      await supabase.from('orders').delete().eq('restaurant_id', restaurantId)
      await supabase.from('menu_items').delete().eq('restaurant_id', restaurantId)
      await supabase.from('categories').delete().eq('restaurant_id', restaurantId)
      await supabase.from('tables').delete().eq('restaurant_id', restaurantId)
      
      toast.success('All data has been reset')
      // Reload page to refresh state
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Reset failed:', error)
      toast.error('Failed to reset data')
    } finally {
      setResetting(false)
    }
  }

  const handleSaveDeliverySettings = async () => {
    setSavingDelivery(true)
    try {
      const settingsData = {
        restaurant_id: restaurantId,
        is_enabled: deliveryEnabled,
        delivery_fee: deliveryFee,
        minimum_order_amount: minOrderAmount,
        estimated_delivery_minutes: estimatedDeliveryTime
      }

      if (deliverySettings) {
        // Update existing settings
        const { error } = await supabase
          .from('delivery_settings')
          .update(settingsData)
          .eq('id', deliverySettings.id)
        
        if (error) throw error
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('delivery_settings')
          .insert(settingsData)
        
        if (error) throw error
      }

      toast.success('Delivery settings saved successfully')
    } catch (error) {
      console.error('Failed to save delivery settings:', error)
      toast.error('Failed to save delivery settings')
    } finally {
      setSavingDelivery(false)
    }
  }

  const saveRetentionSettings = async () => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          retention_config: {
            order_retention_days: retentionDays,
            auto_cleanup_enabled: autoCleanupEnabled,
            last_cleanup_at: restaurant?.retention_config?.last_cleanup_at || null
          }
        })
        .eq('id', restaurantId)

      if (error) throw error

      toast.success('Retention settings saved')
    } catch (error) {
      console.error('Failed to save retention settings:', error)
      toast.error('Failed to save settings')
    }
  }

  const runCleanupNow = async () => {
    setCleaningUp(true)
    try {
      const { data, error } = await supabase.rpc('cleanup_old_orders', {
        p_restaurant_id: restaurantId,
        p_days_to_keep: retentionDays
      })

      if (error) throw error

      const deletedOrders = data?.[0]?.deleted_orders || 0
      const deletedItems = data?.[0]?.deleted_items || 0

      toast.success(`Cleaned up ${deletedOrders} orders (${deletedItems} items)`)
      
      // Refresh restaurant data to update last_cleanup_at
      const { data: updatedRestaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()
      
      if (updatedRestaurant) {
        onUpdateRestaurant(updatedRestaurant)
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
      toast.error('Failed to run cleanup')
    } finally {
      setCleaningUp(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="restaurant-name">Restaurant Name</Label>
            <Input
              id="restaurant-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter restaurant name"
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency Symbol</Label>
            <Input
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              placeholder="$"
              maxLength={3}
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Filter Configuration */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Customer Menu Filters</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Control which filters are visible to customers in the menu
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label htmlFor="dietary-filter" className="font-medium">Dietary Filters</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show Dairy-Free, Gluten-Free, and Nut-Free filter options
              </p>
            </div>
            <Switch
              id="dietary-filter"
              checked={formData.filter_config.dietary !== false}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  filter_config: { ...formData.filter_config, dietary: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="sort-filter" className="font-medium">Sort Controls</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show A-Z, Price, and Fast preparation time sort buttons
              </p>
            </div>
            <Switch
              id="sort-filter"
              checked={formData.filter_config.sort !== false}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  filter_config: { ...formData.filter_config, sort: checked }
                })
              }
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Filter Settings
          </Button>
        </CardContent>
      </Card>

      {/* Order Retention */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Retention</CardTitle>
          <p className="text-sm text-muted-foreground">
            Automatically delete old delivered orders to keep your database clean
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="retention-days">Keep orders for (days)</Label>
            <Input 
              id="retention-days"
              type="number" 
              min="7" 
              max="365"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Delivered orders older than this will be eligible for cleanup
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <div>
              <Label htmlFor="auto-cleanup" className="font-medium">Auto Cleanup</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically run cleanup daily at 2 AM
              </p>
            </div>
            <Switch
              id="auto-cleanup"
              checked={autoCleanupEnabled}
              onCheckedChange={setAutoCleanupEnabled}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={saveRetentionSettings} className="flex-1 sm:flex-none">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={runCleanupNow} disabled={cleaningUp} className="flex-1 sm:flex-none">
              {cleaningUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Clean Up Now
            </Button>
          </div>
          
          {restaurant?.retention_config?.last_cleanup_at && (
            <p className="text-xs text-muted-foreground">
              Last cleanup: {new Date(restaurant.retention_config.last_cleanup_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure delivery options, fees, and availability
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label htmlFor="delivery-enabled" className="font-medium">Enable Delivery</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Allow customers to place delivery orders
              </p>
            </div>
            <Switch
              id="delivery-enabled"
              checked={deliveryEnabled}
              onCheckedChange={setDeliveryEnabled}
            />
          </div>

          <div>
            <Label htmlFor="delivery-fee">Delivery Fee ($)</Label>
            <Input 
              id="delivery-fee"
              type="number" 
              min="0" 
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fee charged for each delivery order
            </p>
          </div>

          <div>
            <Label htmlFor="min-order">Minimum Order Amount ($)</Label>
            <Input 
              id="min-order"
              type="number" 
              min="0" 
              step="0.01"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum order total required for delivery
            </p>
          </div>

          <div>
            <Label htmlFor="delivery-time">Estimated Delivery Time (minutes)</Label>
            <Input 
              id="delivery-time"
              type="number" 
              min="10" 
              max="120"
              value={estimatedDeliveryTime}
              onChange={(e) => setEstimatedDeliveryTime(parseInt(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shown to customers as estimated delivery time
            </p>
          </div>

          <Button onClick={handleSaveDeliverySettings} disabled={savingDelivery} className="w-full sm:w-auto">
            {savingDelivery ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Delivery Settings
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div>
                <p className="font-medium">Reset All Data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will delete all menu items, tables, categories, and orders. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowResetConfirm(true)}
                disabled={resetting}
              >
                {resetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reset Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="⚠️ Reset All Data?"
        description="This will permanently delete ALL menu items, tables, categories, and orders. Staff accounts and restaurant settings will be preserved. This cannot be undone!"
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        onConfirm={handleResetData}
        variant="destructive"
      />
    </div>
  )
}
