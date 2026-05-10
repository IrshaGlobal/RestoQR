# Quick Start Guide - Restaurant QR Ordering SaaS

Your Restaurant QR Ordering SaaS is now **fully functional** with live Supabase integration! 

## What's Been Implemented

✅ **Complete Supabase Integration** - All demo data replaced with real database queries  
✅ **Authentication System** - Email/password login with role-based access control  
✅ **Real-time Updates** - Orders and help requests update instantly via Supabase Realtime  
✅ **Image Upload** - Menu item images upload to Supabase Storage  
✅ **QR Code Generation** - Downloadable QR codes for each table  
✅ **Full CRUD Operations** - Complete admin dashboard for managing everything  
✅ **Error Handling** - Toast notifications and proper error messages throughout  
✅ **Loading States** - Skeleton loaders for better UX  
✅ **Route Protection** - Admin/staff routes protected by authentication  

## Next Steps to Go Live

### 1. Set Up Supabase (5 minutes)

1. **Create a Supabase project:**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Choose your organization and region
   - Wait for provisioning (~2 minutes)

2. **Run the database setup:**
   - In your Supabase dashboard, go to **SQL Editor**
   - Copy the entire contents of `supabase-setup.sql` from this project
   - Paste and run it
   - This creates all tables, policies, and storage buckets

3. **Get your API credentials:**
   - Go to **Project Settings > API**
   - Copy the **Project URL** and **anon public** key

### 2. Configure Environment Variables (2 minutes)

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Create Your First Restaurant & Admin User (3 minutes)

1. **Create a restaurant:**
   - In Supabase dashboard, go to **SQL Editor**
   - Run:
     ```sql
     INSERT INTO restaurants (name, currency, is_open) 
     VALUES ('My Restaurant', '$', true) 
     RETURNING id;
     ```
   - Copy the returned restaurant ID

2. **Create an admin user:**
   - Go to **Authentication > Users**
   - Click "Add User" > "Create new user"
   - Enter email (e.g., `admin@myrestaurant.com`) and password
   - Click "Create user"
   - Copy the user ID

3. **Link user to restaurant as admin:**
   - Go back to **SQL Editor**
   - Run (replace placeholders):
     ```sql
     INSERT INTO restaurant_staff (user_id, restaurant_id, role)
     VALUES ('your-user-id-here', 'your-restaurant-id-here', 'admin');
     ```

### 4. Test Locally (2 minutes)

```bash
npm run dev
```

Open http://localhost:5173 and test:

1. **Login** at `/login` with your admin credentials
2. **Admin Dashboard** - Add menu items, create tables, generate QR codes
3. **Customer Menu** - Visit `/menu?table={table-id}&restaurant={restaurant-id}`
4. **Staff Dashboard** - Login as staff and watch orders appear in real-time

### 5. Deploy to Production (10 minutes)

**Option A: Vercel (Recommended)**
```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# Then deploy on Vercel
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Add environment variables in dashboard
# 4. Click Deploy
```

**Option B: Netlify**
```bash
npm run build
# Drag dist folder to netlify.com/drop
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## Testing the Full Flow

### Customer Journey
1. Scan QR code or visit: `http://yoursite.com/menu?table=1&restaurant={id}`
2. Browse menu and add items to cart
3. Place order (no payment required)
4. Watch order status update in real-time

### Staff Journey
1. Login at `/login`
2. View incoming orders in real-time
3. Update order status: New → Preparing → Ready → Delivered
4. Respond to help requests

### Admin Journey
1. Login as admin
2. Toggle restaurant open/closed
3. Add/edit menu items with images
4. Generate QR codes for tables
5. Manage staff members

## Key Features Working

✅ Real-time order updates without page refresh  
✅ Sound notifications for new orders (with mute toggle)  
✅ Image upload to Supabase Storage  
✅ QR code generation and download  
✅ Help request system  
✅ Role-based access control (admin vs staff)  
✅ Mobile-responsive design  
✅ Kitchen mode for tablets  
✅ Cart persistence with localStorage  
✅ Order status tracking  

## Troubleshooting

**Can't login?**
- Verify user exists in Supabase Auth
- Check `restaurant_staff` table has entry linking user to restaurant

**Orders not appearing?**
- Ensure RLS policies are set up correctly (run `supabase-setup.sql` again)
- Check browser console for errors

**Images not uploading?**
- Verify `menu-images` storage bucket exists
- Check storage policies in Supabase dashboard

**Realtime not working?**
- Ensure Realtime is enabled for your tables in Supabase dashboard
- Check WebSocket connections aren't blocked by firewall

## What's Next?

After going live, consider:
- Setting up a custom domain
- Adding payment integration (Stripe)
- Implementing thermal printer support
- Adding customer feedback/ratings
- Building analytics dashboard

## Support

For issues:
- Check Supabase docs: https://supabase.com/docs
- Review the README.md and DEPLOYMENT.md files
- Check browser console for error messages

---

**Congratulations!** Your Restaurant QR Ordering SaaS is ready to use! 🎉
