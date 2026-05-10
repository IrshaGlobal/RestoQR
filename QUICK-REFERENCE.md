# Quick Reference - Security & Deployment

## 🔒 Security Features at a Glance

### Rate Limits
- **Orders**: 3 per table / minute
- **Help Requests**: 2 per table / 5 minutes
- **Login**: Handled by Supabase Auth

### Validation Rules
- **Email**: Must match standard email format
- **Password**: Minimum 6 characters
- **Price**: 0 to 99,999.99 (max 2 decimals)
- **Quantity**: 1 to 99 (integers only)
- **Notes/Description**: Max 500 characters
- **Images**: JPEG/PNG/WebP, max 5MB

### Order Numbers
- **Format**: 6 digits (000000-999999)
- **Generation**: Cryptographically secure random
- **Uniqueness**: ~99.9% unique per restaurant

---

## 🚀 Deploy in 5 Minutes (Vercel)

```bash
# 1. Install Vercel CLI (one-time)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
cd resto
vercel --prod

# 4. Set environment variables
# Go to: https://vercel.com/dashboard
# Your Project > Settings > Environment Variables
# Add:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 5. Redeploy with env vars
vercel --prod
```

---

## 📋 Essential Pre-Launch Tests

```bash
# Build the app
npm run build

# If build succeeds, test these flows:
```

### Customer Flow
1. Open `http://localhost:5173/menu?table=TABLE_ID&restaurant=RESTAURANT_ID`
2. Browse menu and add items to cart
3. Place order
4. Verify order appears in staff dashboard

### Staff Flow
1. Login at `http://localhost:5173/login`
2. View incoming orders
3. Update order status (new → preparing → ready → delivered)
4. Dismiss help requests

### Admin Flow
1. Login as admin
2. Add/edit/delete menu items
3. Toggle restaurant open/closed
4. Generate QR codes for tables

---

## 🔧 Common Issues & Fixes

### Issue: "Missing Supabase configuration"
**Fix**: Create `.env` file with your credentials
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Issue: Orders not appearing in real-time
**Fix**: Check Supabase Realtime is enabled
- Go to Supabase Dashboard > Database > Replication
- Enable Realtime for `orders` table

### Issue: Images not uploading
**Fix**: Verify storage bucket exists
- Run `supabase-setup.sql` again
- Or manually create `menu-images` bucket in Storage

### Issue: Login fails with "Invalid credentials"
**Fix**: Create user in Supabase
1. Go to Authentication > Users
2. Add new user with email/password
3. Add entry in `restaurant_staff` table linking user to restaurant

### Issue: Build fails
**Fix**: Clean and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Monitoring Checklist

**Daily**:
- [ ] Check order volume
- [ ] Review error logs
- [ ] Monitor uptime

**Weekly**:
- [ ] Audit staff accounts
- [ ] Check storage usage
- [ ] Review rate limit hits

**Monthly**:
- [ ] Update dependencies (`npm update`)
- [ ] Security audit (`npm audit`)
- [ ] Test backup restoration

---

## 🆘 Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **Documentation**: See SECURITY.md and PRODUCTION-CHECKLIST.md

---

## 📚 Documentation Index

| Document | Purpose | When to Use |
|----------|---------|-------------|
| LAUNCH-SUMMARY.md | Overview of security fixes | Right now - you're here! |
| PRODUCTION-CHECKLIST.md | Step-by-step deployment | Before going live |
| SECURITY.md | Security guide & best practices | Ongoing maintenance |
| SECURITY-AUDIT-REPORT.md | Detailed audit findings | Understanding what was fixed |
| README.md | Project overview | General reference |
| QUICKSTART.md | Setup instructions | Initial setup |

---

## ⚡ Quick Commands

```bash
# Development
npm run dev          # Start dev server (localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
vercel               # Deploy to Vercel (interactive)
vercel --prod        # Deploy to production

# Maintenance
npm update           # Update dependencies
npm audit            # Check for vulnerabilities
npm audit fix        # Fix vulnerabilities automatically
```

---

## 🎯 Success Metrics

After launch, track these KPIs:

- **Order Success Rate**: Target > 99%
- **Page Load Time**: Target < 3 seconds
- **Error Rate**: Target < 1%
- **Customer Satisfaction**: Collect feedback weekly
- **Staff Efficiency**: Track order processing time

---

**You're all set!** 🎉

For detailed information, refer to the full documentation files.
