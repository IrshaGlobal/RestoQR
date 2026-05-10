# Category-Level Customization Templates - Implementation Guide

## Overview
This document describes the refactoring from per-item customization configuration to category-level reusable templates.

## What's Been Completed ✅

### 1. Database Schema (add-customization-support.sql)
- ✅ Added `customization_templates` JSONB column to `categories` table
- ✅ Added `selected_template_ids` text[] column to `menu_items` table  
- ✅ Kept `customizations` JSONB column in `order_items` table (unchanged)

### 2. TypeScript Types (src/lib/supabase.ts)
- ✅ Updated `Category` interface to include `customization_templates?: CustomizationOption[]`
- ✅ Updated `MenuItem` interface to include `selected_template_ids?: string[]`
- ✅ Removed `customization_config` from `MenuItem`
- ✅ `CustomizationOption` and `CustomizationState` remain unchanged

### 3. New Component Created
- ✅ `CategoryCustomizationTemplates.tsx` - Manages templates at category level
  - Create/edit/delete templates
  - Reorder templates
  - Configure type, price, requirements, max selections

### 4. CategoryManager Updated
- ✅ Added expandable template management for each category
- ✅ Click chevron to expand/collapse template editor
- ✅ Shows template count badge
- ✅ Saves templates to database via `saveCategoryTemplates()`

## What Needs to Be Done ⏳

### Step 1: Replace Per-Item Editor with Template Selector

**File**: `src/pages/AdminDashboard.tsx`

**Current Code** (lines ~707-745):
```tsx
{/* Customization Manager */}
{editingItem && (
  <div className="pt-4 border-t border-border">
    <CustomizationManager
      menuItem={editingItem}
      onSave={async (config) => {
        // ... saves to menu_items.customization_config
      }}
    />
  </div>
)}
```

**Replace With**:
```tsx
{/* Template Selector */}
{editingItem && itemForm.category_id && (
  <div className="pt-4 border-t border-border">
    <h3 className="font-semibold text-lg mb-3">Select Customization Templates</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Choose which category templates apply to this item
    </p>
    
    {/* Find the category */}
    {(() => {
      const category = categories.find(c => c.id === itemForm.category_id)
      if (!category || !category.customization_templates || category.customization_templates.length === 0) {
        return (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No templates available in this category</p>
              <p className="text-xs mt-1">Add templates in the Category Management section above</p>
            </CardContent>
          </Card>
        )
      }
      
      const selectedIds = editingItem.selected_template_ids || []
      
      return (
        <div className="space-y-2">
          {category.customization_templates.map(template => {
            const isSelected = selectedIds.includes(template.id)
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  const newSelected = isSelected
                    ? selectedIds.filter(id => id !== template.id)
                    : [...selectedIds, template.id]
                  
                  // Update local state
                  setEditingItem({ ...editingItem, selected_template_ids: newSelected })
                  
                  // Save to database
                  supabase
                    .from('menu_items')
                    .update({ selected_template_ids: newSelected })
                    .eq('id', editingItem.id)
                    .then(({ error }) => {
                      if (!error) {
                        toast.success(isSelected ? 'Template removed' : 'Template added')
                      }
                    })
                }}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.type} • ${template.default_price.toFixed(2)}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by Card onClick
                    className="w-4 h-4"
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )
    })()}
  </div>
)}
```

**Also Update**: When saving menu item, ensure `selected_template_ids` is preserved:
```tsx
const saveMenuItem = async () => {
  // ... existing validation ...
  
  const itemData = {
    restaurant_id: restaurantId,
    name: sanitizeInput(itemForm.name),
    description: sanitizeInput(itemForm.description),
    price: parseFloat(itemForm.price),
    category_id: itemForm.category_id || null,
    allergens: itemForm.allergens ? sanitizeInput(itemForm.allergens) : '',
    prep_time: prepTime,
    image_url: itemForm.image_url || null,
    is_available: itemForm.is_available,
    selected_template_ids: editingItem?.selected_template_ids || [] // ADD THIS
  }
  
  // ... rest of save logic ...
}
```

### Step 2: Update ItemCustomization to Use Category Templates

**File**: `src/components/ItemCustomization.tsx`

**Current Code** (line ~38):
```tsx
const options = item.customization_config || []
```

**Replace With**:
```tsx
// Need to fetch category templates and filter by selected IDs
const [categoryTemplates, setCategoryTemplates] = useState<CustomizationOption[]>([])

useEffect(() => {
  const loadTemplates = async () => {
    if (!item.category_id) {
      setCategoryTemplates([])
      return
    }
    
    // Fetch category to get templates
    const { data: category } = await supabase
      .from('categories')
      .select('customization_templates')
      .eq('id', item.category_id)
      .single()
    
    if (category && category.customization_templates) {
      // Filter templates to only those selected for this item
      const selectedIds = item.selected_template_ids || []
      const filtered = category.customization_templates.filter((t: CustomizationOption) =>
        selectedIds.includes(t.id)
      )
      setCategoryTemplates(filtered)
    } else {
      setCategoryTemplates([])
    }
  }
  
  loadTemplates()
}, [item.category_id, item.selected_template_ids])

const options = categoryTemplates
```

**Note**: This adds an async fetch. For better performance, consider passing category data as props from CustomerMenu instead of fetching here.

### Step 3: Update Data Fetching in Admin Dashboard

**File**: `src/pages/AdminDashboard.tsx`

In the `fetchData` function (~line 97-103), update category fetching:
```tsx
// Fetch categories
const { data: catsData } = await supabase
  .from('categories')
  .select('*')
  .eq('restaurant_id', restId)
  .order('sort_order')

if (catsData) {
  // Parse customization_templates from JSONB
  const parsedCats = catsData.map(cat => ({
    ...cat,
    customization_templates: cat.customization_templates || []
  }))
  setCategories(parsedCats)
}
```

### Step 4: Update Data Fetching in Customer Menu

**File**: `src/pages/CustomerMenu.tsx`

Similar update when fetching categories (~line 132-140):
```tsx
// Fetch categories
const { data: categoriesData } = await supabase
  .from('categories')
  .select('*')
  .eq('restaurant_id', restaurantId)
  .order('sort_order')

if (categoriesData && categoriesData.length > 0) {
  const parsedCats = categoriesData.map(cat => ({
    ...cat,
    customization_templates: cat.customization_templates || []
  }))
  setCategories(parsedCats)
}
```

And when fetching menu items (~line 143-156):
```tsx
// Fetch menu items
const { data: menuItemsData } = await supabase
  .from('menu_items')
  .select('*')
  .eq('restaurant_id', restaurantId)
  .eq('is_available', true)

if (menuItemsData && menuItemsData.length > 0) {
  const parsedItems = menuItemsData.map(item => ({
    ...item,
    selected_template_ids: item.selected_template_ids || []
  }))
  setMenuItems(parsedItems)
}
```

### Step 5: Optimize ItemCustomization (Optional but Recommended)

Instead of fetching category data inside ItemCustomization, pass it as a prop:

**In CustomerMenu.tsx**, when rendering MenuItemCard or ItemCustomization:
```tsx
<ItemCustomization 
  item={selectedItem}
  category={categories.find(c => c.id === selectedItem.category_id)}
  onAddToOrder={(customizations) => {
    handleAddToCart(selectedItem, customizations)
    setSelectedItem(null)
  }}
/>
```

**Update ItemCustomization.tsx** interface:
```tsx
interface ItemCustomizationProps {
  item: MenuItem
  category?: Category  // ADD THIS
  onAddToOrder: (customizations: CustomizationState) => void
}
```

Then use it directly:
```tsx
const options = useMemo(() => {
  if (!category?.customization_templates) return []
  const selectedIds = item.selected_template_ids || []
  return category.customization_templates.filter((t: CustomizationOption) =>
    selectedIds.includes(t.id)
  )
}, [category, item.selected_template_ids])
```

## Testing Checklist

After completing all steps:

### Admin Side
- [ ] Navigate to Categories section
- [ ] Expand a category (click chevron)
- [ ] Add 2-3 customization templates
- [ ] Edit a template (change price)
- [ ] Delete a template
- [ ] Reorder templates
- [ ] Create/edit a menu item
- [ ] See template selector (not full editor)
- [ ] Select some templates for the item
- [ ] Save item
- [ ] Verify selection persists

### Customer Side
- [ ] Open customer menu
- [ ] Find item with templates selected
- [ ] Click "Customize"
- [ ] See ONLY the templates selected for that item
- [ ] NOT see templates from category that weren't selected
- [ ] Add to cart with customizations
- [ ] Place order
- [ ] Verify order saved correctly

### Edge Cases
- [ ] Item with NO templates selected → No customize button or empty dialog
- [ ] Category with NO templates → Show message in admin
- [ ] Change category for an item → Template selector updates
- [ ] Delete template from category → Items using it should handle gracefully

## Migration Notes

**IMPORTANT**: Existing data with `customization_config` will NOT automatically migrate.

If you have existing customization configs, you have two options:

### Option 1: Manual Migration (Recommended for Production)
1. Export existing customization_config data
2. For each unique config pattern, create a category template
3. Update menu_items to reference the template IDs
4. Test thoroughly before deploying

### Option 2: Keep Both Systems Temporarily
Modify ItemCustomization to check both:
```tsx
const options = item.customization_config || categoryTemplates
```

This provides backward compatibility during transition.

## Benefits of This Refactoring

✅ **Reusability**: Define once, use across multiple items
✅ **Consistency**: All items in a category share same options
✅ **Easier Management**: Update template → all items updated
✅ **Flexibility**: Items can still choose which templates to use
✅ **Cleaner UI**: Simpler admin interface
✅ **Better UX**: Customers see consistent options within categories

## Potential Issues & Solutions

**Issue**: Performance - fetching category for each item
**Solution**: Pass category data as props, use React Query/SWR for caching

**Issue**: Backward compatibility
**Solution**: Support both systems temporarily, migrate data gradually

**Issue**: Template deleted but item still references it
**Solution**: Filter out missing templates when loading (already handled)

**Issue**: Complex template dependencies
**Solution**: Future enhancement - add conditional logic to templates

## Summary

This refactoring shifts from a **per-item configuration model** to a **category-level template model** with item-level selection. The core infrastructure is complete (database schema, types, category template manager). The remaining work involves:

1. Replacing the per-item editor with a template selector ✅ Documented above
2. Updating ItemCustomization to use category templates ✅ Documented above  
3. Updating data fetching to parse new fields ✅ Documented above
4. Testing the complete flow ✅ Checklist provided

The cart and order systems require NO changes - they continue to work with `CustomizationState` as before.
