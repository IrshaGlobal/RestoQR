-- Run this SQL to check if your user exists and is properly configured

-- Check if user exists in auth.users
SELECT 
  id as user_id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED'
    ELSE '✅ CONFIRMED'
  END as status
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with your actual email

-- Check if user is linked to a restaurant
SELECT 
  rs.id,
  rs.user_id,
  rs.restaurant_id,
  rs.role,
  r.name as restaurant_name
FROM restaurant_staff rs
JOIN restaurants r ON r.id = rs.restaurant_id
WHERE rs.user_id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE' -- Replace with your email
);
