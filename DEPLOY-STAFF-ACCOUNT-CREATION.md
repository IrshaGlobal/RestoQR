# Deploy Staff Account Creation Feature

## Quick Deployment Steps

### Step 1: Run Column Setup Migration
First, ensure the required columns exist in the database:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/setup_staff_columns.sql
```

This will:
- Add `email` column if it doesn't exist
- Add `display_name` column if it doesn't exist
- Update existing records with email data
- Create performance indexes

### Step 2: Run Function Creation Migration
Then, create the staff user creation function:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/create_staff_user_function.sql
```

This creates the secure function that admins will use to create staff accounts.

### Step 3: Verify Installation

Run these checks:

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurant_staff' 
AND column_name IN ('email', 'display_name');

-- Expected result: Both columns should be listed

-- Check function exists
SELECT proname 
FROM pg_proc 
WHERE proname = 'create_staff_user';

-- Expected result: create_staff_user should be listed
```

### Step 4: Test the Feature

1. Login as admin
2. Go to Admin Dashboard → Staff tab
3. Click "Create Account"
4. Fill in the form
5. Create a test account
6. Verify it works!

---

## If You Get Errors

### Error: "column 'email' does not exist"
**Solution**: Run `setup_staff_columns.sql` first (Step 1)

### Error: "column reference is ambiguous"
**Solution**: Already fixed in the latest version of `create_staff_user_function.sql`

### Error: "function does not exist"
**Solution**: Run `create_staff_user_function.sql` (Step 2)

---

## What Each File Does

### setup_staff_columns.sql
- Adds missing columns to `restaurant_staff` table
- Safe to run multiple times (uses IF NOT EXISTS)
- Updates existing data
- Creates indexes for performance

### create_staff_user_function.sql
- Creates the main function for account creation
- Checks if columns exist before using them
- Works with or without email/display_name columns
- Includes all security features

---

## Order Matters!

✅ **Correct Order:**
1. Run `setup_staff_columns.sql`
2. Run `create_staff_user_function.sql`

❌ **Wrong Order:**
- Running function before columns are added will still work (function is defensive)
- But you won't get email/display_name features until columns are added

---

## Using Supabase CLI

If you prefer CLI over SQL Editor:

```bash
# Push all migrations
supabase db push

# Or push specific files
supabase db push --include-all
```

---

## Troubleshooting

### Columns Still Missing After Running setup_staff_columns.sql?

Check if migration ran successfully:
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'restaurant_staff';
```

Look for `email` and `display_name` in the results.

### Function Not Working?

Check function exists and has correct permissions:
```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'create_staff_user';

-- prosecdef should be 't' (true)
```

### Still Getting Errors?

1. Check browser console for frontend errors
2. Check Supabase logs for database errors
3. Verify you're logged in as an admin user
4. Make sure both migrations ran without errors

---

## Need Help?

Check these files for detailed information:
- `STAFF-ACCOUNT-CREATION-GUIDE.md` - Complete usage guide
- `STAFF-ACCOUNT-CREATION-QUICK-REF.md` - Quick reference
- `STAFF-ACCOUNT-CREATION-CHECKLIST.md` - Full deployment checklist
