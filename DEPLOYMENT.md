# Deployment Guide

This guide will help you deploy your Restaurant QR Ordering SaaS to production.

## Pre-Deployment Checklist

Before deploying, ensure you have:

1. ✅ Set up a Supabase project and run `supabase-setup.sql`
2. ✅ Created at least one restaurant in the `restaurants` table
3. ✅ Created admin/staff users in Supabase Auth and linked them in `restaurant_staff` table
4. ✅ Tested the app locally with `npm run dev`
5. ✅ Added your environment variables

## Deploy to Vercel (Recommended)

### Option 1: GitHub Integration (Easiest)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables:**
   In Vercel dashboard, go to Settings > Environment Variables and add:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like `your-app.vercel.app`

5. **Production Deploy:**
   - Every push to `main` branch auto-deploys to production
   - Pull requests create preview deployments

### Option 2: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel dashboard after first deploy

5. Production deploy:
   ```bash
   vercel --prod
   ```

## Deploy to Netlify

### Via Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site Settings > Build & Deploy > Environment
7. Click "Deploy site"

### Via Netlify CLI

1. Install CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Initialize:
   ```bash
   netlify init
   ```

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Deploy to Other Platforms

### Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Add environment variables in Settings
4. Deploy

### GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/repo-name/',
     plugins: [react()],
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Configure `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

## Environment Variables

All platforms require these environment variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env` files to version control. Use your hosting platform's environment variable settings.

## Post-Deployment Steps

1. **Test all features:**
   - Visit your deployed URL
   - Try logging in as staff/admin
   - Test customer menu flow
   - Verify realtime updates work

2. **Set up custom domain (optional):**
   - Vercel: Settings > Domains
   - Netlify: Domain Settings > Custom domains
   - Follow platform-specific DNS configuration

3. **Enable analytics (optional):**
   - Add Google Analytics or Plausible
   - Track user behavior and conversions

4. **Set up monitoring:**
   - Enable Supabase logs
   - Monitor database usage
   - Set up error tracking (Sentry, LogRocket)

## SSL/TLS

All recommended platforms provide free SSL certificates automatically. Your site will be served over HTTPS by default.

## Troubleshooting

### Build Fails
- Check that all dependencies are installed: `npm install`
- Verify TypeScript has no errors: `npm run build`
- Check environment variables are set correctly

### Realtime Not Working
- Ensure Supabase Realtime is enabled for your tables
- Check RLS policies allow the connections
- Verify WebSocket connections aren't blocked by firewall

### Images Not Loading
- Check Supabase Storage bucket exists (`menu-images`)
- Verify storage policies are set correctly
- Ensure image URLs are public

### Authentication Issues
- Confirm users exist in Supabase Auth
- Verify `restaurant_staff` entries link users to restaurants
- Check browser console for auth errors

## Scaling Considerations

As your app grows:

1. **Database:** Upgrade Supabase plan for more storage/connections
2. **Images:** Use image optimization service (Cloudinary, Imgix)
3. **CDN:** All platforms include CDN by default
4. **Rate Limiting:** Implement API rate limiting if needed
5. **Backups:** Enable Supabase automated backups

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Open an issue on your repository
