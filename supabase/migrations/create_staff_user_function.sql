-- Create secure function for admin to create staff user accounts
-- This function allows restaurant admins to create new user accounts for staff members
-- SECURITY: Only callable by authenticated users with admin role in the specific restaurant

CREATE OR REPLACE FUNCTION create_staff_user(
  p_restaurant_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'staff'
)
RETURNS TABLE(success BOOLEAN, user_id UUID, error_message TEXT) AS $$
DECLARE
  v_admin_check BOOLEAN;
  v_existing_user UUID;
  v_new_user_id UUID;
  v_recent_count INTEGER;
  v_email_valid BOOLEAN;
  v_has_email_column BOOLEAN;
  v_has_display_name_column BOOLEAN;
BEGIN
  -- Validate inputs
  IF p_email IS NULL OR p_email = '' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Email is required'::TEXT;
    RETURN;
  END IF;

  -- Validate email format
  v_email_valid := p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
  IF NOT v_email_valid THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid email format'::TEXT;
    RETURN;
  END IF;

  IF p_password IS NULL OR LENGTH(p_password) < 8 THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Password must be at least 8 characters'::TEXT;
    RETURN;
  END IF;

  -- Check password strength (at least one letter and one number)
  IF NOT (p_password ~ '[A-Za-z]' AND p_password ~ '[0-9]') THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Password must contain at least one letter and one number'::TEXT;
    RETURN;
  END IF;

  IF p_role NOT IN ('admin', 'staff') THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid role. Must be admin or staff'::TEXT;
    RETURN;
  END IF;

  -- Check if calling user is an admin of this restaurant
  SELECT EXISTS (
    SELECT 1 FROM restaurant_staff rs
    WHERE rs.user_id = auth.uid()
    AND rs.restaurant_id = p_restaurant_id
    AND rs.role = 'admin'
  ) INTO v_admin_check;

  IF NOT v_admin_check THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Only restaurant admins can create staff accounts'::TEXT;
    RETURN;
  END IF;

  -- Check if email and display_name columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_staff'
    AND column_name = 'email'
  ) INTO v_has_email_column;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_staff'
    AND column_name = 'display_name'
  ) INTO v_has_display_name_column;

  -- Check rate limiting - max 10 staff creations per hour per restaurant
  SELECT COUNT(*) INTO v_recent_count
  FROM restaurant_staff rs
  WHERE rs.restaurant_id = p_restaurant_id
  AND rs.created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count >= 10 THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Rate limit exceeded. Maximum 10 staff accounts per hour per restaurant'::TEXT;
    RETURN;
  END IF;

  -- Check if user already exists in auth.users
  SELECT id INTO v_existing_user
  FROM auth.users
  WHERE email = LOWER(p_email);

  IF v_existing_user IS NOT NULL THEN
    -- User already exists, check if they're already staff of this restaurant
    IF EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.user_id = v_existing_user
      AND rs.restaurant_id = p_restaurant_id
    ) THEN
      RETURN QUERY SELECT FALSE, NULL::UUID, 'User is already a staff member of this restaurant'::TEXT;
      RETURN;
    ELSE
      -- User exists but not in this restaurant, add them
      IF v_has_email_column AND v_has_display_name_column THEN
        INSERT INTO restaurant_staff (user_id, restaurant_id, role, email, display_name)
        VALUES (v_existing_user, p_restaurant_id, p_role, LOWER(p_email), p_display_name)
        ON CONFLICT (user_id, restaurant_id) DO NOTHING;
      ELSIF v_has_email_column THEN
        INSERT INTO restaurant_staff (user_id, restaurant_id, role, email)
        VALUES (v_existing_user, p_restaurant_id, p_role, LOWER(p_email))
        ON CONFLICT (user_id, restaurant_id) DO NOTHING;
      ELSE
        INSERT INTO restaurant_staff (user_id, restaurant_id, role)
        VALUES (v_existing_user, p_restaurant_id, p_role)
        ON CONFLICT (user_id, restaurant_id) DO NOTHING;
      END IF;
      
      RETURN QUERY SELECT TRUE, v_existing_user, 'Existing user added to restaurant'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Create new user in auth.users using Supabase's auth API
  -- Note: We need to use the auth.users table directly since we can't call auth.signup from SQL
  -- This requires the function to run with elevated privileges
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    LOWER(p_email),
    crypt(p_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    CASE WHEN p_display_name IS NOT NULL THEN json_build_object('display_name', p_display_name) ELSE '{}'::json END,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_new_user_id;

  -- Add user to restaurant_staff (handle missing columns gracefully)
  IF v_has_email_column AND v_has_display_name_column THEN
    INSERT INTO restaurant_staff (user_id, restaurant_id, role, email, display_name)
    VALUES (v_new_user_id, p_restaurant_id, p_role, LOWER(p_email), p_display_name);
  ELSIF v_has_email_column THEN
    INSERT INTO restaurant_staff (user_id, restaurant_id, role, email)
    VALUES (v_new_user_id, p_restaurant_id, p_role, LOWER(p_email));
  ELSE
    INSERT INTO restaurant_staff (user_id, restaurant_id, role)
    VALUES (v_new_user_id, p_restaurant_id, p_role);
  END IF;

  RETURN QUERY SELECT TRUE, v_new_user_id, 'Staff account created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_staff_user(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION create_staff_user IS 'Allows restaurant admins to create new staff user accounts. Requires admin role in the specified restaurant. Includes rate limiting, email validation, and password strength checks.';
