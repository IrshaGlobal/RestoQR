# Troubleshooting: Food Page Shows 0 Tables

## Quick Diagnostic Steps

### Step 1: Check Browser Console

1. Open your Food page: `http://localhost:5173/food?restaurant=YOUR_RESTAURANT_ID`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for these log messages:
   ```
   Fetching data for restaurant: [your-restaurant-id]
   Restaurant data: {...}
   Fetching tables for restaurant: [your-restaurant-id]
   Tables data: [...]
   Number of tables found: X
   ```

**What to check:**
- ❌ If you see "Restaurant fetch error" → RLS issue with restaurants table
- ❌ If you see "Tables fetch error" → RLS issue with tables table  
- ❌ If "Number of tables found: 0" → Either no tables exist OR RLS blocking access
- ✅ If you see table data but count is 0 → No tables in database for that restaurant

---

### Step 2: Verify Migration Was Applied

Run this query in Supabase SQL Editor:

```sql
-- Check current policies on tables table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tables';
```

**Expected Result (after migration):**
```
policyname                  | cmd   | qual
----------------------------|-------|------
Anyone can view tables      | SELECT| true
Admins can manage tables    | ALL   | (admin check)
```

**If you see this instead (OLD policies):**
```
policyname                  | cmd   | qual
----------------------------|-------|------
Staff can view tables       | SELECT| (auth check)  ← PROBLEM!
Admins can manage tables    | ALL   | (admin check)
```

→ The migration was NOT applied successfully!

---

### Step 3: Run Diagnostic Query

Copy and paste the entire contents of:
`supabase/migrations/diagnostic_check_policies.sql`

Into Supabase SQL Editor and run it.

**Check the results:**

1. **Policies section** - Should show "Anyone can view tables" policy
2. **Test SELECT** - Should return some rows (proves tables exist)
3. **Count by restaurant** - Should show your restaurant has tables

---

### Step 4: Common Issues & Solutions

#### Issue A: Migration Not Applied
**Symptoms:** Still seeing old policy names in diagnostic query

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy ENTIRE contents of `fix_tables_public_access.sql`
3. Paste and click **Run**
4. Check for success message
5. Refresh your Food page

---

#### Issue B: Wrong Restaurant ID
**Symptoms:** Console shows "Number of tables found: 0" but no errors

**Solution:**
1. Verify the restaurant ID in your URL matches your actual restaurant
2. Run this in SQL Editor to find your restaurant ID:
   ```sql
   SELECT id, name FROM restaurants;
   ```
3. Update URL: `http://localhost:5173/food?restaurant=CORRECT-ID`

---

#### Issue C: No Tables Created Yet
**Symptoms:** Diagnostic query shows 0 tables for your restaurant

**Solution:**
1. Go to Admin Dashboard
2. Navigate to Tables & QR Codes section
3. Add at least one table
4. Refresh Food page

---

#### Issue D: RLS Still Blocking (Policy Conflict)
**Symptoms:** Error message mentions "new row violates row-level security policy"

**Solution:**
Run this in SQL Editor to completely reset policies:

```sql
-- Drop ALL policies on tables
DROP POLICY IF EXISTS "Staff can view tables" ON tables;
DROP POLICY IF EXISTS "Admins can manage tables" ON tables;
DROP POLICY IF EXISTS "Anyone can view tables" ON tables;

-- Drop ALL policies on restaurants
DROP POLICY IF EXISTS "Staff can view their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can manage restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;

-- Recreate clean policies
CREATE POLICY "Anyone can view tables" ON tables FOR SELECT USING (true);

CREATE POLICY "Admins can manage tables" ON tables FOR ALL USING (
  restaurant_id IN (
    SELECT restaurant_id FROM restaurant_staff
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);

CREATE POLICY "Admins can update restaurants" ON restaurants FOR UPDATE USING (
  id IN (
    SELECT restaurant_id FROM restaurant_staff
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

#### Issue E: Browser Cache
**Symptoms:** Changes not reflecting even after migration

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache
3. Or open in incognito/private window

---

### Step 5: Manual Test in Supabase

To verify the fix works, run this test as anonymous user:

```sql
-- This simulates what the Food page does
-- Replace 'YOUR-RESTAURANT-ID' with actual ID
SELECT * FROM tables 
WHERE restaurant_id = 'YOUR-RESTAURANT-ID'
ORDER BY table_number;
```

**Expected:** Should return all tables for that restaurant

**If it returns 0 rows:**
- Check if tables exist: `SELECT COUNT(*) FROM tables;`
- Check restaurant_id matches: `SELECT DISTINCT restaurant_id FROM tables;`

---

## Quick Fix Checklist

- [ ] Migration SQL ran without errors
- [ ] Diagnostic query shows "Anyone can view tables" policy
- [ ] Browser console shows no errors
- [ ] Restaurant ID in URL is correct
- [ ] Tables actually exist in database
- [ ] Browser cache cleared / hard refresh done
- [ ] Tested in incognito window

---

## Still Not Working?

Share these details:

1. **Browser console output** (copy all logs from console)
2. **Diagnostic query results** (screenshot or copy results)
3. **Your restaurant ID** (from URL)
4. **Table count** (from admin panel - how many tables created?)

This will help identify the exact issue!
