# Database Security Fix - Public Access for Customer Features

## 🔍 Problem Identified

The Food Landing page was showing **0 tables** even though tables were created in the admin panel.

### Root Cause: Overly Restrictive RLS Policies

Your Supabase Row Level Security (RLS) policies required **authentication** for viewing:
1. ❌ `tables` - Only authenticated staff could view
2. ❌ `restaurants` - Only authenticated staff could view

This blocked **unauthenticated customers** (people scanning QR codes) from accessing basic restaurant information.

---

## 🛡️ Security Analysis

### What Was Wrong

```sql
-- OLD POLICY (Too restrictive)
create policy "Staff can view tables"
  on tables for select
  using (
    restaurant_id in (
      select restaurant_id from restaurant_staff
      where user_id = auth.uid()  -- ❌ Requires login!
    )
  );
```

**Problem:** Customers scanning QR codes are NOT logged in, so `auth.uid()` returns NULL, and they can't see any tables.

---

## ✅ The Solution

### New Public-Access Policies

I've created a migration file: `supabase/migrations/fix_tables_public_access.sql`

This adds **safe public read access** to:

#### 1. Tables Table
```sql
create policy "Anyone can view tables"
  on tables for select
  using (true);  -- ✅ Anyone can READ
```

**Why this is SAFE:**
- Tables only contain: `id`, `restaurant_id`, `table_number`, `qr_code_id`
- No sensitive or personal data
- Customers NEED this to select a table
- Write operations (INSERT/UPDATE/DELETE) still require admin authentication

#### 2. Restaurants Table
```sql
create policy "Anyone can view restaurants"
  on restaurants for select
  using (true);  -- ✅ Anyone can READ
```

**Why this is SAFE:**
- Restaurant info is public anyway (name, address, phone)
- Customers need to see restaurant details
- Write operations still require admin authentication

---

## 🔐 Security Model Summary

| Table | Read (SELECT) | Write (INSERT/UPDATE/DELETE) |
|-------|--------------|------------------------------|
| `restaurants` | ✅ **Public** | 🔒 Admin only |
| `tables` | ✅ **Public** | 🔒 Admin only |
| `categories` | ✅ **Public** (already) | 🔒 Admin only |
| `menu_items` | ✅ **Public** (already) | 🔒 Admin only |
| `orders` | 🔒 Staff only | ✅ Customers can CREATE |
| `order_items` | 🔒 Staff only | ✅ Created with orders |
| `help_requests` | 🔒 Staff only | ✅ Customers can CREATE |
| `restaurant_staff` | 🔒 Private | 🔒 Superadmin only |

---

## 📋 How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Open your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `supabase/migrations/fix_tables_public_access.sql`
5. Click **Run**

### Option 2: Via Supabase CLI

```bash
supabase db push
```

---

## ✨ After Applying the Fix

The Food Landing page will now:
1. ✅ Fetch restaurant details successfully
2. ✅ Display all available tables
3. ✅ Allow customers to select a table
4. ✅ Navigate to the menu with the selected table ID

---

## 🎯 Design Philosophy

**Customer-Facing Data = Public Read Access**

Any data that customers need to use your service should be publicly readable:
- Restaurant information
- Available tables
- Menu categories
- Menu items with prices

**Admin/Sensitive Data = Protected**

Data that requires authentication:
- Order management (staff only)
- Staff accounts
- Restaurant settings (write access)
- Help requests (view access)

This follows the principle: **"Read what you need, write only what you own"**

---

## 🧪 Testing

After applying the migration:

1. Visit: `http://localhost:5173/food?restaurant=YOUR_RESTAURANT_ID`
2. You should see:
   - Restaurant name displayed
   - "Dine In" card showing correct table count
   - Click "Dine In" → See all tables in a grid
   - Click any table → Navigate to menu

---

## ⚠️ Important Notes

1. **No data is exposed**: We're only allowing READ access to non-sensitive data
2. **Write operations remain protected**: Only authenticated admins can modify data
3. **Existing functionality preserved**: Staff dashboard and admin panel work exactly as before
4. **Customer experience improved**: Unauthenticated users can now use the full ordering flow

---

## 📚 Related Files

- Migration SQL: `supabase/migrations/fix_tables_public_access.sql`
- Landing Page: `src/pages/FoodLanding.tsx`
- Original Setup: `supabase-setup.sql`
- App Routes: `src/App.tsx`
