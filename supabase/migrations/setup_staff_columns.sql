-- Complete setup for staff account creation feature
-- This migration ensures all required columns exist before creating the function
-- Run this BEFORE create_staff_user_function.sql

-- Step 1: Add email column if it doesn't exist
ALTER TABLE restaurant_staff
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Add display_name column if it doesn't exist
ALTER TABLE restaurant_staff 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 3: Update existing records with emails from auth.users (if email column was just added)
UPDATE restaurant_staff rs
SET email = au.email
FROM auth.users au
WHERE rs.user_id = au.id
AND rs.email IS NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_email ON restaurant_staff(email);
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_display_name ON restaurant_staff(display_name);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN restaurant_staff.email IS 'Email address of the staff member, stored for display purposes';
COMMENT ON COLUMN restaurant_staff.display_name IS 'Display name for staff member (shown in UI). Can be set manually by admin.';

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'restaurant_staff'
AND column_name IN ('email', 'display_name')
ORDER BY column_name;
