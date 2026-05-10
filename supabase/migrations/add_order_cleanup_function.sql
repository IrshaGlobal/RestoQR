-- Migration: Add order cleanup function and retention configuration
-- Purpose: Enable automatic and manual cleanup of old delivered orders
-- Date: 2026-05-08

-- ============================================
-- 1. Add retention_config to restaurants table
-- ============================================
ALTER TABLE restaurants 
ADD COLUMN retention_config JSONB DEFAULT '{
  "order_retention_days": 30,
  "auto_cleanup_enabled": true,
  "last_cleanup_at": null
}'::jsonb;

COMMENT ON COLUMN restaurants.retention_config IS 'Configuration for order retention and cleanup policies';

-- ============================================
-- 2. Create cleanup_old_orders function
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_orders(
  p_restaurant_id UUID,
  p_days_to_keep INTEGER DEFAULT 30
)
RETURNS TABLE(deleted_orders BIGINT, deleted_items BIGINT) AS $$
DECLARE
  v_deleted_orders BIGINT;
  v_deleted_items BIGINT;
BEGIN
  -- Count and delete order_items first (foreign key constraint)
  WITH items_to_delete AS (
    SELECT oi.id
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = p_restaurant_id 
      AND o.status = 'delivered'
      AND o.created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL
  )
  DELETE FROM order_items oi
  USING items_to_delete itd
  WHERE oi.id = itd.id;
  
  GET DIAGNOSTICS v_deleted_items = ROW_COUNT;
  
  -- Then delete orders
  DELETE FROM orders 
  WHERE restaurant_id = p_restaurant_id 
    AND status = 'delivered'
    AND created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_orders = ROW_COUNT;
  
  -- Update last_cleanup_at timestamp
  UPDATE restaurants
  SET retention_config = jsonb_set(
    retention_config,
    '{last_cleanup_at}',
    to_jsonb(NOW()::text)
  )
  WHERE id = p_restaurant_id;
  
  RETURN QUERY SELECT v_deleted_orders, v_deleted_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_orders IS 'Deletes delivered orders older than specified days. Returns count of deleted orders and order items.';

-- ============================================
-- 3. Grant execute permission to authenticated users
-- ============================================
GRANT EXECUTE ON FUNCTION cleanup_old_orders(UUID, INTEGER) TO authenticated;

-- ============================================
-- 4. Optional: Setup cron job for automatic cleanup (requires pg_cron extension)
-- ============================================
-- Uncomment the following if you have pg_cron enabled in Supabase:
/*
SELECT cron.schedule(
  'cleanup-old-orders-daily',
  '0 2 * * *',  -- Run daily at 2 AM
  $$
    SELECT cleanup_old_orders(id, (retention_config->>'order_retention_days')::INTEGER)
    FROM restaurants
    WHERE (retention_config->>'auto_cleanup_enabled')::BOOLEAN = true
  $$
);
*/

-- ============================================
-- 5. Create helper function to get cleanup stats
-- ============================================
CREATE OR REPLACE FUNCTION get_order_cleanup_stats(p_restaurant_id UUID)
RETURNS TABLE(
  total_orders BIGINT,
  delivered_orders BIGINT,
  orders_eligible_for_cleanup BIGINT,
  estimated_cleanup_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE True) as total_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
    COUNT(*) FILTER (
      WHERE status = 'delivered' 
        AND created_at < NOW() - (
          SELECT COALESCE((retention_config->>'order_retention_days')::INTEGER, 30)
          FROM restaurants 
          WHERE id = p_restaurant_id
        ) || ' days'::INTERVAL
    ) as orders_eligible_for_cleanup,
    MIN(created_at) + (
      SELECT COALESCE((retention_config->>'order_retention_days')::INTEGER, 30)
      FROM restaurants 
      WHERE id = p_restaurant_id
    ) || ' days'::INTERVAL as estimated_cleanup_date
  FROM orders
  WHERE restaurant_id = p_restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_order_cleanup_stats(UUID) TO authenticated;
