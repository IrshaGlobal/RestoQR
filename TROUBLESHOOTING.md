# Troubleshooting Guide - Common Issues & Fixes

## 🔐 Login & Authentication Issues

### Issue: "Invalid email or password" after successful login setup

**Symptoms**: User exists in database, email is confirmed, but login fails with 401 error.

**Solutions**:

1. **Check API Key Configuration**
   ```bash
   # Verify your .env file has correct keys
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Must start with eyJ
   ```

2. **Get Correct Anon Key**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `anon` / `public` key (starts with `eyJ`)
   - NOT the `service_role` key!

3. **Restart Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev  # Restart to load new env vars
   ```

---

### Issue: Login successful but doesn't redirect to admin page

**Symptoms**: Login shows success message but stays on login page or shows blank screen.

**Causes & Fixes**:

1. **User Not Linked to Restaurant**
   ```sql
   -- Check if user is linked
   SELECT * FROM restaurant_staff WHERE user_id = 'YOUR_USER_ID';

   -- If empty, add the link
   INSERT INTO restaurant_staff (user_id, restaurant_id, role)
   VALUES ('YOUR_USER_ID', 'YOUR_RESTAURANT_ID', 'admin');
   ```

2. **Wrong Role in Database**
   ```sql
   -- Check user's role
   SELECT role FROM restaurant_staff WHERE user_id = 'YOUR_USER_ID';

   -- Should be 'admin' for admin access, 'staff' for staff access
   ```

3. **Browser Console Errors**
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Look for "No API key found" or network errors

---

### Issue: "No restaurant access found" error

**Cause**: User exists in auth.users but not in restaurant_staff table.

**Fix**:
```sql
-- Link user to restaurant
INSERT INTO restaurant_staff (user_id, restaurant_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your@email.com'),
  'YOUR_RESTAURANT_ID',
  'admin'  -- or 'staff'
);
```

---

## 🗄️ Database Issues

### Issue: Tables don't exist

**Solution**: Run the setup script
1. Open Supabase SQL Editor
2. Copy entire content of `supabase-setup.sql`
3. Paste and run
4. Verify tables appear in Table Editor

---

### Issue: "relation does not exist" error

**Cause**: Database schema not set up.

**Fix**: Same as above - run `supabase-setup.sql`

---

### Issue: Can't find Restaurant ID

**Find it**:
```sql
SELECT id, name FROM restaurants;
```

**Or via Dashboard**:
- Table Editor → restaurants table → copy the `id` column value

---

## 🌐 Network & Connection Issues

### Issue: "No API key found in request"

**Cause**: Wrong or missing API key in `.env`.

**Fix**:
1. Check `.env` file exists (not just `.env.example`)
2. Verify `VITE_SUPABASE_ANON_KEY` starts with `eyJ`
3. Restart dev server after changes

---

### Issue: CORS errors

**Cause**: Browser blocking requests to Supabase.

**Fix**: Usually not an issue with Supabase. Check:
1. Internet connection
2. Supabase project is active
3. No firewall blocking requests

---

### Issue: Real-time updates not working

**Symptoms**: Orders don't appear in staff dashboard until page refresh.

**Fix**:
1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for these tables:
   - orders
   - help_requests
3. Check browser console for WebSocket errors

---

## 📱 Application Issues

### Issue: Menu doesn't load for customers

**Causes**:

1. **Missing Restaurant ID in URL**
   ```
   Wrong: http://localhost:5173/menu?table=1
   Right: http://localhost:5173/menu?table=1&restaurant=YOUR_RESTAURANT_ID
   ```

2. **Restaurant is Closed**
   ```sql
   -- Check restaurant status
   SELECT is_open FROM restaurants WHERE id = 'YOUR_RESTAURANT_ID';

   -- Open it
   UPDATE restaurants SET is_open = true WHERE id = 'YOUR_RESTAURANT_ID';
   ```

3. **No Menu Items**
   ```sql
   -- Add sample items
   INSERT INTO menu_items (restaurant_id, category_id, name, price, prep_time, is_available)
   VALUES ('YOUR_RESTAURANT_ID', null, 'Test Item', 9.99, 15, true);
   ```

---

### Issue: QR codes don't work

**Check**:
1. QR code URL includes both `table` and `restaurant` parameters
2. Table exists in database:
   ```sql
   SELECT * FROM tables WHERE qr_code_id = 'table-1';
   ```

**Generate correct QR URL**:
```
https://your-app.vercel.app/menu?table=TABLE_NUMBER&restaurant=RESTAURANT_ID
```

---

### Issue: Images not uploading

**Causes**:

1. **Storage Bucket Missing**
   ```sql
   -- Create bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('menu-images', 'menu-images', true);
   ```

2. **File Too Large**
   - Max size: 5MB
   - Allowed types: JPEG, PNG, WebP

3. **Not Authenticated**
   - Only logged-in staff can upload images

---

## 🔧 Build & Development Issues

### Issue: Build fails with TypeScript errors

**Fix**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Issue: "Module not found" errors

**Fix**:
```bash
# Ensure all dependencies installed
npm install

# Check for missing packages
npm audit
```

---

### Issue: Environment variables not loading

**Symptoms**: App shows "Missing Supabase configuration" error.

**Fix**:
1. Ensure file is named `.env` (not `.env.txt`)
2. File should be in project root (same folder as `package.json`)
3. Restart dev server after editing `.env`
4. Check format (no quotes around values):
   ```env
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

---

## 🧪 Diagnostic Commands

### Check User Setup
```sql
-- Complete user diagnostic
SELECT
  au.id as user_id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  rs.role,
  r.name as restaurant_name,
  r.id as restaurant_id
FROM auth.users au
LEFT JOIN restaurant_staff rs ON rs.user_id = au.id
LEFT JOIN restaurants r ON r.id = rs.restaurant_id
WHERE au.email = 'your@email.com';
```

### Check Restaurant Setup
```sql
-- Verify restaurant and related data
SELECT
  r.id as restaurant_id,
  r.name,
  r.is_open,
  COUNT(DISTINCT t.id) as table_count,
  COUNT(DISTINCT c.id) as category_count,
  COUNT(DISTINCT mi.id) as menu_item_count,
  COUNT(DISTINCT rs.user_id) as staff_count
FROM restaurants r
LEFT JOIN tables t ON t.restaurant_id = r.id
LEFT JOIN categories c ON c.restaurant_id = r.id
LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
LEFT JOIN restaurant_staff rs ON rs.restaurant_id = r.id
WHERE r.id = 'YOUR_RESTAURANT_ID'
GROUP BY r.id, r.name, r.is_open;
```

### Test Supabase Connection
Open browser console (F12) and run:
```javascript
// Test connection
fetch('https://ftuihzoapphxmakufpxf.supabase.co/rest/v1/', {
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## 📞 Still Having Issues?

### Checklist Before Seeking Help

- [ ] `.env` file exists with correct keys
- [ ] Dev server restarted after env changes
- [ ] Database setup script (`supabase-setup.sql`) was run
- [ ] User exists in `auth.users` table
- [ ] User is linked in `restaurant_staff` table
- [ ] Email is confirmed (check in Supabase Auth)
- [ ] Browser console checked for errors
- [ ] Network tab shows successful API calls

### Getting Help

1. **Check Browser Console** (F12 → Console tab)
2. **Check Network Tab** (F12 → Network tab → look for failed requests)
3. **Copy Error Messages** exactly as they appear
4. **Provide Context**: What were you trying to do?
5. **Share Diagnostic Output**: Run the SQL queries above

---

## ✅ Verification Checklist

After fixing issues, verify everything works:

- [ ] Can access homepage (`/`)
- [ ] Can login with credentials
- [ ] Redirects to correct dashboard after login
- [ ] Can view menu as customer (`/menu?table=1&restaurant=ID`)
- [ ] Can place order as customer
- [ ] Order appears in staff dashboard
- [ ] Can update order status as staff
- [ ] Can manage menu as admin
- [ ] QR codes generate correctly
- [ ] Real-time updates work (new orders appear instantly)

---

**Last Updated**: May 2026
**For more help**: See SECURITY.md and PRODUCTION-CHECKLIST.md
