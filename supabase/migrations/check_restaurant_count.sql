-- Check how many restaurants exist in the system
SELECT 
  id,
  name,
  created_at
FROM restaurants
ORDER BY created_at;

-- Count total restaurants
SELECT COUNT(*) as total_restaurants FROM restaurants;

-- Show all tables across all restaurants
SELECT 
  t.id,
  t.table_number,
  t.restaurant_id,
  r.name as restaurant_name
FROM tables t
LEFT JOIN restaurants r ON t.restaurant_id = r.id
ORDER BY r.name, t.table_number;
