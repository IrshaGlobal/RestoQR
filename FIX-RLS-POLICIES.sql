-- Fix RLS Policy Recursion Issue
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies on restaurant_staff
DROP POLICY IF EXISTS "Users can view their staff memberships" ON restaurant_staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON restaurant_staff;
DROP POLICY IF EXISTS "Users can view their own staff record" ON restaurant_staff;
DROP POLICY IF EXISTS "Admins can manage all staff" ON restaurant_staff;

-- Step 2: Create simple, non-recursive policies
CREATE POLICY "staff_select_policy"
  ON restaurant_staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "staff_insert_policy"
  ON restaurant_staff FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "staff_update_policy"
  ON restaurant_staff FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "staff_delete_policy"
  ON restaurant_staff FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 3: Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'restaurant_staff';

-- You should see 4 policies listed above
