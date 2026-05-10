-- Migration: Convert Customizations to Add-on Menu Items
-- This creates an "Add-ons" category and converts global_customizations (type='addon') 
-- into regular menu items that can be ordered separately
-- Restaurant ID: b9b62b59-e5dc-45b0-9f05-c400f3761e18

-- ============================================================================
-- 1. Create "Add-ons" category if it doesn't exist
-- ============================================================================
DO $$
DECLARE
  addons_category_id UUID;
  first_restaurant_id UUID;
BEGIN
  -- Get the first restaurant ID (or you can modify this for specific restaurant)
  SELECT id INTO first_restaurant_id FROM restaurants LIMIT 1;
  
  IF first_restaurant_id IS NOT NULL THEN
    -- Check if Add-ons category already exists
    SELECT id INTO addons_category_id 
    FROM categories 
    WHERE name = 'Add-ons' 
    AND restaurant_id = first_restaurant_id
    LIMIT 1;
    
    -- If not exists, create it
    IF addons_category_id IS NULL THEN
      INSERT INTO categories (restaurant_id, name, sort_order)
      VALUES (first_restaurant_id, 'Add-ons', 999)
      RETURNING id INTO addons_category_id;
      
      RAISE NOTICE 'Created Add-ons category with ID: %', addons_category_id;
    ELSE
      RAISE NOTICE 'Add-ons category already exists with ID: %', addons_category_id;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. Convert global_customizations (type='addon') to menu_items
-- ============================================================================
INSERT INTO menu_items (
  restaurant_id,
  category_id,
  name,
  description,
  price,
  is_available,
  prep_time,
  image_url,
  allergens
)
SELECT 
  gc.restaurant_id,
  (SELECT id FROM categories WHERE name = 'Add-ons' AND restaurant_id = gc.restaurant_id LIMIT 1),
  'Extra ' || gc.name,  -- Prefix with "Extra" for clarity
  'Add-on item: ' || gc.name,
  gc.default_price,
  gc.is_active,
  5,  -- Quick prep time for add-ons
  NULL,  -- No image for now
  ''
FROM global_customizations gc
WHERE gc.type = 'addon'
AND NOT EXISTS (
  -- Avoid duplicates
  SELECT 1 FROM menu_items mi 
  WHERE mi.name = 'Extra ' || gc.name 
  AND mi.restaurant_id = gc.restaurant_id
);

-- ============================================================================
-- 3. Create mapping table for smart suggestions
-- This tracks which add-ons should be suggested with which menu items
-- ============================================================================
CREATE TABLE IF NOT EXISTS addon_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  parent_menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  addon_menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,  -- Higher priority = shown first
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_menu_item_id, addon_menu_item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_addon_suggestions_parent ON addon_suggestions(parent_menu_item_id);
CREATE INDEX IF NOT EXISTS idx_addon_suggestions_addon ON addon_suggestions(addon_menu_item_id);
CREATE INDEX IF NOT EXISTS idx_addon_suggestions_restaurant ON addon_suggestions(restaurant_id);

COMMENT ON TABLE addon_suggestions IS 'Maps which add-on items should be suggested with which main menu items';
COMMENT ON COLUMN addon_suggestions.parent_menu_item_id IS 'The main menu item that triggers this suggestion';
COMMENT ON COLUMN addon_suggestions.addon_menu_item_id IS 'The add-on item to suggest';
COMMENT ON COLUMN addon_suggestions.priority IS 'Display priority (higher = shown first)';
COMMENT ON COLUMN addon_suggestions.is_recommended IS 'Whether this is a recommended pairing';

-- ============================================================================
-- 4. Enable RLS for addon_suggestions
-- ============================================================================
ALTER TABLE addon_suggestions ENABLE ROW LEVEL SECURITY;

-- Staff can view suggestions for their restaurant
DROP POLICY IF EXISTS "Staff can view addon suggestions" ON addon_suggestions;
CREATE POLICY "Staff can view addon suggestions"
  ON addon_suggestions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM restaurant_staff 
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = addon_suggestions.restaurant_id
  ));

-- Admin staff can manage suggestions
DROP POLICY IF EXISTS "Admin staff can manage addon suggestions" ON addon_suggestions;
CREATE POLICY "Admin staff can manage addon suggestions"
  ON addon_suggestions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM restaurant_staff 
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = addon_suggestions.restaurant_id
    AND restaurant_staff.role = 'admin'
  ));

-- ============================================================================
-- 5. Seed sample suggestions (optional - based on existing menu_item_customizations)
-- ============================================================================
-- If there are existing links in menu_item_customizations, convert them to addon_suggestions
INSERT INTO addon_suggestions (restaurant_id, parent_menu_item_id, addon_menu_item_id, is_recommended)
SELECT DISTINCT
  mi.restaurant_id,
  mic.menu_item_id,
  addon_mi.id,
  true
FROM menu_item_customizations mic
JOIN global_customizations gc ON mic.customization_id = gc.id
JOIN menu_items mi ON mic.menu_item_id = mi.id
JOIN menu_items addon_mi ON addon_mi.name = 'Extra ' || gc.name AND addon_mi.restaurant_id = mi.restaurant_id
WHERE gc.type = 'addon'
ON CONFLICT (parent_menu_item_id, addon_menu_item_id) DO NOTHING;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify the migration worked:

-- Check Add-ons category
-- SELECT * FROM categories WHERE name = 'Add-ons';

-- Check converted add-on items
-- SELECT id, name, price, is_available FROM menu_items WHERE name LIKE 'Extra %';

-- Check suggestions
-- SELECT * FROM addon_suggestions LIMIT 10;
