import { useState } from 'react'
import { Plus, Minus, Info, ChefHat, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MenuItem, CustomizationOption, CustomizationState } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface ItemCustomizationProps {
  item: MenuItem
  onAddToOrder: (customizations: CustomizationState) => void
}

interface CustomizationManagerState {
  quantity: number
  selectedAddons: Set<string>
  removals: string[]
  substitutions: Map<string, string>
  specialInstructions: string
}

export default function ItemCustomization({ item, onAddToOrder }: ItemCustomizationProps) {
  const [open, setOpen] = useState(false)
  const [customization, setCustomization] = useState<CustomizationManagerState>({
    quantity: 1,
    selectedAddons: new Set(),
    removals: [],
    substitutions: new Map(),
    specialInstructions: ''
  })

  // Use customization_config from menu item or empty array
  const options = item.customization_config || []

  const toggleAddon = (optionId: string) => {
    const option = options.find(o => o.id === optionId)
    if (!option) return

    const newAddons = new Set(customization.selectedAddons)
    
    // Check max selections
    if (option.max_selections && option.max_selections > 1) {
      if (newAddons.has(optionId)) {
        newAddons.delete(optionId)
      } else if (newAddons.size < option.max_selections) {
        newAddons.add(optionId)
      } else {
        toast.error(`Maximum ${option.max_selections} selections allowed`)
        return
      }
    } else {
      // Single selection - toggle
      if (newAddons.has(optionId)) {
        newAddons.delete(optionId)
      } else {
        newAddons.clear()
        newAddons.add(optionId)
      }
    }
    
    setCustomization({ ...customization, selectedAddons: newAddons })
  }

  const toggleRemoval = (removalId: string) => {
    const newRemovals = customization.removals.includes(removalId)
      ? customization.removals.filter(id => id !== removalId)
      : [...customization.removals, removalId]
    setCustomization({ ...customization, removals: newRemovals })
  }

  const setSubstitution = (originalId: string, substituteId: string) => {
    const newSubstitutions = new Map(customization.substitutions)
    if (newSubstitutions.get(originalId) === substituteId) {
      newSubstitutions.delete(originalId)
    } else {
      newSubstitutions.set(originalId, substituteId)
    }
    setCustomization({ ...customization, substitutions: newSubstitutions })
  }

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, customization.quantity + delta)
    setCustomization({ ...customization, quantity: newQuantity })
  }

  const calculateTotal = () => {
    let total = parseFloat(item.price.toString()) * customization.quantity
    
    // Add addon prices
    options.forEach(option => {
      if (option.type === 'addon' && customization.selectedAddons.has(option.id)) {
        total += option.default_price * customization.quantity
      }
      if (option.type === 'substitution' && Array.from(customization.substitutions.values()).includes(option.id)) {
        total += option.default_price * customization.quantity
      }
    })

    return total
  }

  const handleAddToOrder = () => {
    // No validation needed - all addons are optional

    const customizationState: CustomizationState = {
      addons: Array.from(customization.selectedAddons),
      removals: customization.removals,
      substitutions: Object.fromEntries(customization.substitutions),
      specialInstructions: customization.specialInstructions
    }

    onAddToOrder(customizationState)
    setOpen(false)
    // Reset customization
    setCustomization({
      quantity: 1,
      selectedAddons: new Set(),
      removals: [],
      substitutions: new Map(),
      specialInstructions: ''
    })
  }

  const getSelectedOptions = () => {
    const selected: CustomizationOption[] = []
    
    customization.selectedAddons.forEach(id => {
      const option = options.find(o => o.id === id)
      if (option) selected.push(option)
    })

    Array.from(customization.substitutions.values()).forEach(id => {
      const option = options.find(o => o.id === id)
      if (option && !selected.find(s => s.id === id)) {
        selected.push(option)
      }
    })

    return selected
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" style={{ borderRadius: 0 }}>
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize {item.name}</span>
            <Badge variant="secondary">{formatCurrency(calculateTotal())}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Customization Available Banner */}
        {options.length > 0 && (
          <div className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] text-white p-4 -mx-6 -mt-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Make It Yours!</p>
                <p className="text-xs opacity-80">Choose from {options.length} customization options</p>
              </div>
              <ChefHat className="w-6 h-6 opacity-50" />
            </div>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Item Info */}
          <div className="flex gap-4">
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
              {item.allergens && (
                <div className="flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-warning" />
                  <span className="text-xs text-warning">{item.allergens}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(-1)}
                disabled={customization.quantity <= 1}
                style={{ borderRadius: 0 }}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-bold w-12 text-center">{customization.quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(1)}
                style={{ borderRadius: 0 }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Add-ons Section */}
          {options.filter(o => o.type === 'addon').length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-base font-semibold mb-3 block">Add-ons</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {options.filter(o => o.type === 'addon').map(option => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        customization.selectedAddons.has(option.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleAddon(option.id)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{option.name}</p>
                          {option.default_price > 0 && (
                            <p className="text-sm text-muted-foreground">+{formatCurrency(option.default_price)}</p>
                          )}
                        </div>
                        <Badge variant={customization.selectedAddons.has(option.id) ? 'default' : 'outline'}>
                          {customization.selectedAddons.has(option.id) ? 'Added' : 'Add'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Modifications Section */}
          {(options.filter(o => o.type === 'removal').length > 0 || options.filter(o => o.type === 'substitution').length > 0) && (
            <>
              <Separator />
              <div>
                <Label className="text-base font-semibold mb-3 block">Modifications</Label>
                <div className="space-y-3">
                  {options.filter(o => o.type === 'removal' || o.type === 'substitution').map(option => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        (option.type === 'removal' && customization.removals.includes(option.id)) ||
                        (option.type === 'substitution' && customization.substitutions.has(option.id))
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => {
                        if (option.type === 'removal') {
                          toggleRemoval(option.id)
                        } else if (option.type === 'substitution') {
                          setSubstitution(option.id, option.id)
                        }
                      }}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{option.name}</p>
                          {option.default_price > 0 && (
                            <p className="text-sm text-muted-foreground">+{formatCurrency(option.default_price)}</p>
                          )}
                        </div>
                        <Badge 
                          variant={
                            (option.type === 'removal' && customization.removals.includes(option.id)) ||
                            (option.type === 'substitution' && customization.substitutions.has(option.id))
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {(option.type === 'removal' && customization.removals.includes(option.id)) ||
                           (option.type === 'substitution' && customization.substitutions.has(option.id))
                            ? 'Selected'
                            : 'Select'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Special Instructions */}
          <div>
            <Label htmlFor="instructions" className="text-base font-semibold mb-3 block">
              Special Instructions
            </Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests or dietary requirements..."
              value={customization.specialInstructions}
              onChange={(e) => setCustomization({ ...customization, specialInstructions: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          {/* Summary */}
          {getSelectedOptions().length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-base font-semibold mb-3 block">Your Customizations</Label>
                <div className="flex flex-wrap gap-2">
                  {getSelectedOptions().map(option => (
                    <Badge key={option.id} variant="secondary" className="text-xs">
                      {option.name}
                      {option.default_price > 0 && ` (+${formatCurrency(option.default_price)})`}
                    </Badge>
                  ))}
                  {customization.removals.map(removalId => {
                    const option = options.find(o => o.id === removalId)
                    return option ? (
                      <Badge key={removalId} variant="destructive" className="text-xs">
                        Remove: {option.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} style={{ borderRadius: 0 }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAddToOrder} style={{ borderRadius: 0 }}>
              Add to Order - {formatCurrency(calculateTotal())}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
