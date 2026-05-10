-- Fix order_type for existing orders
-- This ensures all orders have the correct order_type value

-- Step 0: Drop any existing check constraints on order_type
-- (They may have been created with wrong settings)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_order_type;

-- Step 1: Check current distribution of order_type values
SELECT 
  order_type,
  COUNT(*) as count,
  CASE 
    WHEN table_id IS NOT NULL THEN 'Has Table'
    ELSE 'No Table'
  END as table_status
FROM orders
GROUP BY order_type, table_status
ORDER BY order_type;

-- Step 2: Fix orders that should be 'dinein' (have table_id but wrong order_type)
UPDATE orders 
SET order_type = 'dinein'
WHERE table_id IS NOT NULL 
  AND (order_type IS NULL OR order_type NOT IN ('dinein', 'takeout', 'delivery'));

-- Step 3: Fix orders that should be 'delivery' or 'takeout' (no table_id)
-- These are harder to determine automatically, so we'll set them based on customer info
UPDATE orders 
SET order_type = CASE
  WHEN delivery_address IS NOT NULL THEN 'delivery'
  WHEN customer_name IS NOT NULL THEN 'takeout'
  ELSE 'dinein'  -- Default fallback
END
WHERE table_id IS NULL 
  AND (order_type IS NULL OR order_type NOT IN ('dinein', 'takeout', 'delivery'));

-- Step 4: Verify the fix
SELECT 
  order_type,
  COUNT(*) as count
FROM orders
GROUP BY order_type
ORDER BY order_type;

-- Step 5: Re-add the check constraint (now that all data is valid)
ALTER TABLE orders ADD CONSTRAINT valid_order_type 
  CHECK (order_type IN ('dinein', 'takeout', 'delivery'));
