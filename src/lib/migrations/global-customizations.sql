-- Global Customization System Migration
-- This migration creates a centralized customization library that allows
-- any menu item to use customizations from a global pool, regardless of category.

-- ============================================================================
-- 1. Create global_customizations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS global_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('addon', 'removal', 'substitution')),
  default_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_customizations_restaurant ON global_customizations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_global_customizations_active ON global_customizations(restaurant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_global_customizations_type ON global_customizations(type);

-- Comments for documentation
COMMENT ON TABLE global_customizations IS 'Centralized library of reusable customization options (addons, removals, substitutions) that can be assigned to any menu item across the restaurant';
COMMENT ON COLUMN global_customizations.name IS 'Display name of the customization option (e.g., "Extra Cheese", "No Onions")';
COMMENT ON COLUMN global_customizations.type IS 'Type of customization: addon (adds to item), removal (removes ingredient), substitution (replaces ingredient)';
COMMENT ON COLUMN global_customizations.default_price IS 'Default price modifier when customer selects this option';
COMMENT ON COLUMN global_customizations.is_required IS 'Whether customers must make a selection for this customization';
COMMENT ON COLUMN global_customizations.max_selections IS 'Maximum times customers can select this option (1 = single select, >1 = multi-select)';
COMMENT ON COLUMN global_customizations.is_active IS 'Whether this customization is available for selection';

-- ============================================================================
-- 2. Create junction table for menu item relationships
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  customization_id UUID NOT NULL REFERENCES global_customizations(id) ON DELETE CASCADE,
  price_override DECIMAL(10,2), -- Optional price override per item
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_item_id, customization_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_customizations_item ON menu_item_customizations(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_customizations_customization ON menu_item_customizations(customization_id);

-- Comments for documentation
COMMENT ON TABLE menu_item_customizations IS 'Junction table linking menu items to global customizations (many-to-many relationship)';
COMMENT ON COLUMN menu_item_customizations.price_override IS 'Optional price override for this specific menu item (uses global default_price if null)';
COMMENT ON COLUMN menu_item_customizations.is_enabled IS 'Whether this customization is enabled for this specific menu item';

-- ============================================================================
-- 3. Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE global_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_customizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS Policies for global_customizations
-- ============================================================================

-- Staff can view global customizations for their restaurant
DROP POLICY IF EXISTS "Staff can view global customizations" ON global_customizations;
CREATE POLICY "Staff can view global customizations"
  ON global_customizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM restaurant_staff 
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = global_customizations.restaurant_id
  ));

-- Admin staff can insert global customizations
DROP POLICY IF EXISTS "Admin staff can insert global customizations" ON global_customizations;
CREATE POLICY "Admin staff can insert global customizations"
  ON global_customizations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM restaurant_staff 
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = global_customizations.restaurant_id
    AND restaurant_staff.role = 'admin'
  ));

-- Admin staff can update global customizations
DROP POLICY IF EXISTS "Admin staff can update global customizations" ON global_customizations;
CREATE POLICY "Admin staff can update global customizations"
  ON global_customizations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM restaurant_staff 
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = global_customizations.restaurant_id
    AND restaurant_staff.role = 'admin'
  ));

-- Admin staff can delete global customizations
DROP POLICY IF EXISTS "Admin staff can delete global customizations" ON global_customizations;
CREATE POLICY "Admin staff can delete global customizations"
  ON global_customizations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM restaurant_staff 
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = global_customizations.restaurant_id
    AND restaurant_staff.role = 'admin'
  ));

-- ============================================================================
-- 5. RLS Policies for menu_item_customizations
-- ============================================================================

-- Staff can view menu item customizations for their restaurant
DROP POLICY IF EXISTS "Staff can view menu item customizations" ON menu_item_customizations;
CREATE POLICY "Staff can view menu item customizations"
  ON menu_item_customizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM menu_items
    JOIN restaurant_staff ON restaurant_staff.restaurant_id = menu_items.restaurant_id
    WHERE menu_items.id = menu_item_customizations.menu_item_id
    AND restaurant_staff.user_id = auth.uid()
  ));

-- Admin staff can insert menu item customizations
DROP POLICY IF EXISTS "Admin staff can insert menu item customizations" ON menu_item_customizations;
CREATE POLICY "Admin staff can insert menu item customizations"
  ON menu_item_customizations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM menu_items
    JOIN restaurant_staff ON restaurant_staff.restaurant_id = menu_items.restaurant_id
    WHERE menu_items.id = menu_item_customizations.menu_item_id
    AND restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.role = 'admin'
  ));

-- Admin staff can update menu item customizations
DROP POLICY IF EXISTS "Admin staff can update menu item customizations" ON menu_item_customizations;
CREATE POLICY "Admin staff can update menu item customizations"
  ON menu_item_customizations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM menu_items
    JOIN restaurant_staff ON restaurant_staff.restaurant_id = menu_items.restaurant_id
    WHERE menu_items.id = menu_item_customizations.menu_item_id
    AND restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.role = 'admin'
  ));

-- Admin staff can delete menu item customizations
DROP POLICY IF EXISTS "Admin staff can delete menu item customizations" ON menu_item_customizations;
CREATE POLICY "Admin staff can delete menu item customizations"
  ON menu_item_customizations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM menu_items
    JOIN restaurant_staff ON restaurant_staff.restaurant_id = menu_items.restaurant_id
    WHERE menu_items.id = menu_item_customizations.menu_item_id
    AND restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.role = 'admin'
  ));

-- ============================================================================
-- 6. Trigger to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_global_customizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_global_customizations_updated_at ON global_customizations;
CREATE TRIGGER trigger_update_global_customizations_updated_at
  BEFORE UPDATE ON global_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_global_customizations_updated_at();

-- ============================================================================
-- 7. Migration function for existing data (optional - run manually if needed)
-- ============================================================================
-- This function migrates existing category templates to global customizations
-- Run this ONLY if you want to migrate existing data. Comment out if not needed.

CREATE OR REPLACE FUNCTION migrate_category_templates_to_global()
RETURNS void AS $$
DECLARE
  cat_record RECORD;
  template JSONB;
  new_customization_id UUID;
  migrated_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting migration of category templates to global customizations...';
  
  FOR cat_record IN 
    SELECT id, restaurant_id, customization_templates 
    FROM categories 
    WHERE customization_templates != '[]'::jsonb
    AND customization_templates IS NOT NULL
  LOOP
    FOR template IN SELECT * FROM jsonb_array_elements(cat_record.customization_templates)
    LOOP
      -- Check if similar customization already exists to avoid duplicates
      SELECT COUNT(*) INTO migrated_count
      FROM global_customizations
      WHERE restaurant_id = cat_record.restaurant_id
      AND name = template->>'name'
      AND type = template->>'type';
      
      IF migrated_count = 0 THEN
        -- Insert as global customization
        INSERT INTO global_customizations (
          restaurant_id, name, type, default_price, is_required, max_selections
        ) VALUES (
          cat_record.restaurant_id,
          template->>'name',
          template->>'type',
          COALESCE((template->>'default_price')::DECIMAL, 0),
          COALESCE((template->>'is_required')::BOOLEAN, false),
          COALESCE((template->>'max_selections')::INTEGER, 1)
        ) RETURNING id INTO new_customization_id;
        
        RAISE NOTICE 'Migrated template "%" to global customization ID: %', template->>'name', new_customization_id;
      ELSE
        RAISE NOTICE 'Skipping duplicate template "%"', template->>'name';
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Migration complete!';
END;
$$ LANGUAGE plpgsql;

-- To run the migration, execute:
-- SELECT migrate_category_templates_to_global();

-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. Old columns (categories.customization_templates, menu_items.selected_template_ids)
--    are kept for backward compatibility but should be considered deprecated.
-- 
-- 2. The old menu_items.customization_config field continues to work for items
--    that haven't been migrated yet. Customer-facing code should check both
--    the new junction table and the old field.
--
-- 3. After full migration and validation, you can optionally remove the old
--    columns in a future cleanup migration.
--
-- 4. Always backup your database before running migrations in production.
