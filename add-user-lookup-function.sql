-- Function to look up user ID by email (for staff management)
-- This allows staff admins to find users by email without needing admin API access

CREATE OR REPLACE FUNCTION get_user_id_by_email(email_input TEXT)
RETURNS TABLE(user_id UUID) AS $$
BEGIN
  -- Query auth.users table to find user by email
  RETURN QUERY
  SELECT id FROM auth.users
  WHERE email = LOWER(email_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;

-- Comment explaining the function
COMMENT ON FUNCTION get_user_id_by_email IS 'Allows authenticated users to look up user IDs by email address. Used for adding staff members to restaurants.';
