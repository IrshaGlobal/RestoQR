-- Fix: Allow admins and staff to delete orders
-- This enables the delete button in Admin Dashboard Order Manager

-- Policy for admins to delete orders
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
CREATE POLICY "Admins can delete orders"
ON orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurant_staff
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = orders.restaurant_id
    AND restaurant_staff.role = 'admin'
  )
);

-- Policy for staff to delete orders (if needed)
DROP POLICY IF EXISTS "Staff can delete orders" ON orders;
CREATE POLICY "Staff can delete orders"
ON orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurant_staff
    WHERE restaurant_staff.user_id = auth.uid()
    AND restaurant_staff.restaurant_id = orders.restaurant_id
  )
);
