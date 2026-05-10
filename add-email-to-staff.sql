-- Add email column to restaurant_staff for better display
-- This stores the email at the time of adding to avoid needing to query auth.users

ALTER TABLE restaurant_staff
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing records with emails from auth.users
UPDATE restaurant_staff rs
SET email = au.email
FROM auth.users au
WHERE rs.user_id = au.id;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_email ON restaurant_staff(email);

-- Add comment
COMMENT ON COLUMN restaurant_staff.email IS 'Email address of the staff member, stored for display purposes';
