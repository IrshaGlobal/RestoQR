# Staff Account Creation - Quick Reference

## For Admins

### How to Create a Staff Account

1. **Navigate** to Admin Dashboard → Staff tab
2. **Click** "Create Account" button
3. **Fill in**:
   - Email address (required)
   - Display name (optional)
   - Role: Staff or Admin
4. **Password Options**:
   - ✅ Auto-generate (recommended) - creates secure 12-char password
   - ⬜ Manual entry - enter your own password (min 8 chars, must include letter + number)
5. **Click** "Create Account"
6. **Share credentials** with staff member securely

### Password Requirements
- Minimum 8 characters
- Must contain at least one letter (a-z, A-Z)
- Must contain at least one number (0-9)
- Auto-generated passwords also include special characters (!@#$%^&*)

### Important Notes
⚠️ **Credentials are shown only once** - save them immediately
⚠️ **Share passwords securely** - don't send via regular email
⚠️ **Rate limit** - max 10 accounts per hour

---

## For Developers

### Deploy Migration

```bash
# Option 1: CLI
supabase db push

# Option 2: SQL Editor
# Run: supabase/migrations/create_staff_user_function.sql
```

### Verify Installation

```sql
-- Check function exists
SELECT * FROM pg_proc WHERE proname = 'create_staff_user';

-- Test function (as admin user)
SELECT * FROM create_staff_user(
  'restaurant-uuid',
  'test@example.com',
  'TestPass123',
  'Test User',
  'staff'
);
```

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

### Frontend Usage

```typescript
const { data, error } = await supabase.rpc('create_staff_user', {
  p_restaurant_id: restaurantId,
  p_email: email,
  p_password: password,
  p_display_name: displayName || null,
  p_role: role
})

if (data?.[0]?.success) {
  console.log('User ID:', data[0].user_id)
} else {
  console.error('Error:', data?.[0]?.error_message)
}
```

---

## Security Features

✅ Admin-only access (validated at DB level)
✅ Rate limiting (10/hour/restaurant)
✅ Email format validation
✅ Password strength requirements
✅ Duplicate prevention
✅ SQL injection protection
✅ Cross-restaurant isolation

---

## Common Errors

| Error | Solution |
|-------|----------|
| "Invalid email format" | Use proper email format (user@domain.com) |
| "Password must be at least 8 characters" | Increase password length |
| "Password must contain..." | Add both letters and numbers |
| "User already exists" | User has account, use "Add Existing User" instead |
| "Rate limit exceeded" | Wait 1 hour before creating more accounts |
| "Only restaurant admins..." | Login with admin account |

---

## Files Modified

- ✅ `supabase/migrations/create_staff_user_function.sql` (NEW)
- ✅ `src/components/StaffManager.tsx` (UPDATED)
- ✅ `STAFF-ACCOUNT-CREATION-GUIDE.md` (NEW)
- ✅ `STAFF-ACCOUNT-CREATION-SUMMARY.md` (NEW)

---

## Testing Checklist

- [ ] Migration executed
- [ ] Function verified in database
- [ ] Admin can see "Create Account" button
- [ ] Create account with auto-password works
- [ ] Create account with manual password works
- [ ] Email validation works
- [ ] Password validation works
- [ ] New staff can login
- [ ] Rate limiting works (try 11 creations)

---

## Quick Links

- Full Guide: `STAFF-ACCOUNT-CREATION-GUIDE.md`
- Summary: `STAFF-ACCOUNT-CREATION-SUMMARY.md`
- Test Script: `supabase/migrations/test_create_staff_user.sql`

---

## Support

Issues? Check:
1. Browser console for errors
2. Supabase logs for function errors
3. User has admin role in restaurant_staff table
4. Migration was executed successfully
