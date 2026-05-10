-- Migration: Remove is_required column from global_customizations table
-- This removes the "required" field as we're simplifying to optional add-ons only

ALTER TABLE global_customizations DROP COLUMN IF EXISTS is_required;

COMMENT ON TABLE global_customizations IS 'Global customization options (Extra-Addons) for menu items - all optional';
