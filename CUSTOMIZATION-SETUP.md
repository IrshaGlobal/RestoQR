# Customization Feature - Setup & Testing Guide

## Overview
This feature allows restaurant admins to configure customization options for menu items (addons, removals, substitutions) that customers can select when ordering.

## Database Migration Required

**IMPORTANT**: You must run the SQL migration before using this feature!

### Step 1: Run Database Migration
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `add-customization-support.sql`
4. Click "Run" to execute

This will add two new JSONB columns:
- `menu_items.customization_config` - Stores available customization options per item
- `order_items.customizations` - Stores customer selections per order item

## How It Works

### For Admins (Admin Dashboard)

1. **Navigate to Menu Tab**
   - Go to Admin Dashboard → Menu tab
   
2. **Edit a Menu Item**
   - Click the edit (pencil) icon on any menu item
   - Scroll down to find "Customization Options" section
   
3. **Add Customization Options**
   - Click "Add Option" button
   - Fill in:
     - **Option Name**: e.g., "Extra Cheese", "No Onions"
     - **Type**: 
       - Addon (adds to item, shows in Add-ons section)
       - Removal (removes ingredient, shows in Modifications)
       - Substitution (replaces ingredient, shows in Modifications)
     - **Default Price**: Price modifier when selected ($0 for free)
     - **Required**: Check if customer must select this option
     - **Max Selections**: For addons only (1 = single select, >1 = multiple select)
   
4. **Manage Options**
   - Use arrow buttons to reorder options
   - Edit existing options
   - Delete unwanted options
   - Changes save automatically to database

### For Customers (Customer Menu)

1. **Browse Menu**
   - Items with customization options show a "Customize" button
   
2. **Customize Item**
   - Click "Customize" to open customization dialog
   - Select desired addons, removals, or substitutions
   - Add special instructions if needed
   - See real-time price updates
   
3. **Add to Cart**
   - Click "Add to Order" with calculated total
   - Item appears in cart with customizations
   
4. **Place Order**
   - Customizations are saved with the order
   - Staff can see what was customized

## Testing Checklist

### Test 1: Admin Configuration
- [ ] Login to admin dashboard
- [ ] Edit a menu item
- [ ] Add at least 3 customization options (mix of types)
- [ ] Reorder options using arrows
- [ ] Edit an option's price
- [ ] Delete an option
- [ ] Save and close dialog
- [ ] Reopen to verify changes persisted

### Test 2: Customer View
- [ ] Open customer menu (use QR code or direct link)
- [ ] Find the item you configured
- [ ] Click "Customize" button
- [ ] Verify all options appear correctly
- [ ] Try selecting addons (check price updates)
- [ ] Try selecting removals
- [ ] Try selecting substitutions
- [ ] Add special instructions
- [ ] Add to cart
- [ ] Verify cart shows correct total with customizations

### Test 3: Order Placement
- [ ] Add customized item to cart
- [ ] Place order
- [ ] Check order appears in Order Manager
- [ ] Verify order details include customizations
- [ ] Check order_items table in Supabase has customizations data

### Test 4: Edge Cases
- [ ] Item with no customizations (should work normally)
- [ ] Required option not selected (should show error)
- [ ] Max selections exceeded (should show error)
- [ ] Multiple items with different customizations in cart
- [ ] Same item with different customizations (should be separate cart items)

## Technical Details

### Data Structure

**Menu Item Customization Config** (stored in `menu_items.customization_config`):
```json
[
  {
    "id": "uuid",
    "name": "Extra Cheese",
    "type": "addon",
    "default_price": 1.50,
    "is_required": false,
    "max_selections": 1,
    "sort_order": 0
  }
]
```

**Order Item Customizations** (stored in `order_items.customizations`):
```json
{
  "addons": ["option-id-1", "option-id-2"],
  "removals": ["option-id-3"],
  "substitutions": {"original-id": "substitute-id"},
  "specialInstructions": "Please make it extra spicy"
}
```

### Files Modified

1. **Database**: `add-customization-support.sql` (NEW)
2. **Types**: `src/lib/supabase.ts` - Added CustomizationOption, CustomizationState interfaces
3. **Components**: 
   - `src/components/CustomizationManager.tsx` (NEW) - Admin UI
   - `src/components/ItemCustomization.tsx` - Updated to use dynamic options
4. **Store**: `src/stores/cart.ts` - Added customizations support
5. **Pages**:
   - `src/pages/AdminDashboard.tsx` - Integrated CustomizationManager
   - `src/pages/CustomerMenu.tsx` - Updated to handle customizations

### Key Features

✅ Dynamic customization options per menu item
✅ Three types: addons, removals, substitutions
✅ Price modifiers calculated automatically
✅ Required options validation
✅ Maximum selection limits
✅ Reorderable options
✅ Special instructions support
✅ Persists to database
✅ Shows in orders for staff
✅ Backward compatible (items without customizations work normally)

## Troubleshooting

### Issue: Customization options not showing
- **Check**: Did you run the database migration?
- **Fix**: Run `add-customization-support.sql` in Supabase SQL Editor

### Issue: Options not saving
- **Check**: Are you logged in as admin?
- **Check**: Browser console for errors
- **Fix**: Ensure RLS policies allow admin updates (existing policies should work)

### Issue: Prices not calculating correctly
- **Check**: Are default_price values set correctly?
- **Check**: Cart total includes customization prices
- **Fix**: Clear browser cache/localStorage and reload

### Issue: TypeScript errors
- **Check**: All files saved properly
- **Fix**: Restart TypeScript server in VS Code (Ctrl+Shift+P → "TypeScript: Restart TS Server")

## Next Steps (Optional Enhancements)

1. **Option Groups**: Group related options (e.g., "Choose your protein")
2. **Conditional Logic**: Show/hide options based on other selections
3. **Bulk Operations**: Apply same customizations to multiple items
4. **Templates**: Save common customization sets for reuse
5. **Images**: Add images to customization options
6. **Analytics**: Track which customizations are most popular

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify database migration was run
3. Check Supabase logs for database errors
4. Review this guide's troubleshooting section
