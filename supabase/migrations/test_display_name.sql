-- Quick Test: Verify add_staff_display_name migration works
-- Run this AFTER running add_staff_display_name.sql

-- Check if column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurant_staff' 
  AND column_name = 'display_name';

-- Check existing staff members
SELECT id, user_id, role, display_name 
FROM restaurant_staff 
LIMIT 5;

-- Test updating a display name manually
-- UPDATE restaurant_staff 
-- SET display_name = 'John Admin' 
-- WHERE role = 'admin' 
-- LIMIT 1;
