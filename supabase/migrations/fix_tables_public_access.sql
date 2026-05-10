-- Fix RLS policies to allow public access for customer-facing features
-- This is safe because these tables only contain non-sensitive information
-- and customers need this data to use the menu system

-- ============================================
-- 1. FIX: Allow public access to tables
-- ============================================
-- Drop the existing restrictive policy
drop policy if exists "Staff can view tables" on tables;

-- Drop the existing admin policy (we'll recreate it)
drop policy if exists "Admins can manage tables" on tables;

-- Create a new policy that allows ANYONE to view tables (public read access)
create policy "Anyone can view tables"
  on tables for select
  using (true);

-- Recreate the admin management policy
-- Admins can still insert, update, delete tables
create policy "Admins can manage tables"
  on tables for all
  using (
    restaurant_id in (
      select restaurant_id from restaurant_staff
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 2. FIX: Allow public access to restaurants
-- ============================================
-- Drop the existing restrictive policy
drop policy if exists "Staff can view their restaurants" on restaurants;

-- Drop the existing admin update policy (we'll recreate it)
drop policy if exists "Admins can update restaurants" on restaurants;
drop policy if exists "Admins can manage restaurants" on restaurants;

-- Create a new policy that allows ANYONE to view restaurant info (public read access)
create policy "Anyone can view restaurants"
  on restaurants for select
  using (true);

-- Recreate the admin management policy
-- Only admins can update restaurant settings
create policy "Admins can update restaurants"
  on restaurants for update
  using (
    id in (
      select restaurant_id from restaurant_staff
      where user_id = auth.uid() and role = 'admin'
    )
  );
