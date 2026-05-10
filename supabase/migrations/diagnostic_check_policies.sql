-- Diagnostic Query: Check current RLS policies for tables and restaurants
-- Run this in Supabase SQL Editor to see what policies are currently active

-- Check policies on tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'tables'
ORDER BY policyname;

-- Check policies on restaurants  
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'restaurants'
ORDER BY policyname;

-- Test: Try to select tables as anonymous user (simulates customer)
-- This should return rows if public access is working
SELECT 
  id,
  restaurant_id,
  table_number,
  qr_code_id
FROM tables
LIMIT 5;

-- Count tables per restaurant
SELECT 
  restaurant_id,
  COUNT(*) as table_count
FROM tables
GROUP BY restaurant_id
ORDER BY restaurant_id;
