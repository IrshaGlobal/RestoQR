# Production Deployment Checklist

Use this checklist to ensure your restaurant ordering app is ready for production deployment.

## Pre-Deployment

### 1. Environment Configuration
- [ ] Create production `.env` file with real Supabase credentials
- [ ] Verify `VITE_SUPABASE_URL` points to production Supabase project
- [ ] Verify `VITE_SUPABASE_ANON_KEY` is the production anon key (not service role key!)
- [ ] Ensure `.env` is in `.gitignore` and NOT committed to repository
- [ ] Test with `npm run build` to ensure no build errors

### 2. Database Setup
- [ ] Run `supabase-setup.sql` in Supabase SQL Editor
- [ ] Verify all tables are created successfully
- [ ] Confirm Row Level Security (RLS) is enabled on all tables
- [ ] Test RLS policies with different user roles
- [ ] Create at least one admin user in `restaurant_staff` table
- [ ] Add sample restaurant, categories, menu items, and tables

### 3. Authentication Setup
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Configure password requirements (min 6 characters enforced in app)
- [ ] Create admin account(s) manually in Supabase dashboard
- [ ] Test login flow with admin credentials
- [ ] Test login flow with staff credentials
- [ ] Verify unauthorized access is blocked

### 4. Storage Configuration
- [ ] Verify `menu-images` bucket exists
- [ ] Set bucket to public (for image viewing)
- [ ] Test image upload functionality
- [ ] Test image display in menu
- [ ] Verify storage policies are active

### 5. Testing
- [ ] Test customer flow: scan QR → view menu → add items → place order
- [ ] Test staff flow: login → view orders → update status
- [ ] Test admin flow: login → manage menu → add/edit/delete items
- [ ] Test rate limiting: try placing multiple orders rapidly
- [ ] Test help request functionality
- [ ] Test restaurant open/closed status toggle
- [ ] Test on mobile devices (primary use case)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Verify real-time updates work (new orders appear instantly)

## Deployment Steps

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Redeploy after adding variables

5. **Configure Custom Domain (Optional)**
   - Add domain in Vercel Dashboard
   - Update DNS records as instructed
   - Wait for SSL certificate provisioning

### Option B: Deploy to Netlify

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket repo

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify Dashboard

4. **Deploy**
   - Trigger deployment
   - Verify site is live

### Option C: Static Hosting (Any Provider)

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload `dist` Folder**
   - Upload contents of `dist` folder to your hosting provider
   - Ensure proper MIME types for JS/CSS files
   - Configure SPA routing (redirect all routes to index.html)

## Post-Deployment

### 1. Verification
- [ ] Visit production URL and verify app loads
- [ ] Test QR code generation and scanning
- [ ] Place a test order from customer view
- [ ] Verify order appears in staff dashboard
- [ ] Test order status updates
- [ ] Check browser console for errors

### 2. Performance
- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Test page load time on 3G connection
- [ ] Verify images are optimized
- [ ] Check bundle size (should be < 500KB gzipped)

### 3. Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Enable Supabase analytics
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up alerts for failed deployments

### 4. Security Hardening
- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Configure CORS in Supabase to allow only your domain
- [ ] Set up Cloudflare or similar WAF
- [ ] Enable Supabase audit logging
- [ ] Review and restrict database permissions

### 5. Documentation
- [ ] Document admin procedures for restaurant staff
- [ ] Create QR codes for all tables
- [ ] Print table tent cards with QR codes
- [ ] Train staff on using the dashboard
- [ ] Create backup/restore procedure documentation

## Maintenance

### Regular Tasks

**Daily:**
- Monitor order volume and system performance
- Check for failed orders or error spikes

**Weekly:**
- Review staff accounts and remove inactive users
- Check database storage usage
- Backup important data

**Monthly:**
- Update dependencies: `npm update`
- Review security logs
- Test backup restoration
- Audit menu items and pricing

**Quarterly:**
- Full security review
- Performance optimization
- User feedback collection
- Feature roadmap planning

## Troubleshooting

### Common Issues

**Problem**: Orders not appearing in staff dashboard
- Check Supabase Realtime is enabled
- Verify RLS policies allow staff to read orders
- Check browser console for WebSocket errors

**Problem**: Images not loading
- Verify storage bucket is public
- Check image URLs are correct
- Ensure CORS is configured for storage

**Problem**: Login fails
- Verify Supabase Auth is enabled
- Check user exists in `auth.users` table
- Verify user has entry in `restaurant_staff` table

**Problem**: Build fails
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`
- Verify environment variables are set correctly

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Vercel Docs**: https://vercel.com/docs
- **Issue Tracker**: Use GitHub Issues for bug reports

## Emergency Contacts

Keep these contacts accessible:
- Supabase Support: https://supabase.com/support
- Your development team contact information
- Hosting provider support details

---

**Last Updated**: May 2026
**Version**: 1.0.0
