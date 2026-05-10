-- Create delivery_settings table for admin-controlled delivery configuration
-- This allows admins to enable/disable delivery and set fees without code changes

CREATE TABLE IF NOT EXISTS delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  delivery_fee DECIMAL DEFAULT 5.00,
  minimum_order_amount DECIMAL DEFAULT 15.00,
  estimated_delivery_minutes INTEGER DEFAULT 30,
  max_delivery_distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- Enable RLS
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can view delivery settings (customers need to know if delivery is available)
CREATE POLICY "Anyone can view delivery settings"
  ON delivery_settings FOR SELECT
  USING (true);

-- Only admins can update delivery settings
CREATE POLICY "Admins can update delivery settings"
  ON delivery_settings FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert delivery settings
CREATE POLICY "Admins can insert delivery settings"
  ON delivery_settings FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete delivery settings
CREATE POLICY "Admins can delete delivery settings"
  ON delivery_settings FOR DELETE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster lookups by restaurant_id
CREATE INDEX IF NOT EXISTS idx_delivery_settings_restaurant_id 
  ON delivery_settings(restaurant_id);

-- Insert default delivery settings for existing restaurants
-- This ensures every restaurant has delivery settings configured
INSERT INTO delivery_settings (restaurant_id, is_enabled, delivery_fee, minimum_order_amount, estimated_delivery_minutes)
SELECT 
  id as restaurant_id,
  true as is_enabled,
  5.00 as delivery_fee,
  15.00 as minimum_order_amount,
  30 as estimated_delivery_minutes
FROM restaurants
ON CONFLICT (restaurant_id) DO NOTHING;

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_delivery_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delivery_settings_updated_at
  BEFORE UPDATE ON delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_settings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE delivery_settings IS 'Delivery configuration settings per restaurant';
COMMENT ON COLUMN delivery_settings.is_enabled IS 'Whether delivery is currently enabled for this restaurant';
COMMENT ON COLUMN delivery_settings.delivery_fee IS 'Fixed delivery fee charged to customers';
COMMENT ON COLUMN delivery_settings.minimum_order_amount IS 'Minimum order amount required for delivery';
COMMENT ON COLUMN delivery_settings.estimated_delivery_minutes IS 'Estimated delivery time in minutes';
COMMENT ON COLUMN delivery_settings.max_delivery_distance_km IS 'Maximum delivery distance in kilometers (optional, for future use)';
