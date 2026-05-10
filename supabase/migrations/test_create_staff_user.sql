-- Test script for create_staff_user function
-- Run this in Supabase SQL Editor after creating the function

-- First, verify the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_staff_user';

-- Test 1: Check function parameters
SELECT proname, proargnames, proargtypes
FROM pg_proc
WHERE proname = 'create_staff_user';

-- Test 2: Verify SECURITY DEFINER is set
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'create_staff_user';

-- Expected: prosecdef should be 't' (true)

-- Test 3: Check grants
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'create_staff_user';

-- Expected: Should show 'authenticated' with 'EXECUTE' privilege

-- Manual Test (requires valid restaurant_id and admin user):
-- Uncomment and replace values to test:

/*
-- You must be logged in as an admin user to test this
SELECT * FROM create_staff_user(
  'your-restaurant-uuid-here',  -- Replace with actual restaurant UUID
  'test@example.com',
  'TestPass123',
  'Test User',
  'staff'
);
*/

-- Check recent staff creations for rate limiting test
SELECT 
  rs.*,
  au.email,
  rs.created_at
FROM restaurant_staff rs
LEFT JOIN auth.users au ON rs.user_id = au.id
ORDER BY rs.created_at DESC
LIMIT 20;
