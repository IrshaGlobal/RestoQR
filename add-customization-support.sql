-- Add customization support with category-level templates
-- This allows admins to create reusable customization templates at the category level
-- and menu items can select which templates apply to them

-- 1. Add customization_templates to categories table
-- Stores reusable customization option templates per category
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS customization_templates jsonb DEFAULT '[]'::jsonb;

-- 2. Add selected_template_ids to menu_items table
-- Stores which category templates are enabled for this specific item
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS selected_template_ids text[] DEFAULT '{}'::text[];

-- 3. Add customizations to order_items table (for storing customer selections)
-- Stores what the customer actually selected for each order item
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS customizations jsonb DEFAULT '[]'::jsonb;

-- 4. Add comments for documentation
COMMENT ON COLUMN categories.customization_templates IS 'JSON array of reusable customization templates for this category. Each template has: id, name, type (addon/removal/substitution), default_price, is_required, max_selections, sort_order';
COMMENT ON COLUMN menu_items.selected_template_ids IS 'Array of template IDs from the parent category that are enabled for this menu item';
COMMENT ON COLUMN order_items.customizations IS 'JSON object of customer-selected customizations for this order item. Contains: addons (array of IDs), removals (array of IDs), substitutions (object mapping originalId to substituteId), specialInstructions (string)';

-- Note: No RLS policy changes needed because:
-- - categories already has admin-only update policy
-- - menu_items already has admin-only update policy
-- - order_items already has customer insert and staff read policies
-- The new jsonb columns will be accessible through existing policies
