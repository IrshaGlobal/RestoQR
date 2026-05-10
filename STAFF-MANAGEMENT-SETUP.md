# Staff Management Setup

This document explains how to set up and use the Staff Management feature in the Restaurant QR Ordering System.

## Database Setup

To enable the Staff Management feature, you need to run two SQL migrations in your Supabase SQL Editor:

### 1. Add Email Column to restaurant_staff

Run the SQL in `add-email-to-staff.sql`:

```sql
-- Add email column to restaurant_staff for better display
ALTER TABLE restaurant_staff
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing records with emails from auth.users
UPDATE restaurant_staff rs
SET email = au.email
FROM auth.users au
WHERE rs.user_id = au.id;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_email ON restaurant_staff(email);
```

### 2. Create User Lookup Function

Run the SQL in `add-user-lookup-function.sql`:

```sql
-- Function to look up user ID by email (for staff management)
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
```

## How It Works

### Adding Staff Members

1. **Prerequisite**: The staff member must have an account first. They need to sign up at `/login`.

2. **Admin Access**: Only users with the `admin` role can add new staff members.

3. **Process**:
   - Navigate to Admin Dashboard → Staff tab
   - Click "Add Staff" button
   - Enter the staff member's email address
   - Select their role (Staff or Admin)
   - Click "Add Staff"

4. **What happens**:
   - The system looks up the user by email using the `get_user_id_by_email` function
   - If found, it creates a record in `restaurant_staff` linking them to your restaurant
   - Their email is stored for display purposes
   - They immediately gain access to the restaurant dashboard

### Managing Staff

**View Staff**: All staff members are displayed with their:
- Email address
- Role (Admin/Staff)
- Date added
- Current user indicator ("You" badge)

**Change Roles**:
- Use the dropdown to switch between "Staff" and "Admin"
- Changes take effect immediately
- You cannot demote the last admin (safety measure)

**Remove Staff**:
- Click the trash icon next to a staff member
- Confirm the deletion
- They will lose access to your restaurant immediately
- You cannot remove yourself
- You cannot remove the last admin

### Roles and Permissions

**Staff Role**:
- Can view and manage orders
- Can update order status
- Can view tables and QR codes
- Can manage menu items (view only)
- Cannot manage other staff members

**Admin Role**:
- All Staff permissions PLUS:
- Can add/remove staff members
- Can change staff roles
- Can manage all aspects of the restaurant
- Can delete tables and categories

## Security Features

1. **Row Level Security (RLS)**: The database enforces that only admins can modify staff records.

2. **Last Admin Protection**: The system prevents removing or demoting the last admin to ensure there's always someone with admin access.

3. **Email Validation**: Email addresses are validated before adding staff members.

4. **Duplicate Prevention**: The system checks if a user is already a staff member before adding them.

## Troubleshooting

### "User not found" Error
- The user must sign up first at `/login`
- Make sure you're entering the correct email address
- Check for typos in the email

### "Already a staff member" Error
- The user is already added to your restaurant
- Check the staff list to see if they're there
- They might be listed with a different role

### Cannot Remove/Demote Last Admin
- This is a safety feature
- Add another admin first before removing the current one
- There must always be at least one admin per restaurant

### Staff Member Can't Access Dashboard
- Make sure they've logged in after being added
- Check that they're accessing the correct URL (`/admin`)
- Verify their role in the database if issues persist

## Future Enhancements

Potential improvements for the Staff Management feature:
- Invite system (send email invitations to non-users)
- Staff activity logs
- Permission customization
- Temporary staff accounts
- Staff scheduling/integration
