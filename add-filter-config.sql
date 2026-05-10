-- Add filter configuration to restaurants table
-- This allows admins to control which filters are visible on the customer menu

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS filter_config jsonb DEFAULT '{
  "dietary": true,
  "sort": true
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN restaurants.filter_config IS 'JSON configuration for customer menu filter visibility. Keys: dietary (boolean), sort (boolean)';
