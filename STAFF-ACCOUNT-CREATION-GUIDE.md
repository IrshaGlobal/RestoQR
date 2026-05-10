# Admin Staff Account Creation - Testing Guide

## Overview
This feature allows restaurant admins to create new staff accounts directly from the admin dashboard, eliminating the need for staff members to sign up themselves.

## Features Implemented

### 1. SQL Function (`create_staff_user`)
- **Location**: `supabase/migrations/create_staff_user_function.sql`
- **Security**: SECURITY DEFINER with admin role validation
- **Validations**:
  - Email format validation
  - Password strength (min 8 chars, must contain letter and number)
  - Role validation (admin/staff only)
  - Rate limiting (max 10 accounts per hour per restaurant)
  - Duplicate prevention

### 2. Frontend Component Updates
- **Location**: `src/components/StaffManager.tsx`
- **New Features**:
  - "Create Account" button alongside existing "Add Existing User"
  - Auto-generate secure password option
  - Manual password entry option
  - Credential display via alert and console
  - Form validation

## Setup Instructions

### Step 1: Run the Migration
Execute the SQL migration in your Supabase SQL Editor:

```sql
-- Run this file in Supabase SQL Editor
-- File: supabase/migrations/create_staff_user_function.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

### Step 2: Verify Function Creation
Run this query to verify the function exists:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_staff_user';
```

## Testing Steps

### Test 1: Create New Staff Account (Auto-Generate Password)
1. Login as an admin user
2. Navigate to Admin Dashboard → Staff tab
3. Click "Create Account" button
4. Enter email: `teststaff@example.com`
5. Enter display name: `Test Staff`
6. Select role: `Staff`
7. Keep "Auto-generate secure password" checked
8. Click "Create Account"
9. **Expected**: 
   - Success toast notification
   - Alert dialog showing credentials
   - Console log with credentials
   - New staff member appears in list

### Test 2: Create New Staff Account (Manual Password)
1. Click "Create Account" button
2. Enter email: `teststaff2@example.com`
3. Uncheck "Auto-generate secure password"
4. Enter password: `TestPass123`
5. Click "Create Account"
6. **Expected**: Success message without password display

### Test 3: Add Existing User
1. Click "Add Existing User" button
2. Enter email of user who already has account
3. **Expected**: User added to restaurant if they exist

### Test 4: Validation Tests

#### Invalid Email
- Enter: `invalid-email`
- **Expected**: "Invalid email format" error

#### Weak Password
- Uncheck auto-generate
- Enter: `12345` (less than 8 chars)
- **Expected**: "Password must be at least 8 characters" error

#### Password Without Numbers
- Enter: `abcdefgh`
- **Expected**: "Password must contain at least one letter and one number" error

#### Duplicate User
- Try creating account for same email twice
- **Expected**: "User is already a staff member" error

### Test 5: Rate Limiting
1. Create 10 staff accounts within 1 hour
2. Try to create 11th account
3. **Expected**: "Rate limit exceeded" error

### Test 6: Permission Tests

#### Non-Admin User
1. Login as staff (non-admin) user
2. Navigate to Staff tab
3. **Expected**: "Create Account" and "Add Existing User" buttons not visible

#### Cross-Restaurant Access
1. Admin of Restaurant A tries to create account for Restaurant B
2. **Expected**: "Only restaurant admins can create staff accounts" error

## Security Features

### 1. Role-Based Access Control
- Only users with `admin` role in the specific restaurant can create accounts
- Validated at database level via RLS policies

### 2. Rate Limiting
- Maximum 10 staff account creations per hour per restaurant
- Prevents abuse and spam

### 3. Password Security
- Minimum 8 characters
- Must contain at least one letter and one number
- Auto-generated passwords use secure random generation with special characters

### 4. Input Validation
- Email format validation (regex)
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

### 5. Duplicate Prevention
- Checks if user already exists before creating
- Prevents duplicate staff entries for same restaurant

## Troubleshooting

### Issue: Function not found
**Solution**: Ensure migration was run successfully
```sql
SELECT * FROM pg_proc WHERE proname = 'create_staff_user';
```

### Issue: Permission denied
**Solution**: Verify user has admin role
```sql
SELECT * FROM restaurant_staff 
WHERE user_id = auth.uid() 
AND role = 'admin';
```

### Issue: Rate limit error
**Solution**: Wait 1 hour or check recent creations
```sql
SELECT COUNT(*) 
FROM restaurant_staff 
WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
AND created_at > NOW() - INTERVAL '1 hour';
```

### Issue: Password too weak
**Solution**: Ensure password meets requirements:
- At least 8 characters
- Contains at least one letter (a-z, A-Z)
- Contains at least one number (0-9)

## Best Practices

### For Admins
1. **Use Auto-Generate**: Recommended for stronger passwords
2. **Secure Credential Sharing**: Share passwords through secure channels (not email)
3. **Immediate Password Change**: Instruct staff to change password on first login
4. **Display Names**: Always set display names for better identification

### For Developers
1. **Monitor Rate Limits**: Check logs for rate limit triggers
2. **Audit Trail**: Review staff creation logs periodically
3. **Email Verification**: Consider adding email verification in future
4. **Password Reset**: Implement password reset functionality

## Future Enhancements

1. **Email Notifications**: Send credentials via email (requires email service)
2. **Temporary Passwords**: Force password change on first login
3. **Invitation System**: Send invitation links instead of passwords
4. **Bulk Import**: CSV import for multiple staff members
5. **Activity Logs**: Track who created which accounts
6. **Two-Factor Authentication**: Optional 2FA for staff accounts

## API Reference

### Function Signature
```sql
create_staff_user(
  p_restaurant_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'staff'
)
RETURNS TABLE(success BOOLEAN, user_id UUID, error_message TEXT)
```

### Return Values
- `success`: Boolean indicating if operation succeeded
- `user_id`: UUID of created/existing user (NULL if failed)
- `error_message`: Error description if failed (NULL if success)

### Example Usage
```sql
SELECT * FROM create_staff_user(
  'restaurant-uuid-here',
  'staff@example.com',
  'SecurePass123',
  'John Doe',
  'staff'
);
```

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs for errors
3. Verify RLS policies are correctly configured
4. Check browser console for frontend errors
