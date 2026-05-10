-- Migration: Add display_name column to restaurant_staff table
-- Purpose: Allow staff members to have proper names displayed instead of "Unknown"
-- Date: 2026-05-08

-- Add display_name column
ALTER TABLE restaurant_staff 
ADD COLUMN display_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN restaurant_staff.display_name IS 'Display name for staff member (shown in UI). Can be set manually by admin.';

-- Note: We cannot auto-populate from email because:
-- 1. restaurant_staff table doesn't have an email column
-- 2. Email is stored in auth.users which requires special permissions
-- 3. Display names should be set manually for better control

-- Create index for faster lookups (optional, but good for performance)
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_display_name 
ON restaurant_staff(display_name);
