# Pre-Launch Verification Checklist

## Before Running the Application

### 1. Database Migration
- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `add-customization-support.sql`
- [ ] Execute the SQL script
- [ ] Verify no errors in execution
- [ ] Check that columns were added:
  - [ ] `menu_items.customization_config` exists
  - [ ] `order_items.customizations` exists

### 2. Code Review
- [ ] All files saved without errors
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Import statements correct in all files

### 3. Development Server
- [ ] Stop any running dev server
- [ ] Clear node_modules cache (optional): `rm -rf node_modules/.vite`
- [ ] Restart dev server: `npm run dev`
- [ ] Check console for startup errors
- [ ] Verify application loads successfully

## Testing Sequence

### Phase 1: Admin Configuration (Do First)

#### Test Admin Login
- [ ] Navigate to admin login page
- [ ] Login with admin credentials
- [ ] Verify dashboard loads
- [ ] Navigate to Menu tab

#### Test Menu Item Edit
- [ ] Click edit on any menu item
- [ ] Verify edit dialog opens
- [ ] Scroll down to "Customization Options" section
- [ ] Verify CustomizationManager component appears

#### Test Adding Options
- [ ] Click "Add Option" button
- [ ] Fill in form:
  - Name: "Extra Cheese"
  - Type: "Addon"
  - Price: 1.50
  - Required: Unchecked
  - Max Selections: 1
- [ ] Click "Add Option"
- [ ] Verify option appears in list
- [ ] Add another option:
  - Name: "No Onions"
  - Type: "Removal"
  - Price: 0
- [ ] Add third option:
  - Name: "Gluten-Free Bun"
  - Type: "Substitution"
  - Price: 1.00

#### Test Managing Options
- [ ] Click up/down arrows to reorder
- [ ] Click edit on an option
- [ ] Change price and save
- [ ] Verify price updated
- [ ] Click delete on an option
- [ ] Confirm deletion
- [ ] Verify option removed

#### Test Save & Persistence
- [ ] Close edit dialog
- [ ] Reopen same menu item
- [ ] Verify all options still there
- [ ] Verify order preserved
- [ ] Verify prices correct

### Phase 2: Customer Experience

#### Test Menu Display
- [ ] Open customer menu (use QR code or direct URL)
- [ ] Find the configured menu item
- [ ] Verify item displays normally
- [ ] Verify "Customize" button visible

#### Test Customization Dialog
- [ ] Click "Customize" button
- [ ] Verify dialog opens
- [ ] Verify all 3 options appear
- [ ] Verify sections organized correctly:
  - Add-ons section has "Extra Cheese"
  - Modifications section has "No Onions" and "Gluten-Free Bun"

#### Test Option Selection
- [ ] Click "Extra Cheese" addon
- [ ] Verify badge changes to "Added"
- [ ] Verify price updates (+$1.50)
- [ ] Click "No Onions" removal
- [ ] Verify badge changes to "Selected"
- [ ] Click "Gluten-Free Bun" substitution
- [ ] Verify badge changes to "Selected"
- [ ] Verify total price correct

#### Test Special Instructions
- [ ] Type in special instructions field
- [ ] Verify text appears
- [ ] Add note: "Please make it well done"

#### Test Add to Cart
- [ ] Click "Add to Order" button
- [ ] Verify dialog closes
- [ ] Verify cart button appears/updates
- [ ] Verify quantity shows in item card

#### Test Cart View
- [ ] Click cart button
- [ ] Verify cart drawer opens
- [ ] Verify item appears
- [ ] Verify price includes customizations
- [ ] Verify special instructions shown (if implemented)

### Phase 3: Order Placement

#### Test Complete Order
- [ ] Add another regular item (no customizations)
- [ ] Click "Place Order"
- [ ] Wait for confirmation
- [ ] Verify order number displayed
- [ ] Verify success message

#### Test Order Manager
- [ ] Switch to admin/staff dashboard
- [ ] Navigate to Orders tab
- [ ] Find the new order
- [ ] Expand order details
- [ ] Verify customized item shows
- [ ] Verify price is correct
- [ ] **Check if customizations visible** (may need OrderManager update)

### Phase 4: Edge Cases

#### Test Without Customizations
- [ ] Add item that has NO customization config
- [ ] Verify "Customize" button not shown (or disabled)
- [ ] Verify item adds to cart normally
- [ ] Verify price is base price only

#### Test Required Options
- [ ] Edit an item, make an option required
- [ ] Try to add without selecting required option
- [ ] Verify error message appears
- [ ] Select required option
- [ ] Verify can now add to cart

#### Test Max Selections
- [ ] Set max_selections to 2 for an addon
- [ ] Try to select 3 times
- [ ] Verify error after 2nd selection
- [ ] Verify can deselect and reselect

#### Test Multiple Customized Items
- [ ] Add same item twice with different customizations
- [ ] Verify they appear as separate cart items
- [ ] Verify quantities independent
- [ ] Verify totals calculated correctly

### Phase 5: Data Verification

#### Check Database Directly
- [ ] Open Supabase Dashboard
- [ ] Go to Table Editor → menu_items
- [ ] Find your configured item
- [ ] Verify customization_config column has JSON data
- [ ] Go to Table Editor → order_items
- [ ] Find your test order's items
- [ ] Verify customizations column has JSON data

#### Verify JSON Structure
Menu item config should look like:
```json
[
  {
    "id": "some-uuid",
    "name": "Extra Cheese",
    "type": "addon",
    "default_price": 1.5,
    "is_required": false,
    "max_selections": 1,
    "sort_order": 0
  }
]
```

Order item customizations should look like:
```json
{
  "addons": ["option-uuid-1"],
  "removals": ["option-uuid-2"],
  "substitutions": {},
  "specialInstructions": "Please make it well done"
}
```

## Common Issues & Solutions

### Issue: "Customization Options" section not showing
**Solution**: 
- Make sure you're EDITING an existing item, not adding new
- The section only appears when `editingItem` is not null

### Issue: Options not saving to database
**Solution**:
- Check browser console for errors
- Verify you're logged in as admin
- Check Supabase logs for RLS policy violations
- Verify database migration was run

### Issue: TypeScript errors about missing types
**Solution**:
- Restart TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
- Clear .tsbuildinfo: Delete `tsconfig.app.tsbuildinfo`
- Restart dev server

### Issue: Cart total not including customization prices
**Solution**:
- Clear localStorage (cart persistence)
- Reload page
- Add items again
- Check cart.ts getTotal() function is being called

### Issue: Prices don't match between cart and order
**Solution**:
- Both calculate independently (this is intentional for security)
- Verify both calculations use same logic
- Check that default_price is set correctly for options

## Success Criteria

You can consider the implementation successful when:

✅ Admin can add/edit/delete customization options
✅ Options persist to database
✅ Customers see dynamic options (not hardcoded)
✅ Customers can select multiple option types
✅ Prices update in real-time
✅ Cart calculates correct totals
✅ Orders save with customization data
✅ Items without customizations still work
✅ No TypeScript errors
✅ No runtime errors in console
✅ Existing features unaffected

## Post-Launch Monitoring

After going live, monitor:

1. **Error Logs**: Check for any customization-related errors
2. **Order Accuracy**: Verify orders show correct customizations
3. **Performance**: Watch for any slowdowns with many options
4. **User Feedback**: Collect feedback from admins and customers
5. **Database Size**: Monitor JSONB column sizes

## Rollback Plan (If Needed)

If issues arise:

1. **Disable Feature**: Comment out CustomizationManager import in AdminDashboard
2. **Revert UI**: Hide Customize button in CustomerMenu temporarily
3. **Keep Data**: Don't remove database columns (backward compatible)
4. **Fix Issues**: Debug and fix problems
5. **Re-enable**: Uncomment and redeploy

The feature is designed to be safely disableable without breaking anything.

## Sign-off

- [ ] All tests passed
- [ ] No errors in console
- [ ] Database verified
- [ ] Backward compatibility confirmed
- [ ] Documentation complete
- [ ] Ready for production

**Tested by**: ________________  
**Date**: ________________  
**Status**: □ PASS  □ FAIL  □ NEEDS FIXES
