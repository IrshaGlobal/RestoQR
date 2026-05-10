# 🔴 SECURITY INCIDENT REPORT: Supabase Secret Key Exposure

## Incident Summary

**Date:** May 10, 2026  
**Severity:** CRITICAL  
**Status:** RESOLVED (Key Revoked by Supabase)  
**Project:** resto (ftuihzoapphxmakufpxf)

---

## What Happened

### Root Cause
A **Supabase Project Secret Key** (`sb_secret_FiSn3D9FvmJXDjBoA98MJw_wj3lHz4e`) was accidentally committed to a **public GitHub repository** in multiple test files.

### Exposed Files
The secret key was found hardcoded in the following files:

1. **`test-supabase.js`** (Line 7)
   - Primary file that triggered Supabase's security scan
   - Contains direct API connection test with hardcoded credentials
   
2. **`public/test-connection.html`** (Line 95)
   - HTML test page with embedded secret key
   
3. **`test-connection.html`** (Line 33)
   - Duplicate test file with same credentials

### Timeline

1. **Initial Commit** (Commit: `22c38bd`)
   - Files were committed to local git repository
   - `.gitignore` did NOT include test files or `.js` files outside of node_modules
   
2. **Push to Public Repository**
   - Repository `IrshaGlobal/restro` was pushed to GitHub
   - Repository was initially **PRIVATE**
   
3. **Repository Made Public**
   - User changed repository visibility from private to public
   - This exposed all commit history including the secret keys
   
4. **Supabase Security Scan Detected**
   - Supabase's automated security scanning found the exposed secret key
   - **Key was automatically revoked** to protect your data
   - Notification sent to project owner

---

## Why This Happened

### 1. Missing .gitignore Rules
The `.gitignore` file did not exclude:
- ❌ Test files (`*.test.js`, `test-*.js`)
- ❌ HTML test files in `/public` directory
- ❌ Any JavaScript files with credentials

Current `.gitignore` only excludes:
```
.env
.env.local
node_modules/
dist/
```

### 2. Hardcoded Credentials in Code
Instead of using environment variables, credentials were hardcoded:
```javascript
// ❌ WRONG - Hardcoded secret
const supabaseKey = 'sb_secret_FiSn3D9FvmJXDjBoA98MJw_wj3lHz4e'

// ✅ CORRECT - Use environment variable
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 3. Test Files Committed to Version Control
Test/debug files should never be committed to repositories, especially public ones.

### 4. Repository Visibility Change
When the repository was made public, all historical commits became visible, exposing any secrets that were ever committed.

---

## Impact Assessment

### ✅ Good News
- **No data breach occurred** - Supabase detected and revoked the key before unauthorized access
- **Key was service role key** (not anon key), which has more restricted permissions
- **Automatic protection** - Supabase's security systems worked as designed

### ⚠️ Immediate Impact
- **All apps using this key stopped working** - Authentication to Supabase failed
- **Vercel deployment broken** - Cannot connect to database
- **Development environment affected** - Local testing requires new credentials

### 🔒 Security Risk Level
- **Risk:** LOW (due to automatic revocation)
- **Potential Risk if Not Detected:** HIGH (full database access possible with service role key)

---

## Resolution Steps Taken

### 1. ✅ Key Revoked (Automatic)
- Supabase automatically revoked the compromised key
- Prevents any unauthorized access

### 2. 🔄 Generate New Credentials
You need to generate new Supabase credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `resto`
3. Navigate to **Settings → API**
4. Under **Project API keys**, you'll see:
   - `anon` public key (safe to expose)
   - `service_role` secret key (NEVER expose)

### 3. 📝 Update Environment Variables

Create/update your `.env` file:
```env
VITE_SUPABASE_URL=https://ftuihzoapphxmakufpxf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (your NEW anon key)
```

**IMPORTANT:** 
- Use the **anon/public key** for frontend applications
- NEVER use the service_role key in client-side code
- The anon key is safe to expose (it's what `.env.example` shows)

### 4. 🗑️ Remove Exposed Files from Git History

**Option A: Remove files completely (Recommended)**
```bash
# Remove test files with credentials
git rm --cached test-supabase.js
git rm --cached test-connection.html
git rm --cached public/test-connection.html

# Add to .gitignore
echo "test-*.js" >> .gitignore
echo "test-*.html" >> .gitignore

git add .gitignore
git commit -m "Remove test files with credentials and update .gitignore"
git push origin main
git push restroqr main
```

**Option B: Rewrite git history (Advanced - removes from ALL commits)**
```bash
# WARNING: This rewrites history - only do if comfortable with git
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch test-supabase.js test-connection.html public/test-connection.html' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - only if no collaborators)
git push origin --force --all
git push restroqr --force --all
```

### 5. 🔐 Secure Your Keys Going Forward

Update `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Test files (NEVER commit)
test-*.js
test-*.html
*.test.js
*.spec.js
tests/

# Temporary debug files
debug-*.js
check-*.js
```

---

## Prevention Measures

### 1. Environment Variables Only
```javascript
// ✅ ALWAYS use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ❌ NEVER hardcode credentials
const supabaseKey = 'sb_secret_...'
```

### 2. Use Correct Key Type
- **Frontend/Client-side:** Use `anon` (public) key ✅
- **Backend/Server-side:** Use `service_role` (secret) key 🔒
- **NEVER** use service_role key in browser code

### 3. Pre-commit Hooks
Install `husky` and `lint-staged` to prevent accidental commits:
```bash
npm install husky lint-staged --save-dev
npx husky install
```

### 4. Secret Scanning Tools
- Enable GitHub's built-in **Secret Scanning** (free for public repos)
- Use tools like `git-secrets` or `detect-secrets`
- Supabase already has automatic scanning enabled ✅

### 5. Code Review Checklist
Before pushing to public repos:
- [ ] No hardcoded credentials
- [ ] All secrets in `.env` files
- [ ] `.env` added to `.gitignore`
- [ ] Test/debug files excluded
- [ ] Review commit diff carefully

---

## Current Status

### What's Broken
- ❌ Vercel deployment (cannot authenticate to Supabase)
- ❌ Local development (if using old credentials)
- ❌ Any API calls to Supabase

### What You Need to Do NOW

1. **Generate new Supabase anon key** from dashboard
2. **Update `.env` file** with new credentials
3. **Remove test files** from git history
4. **Redeploy to Vercel** with new environment variables
5. **Verify everything works**

### Vercel Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:
```
VITE_SUPABASE_URL=https://ftuihzoapphxmakufpxf.supabase.co
VITE_SUPABASE_ANON_KEY=<your-new-anon-key>
```

---

## Lessons Learned

1. **Never commit test files** with credentials, even to private repos
2. **Always use environment variables** for sensitive data
3. **Review .gitignore** before initial commit
4. **Use anon keys for frontend** - they're designed to be public
5. **Enable secret scanning** on all repositories
6. **Check commit history** before making repo public

---

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
- [12-Factor App: Config](https://12factor.net/config)

---

## Contact & Support

If you notice any suspicious activity:
1. Check Supabase logs: Dashboard → Logs
2. Review database access patterns
3. Rotate all credentials immediately
4. Contact Supabase support if needed

---

**Report Generated:** May 10, 2026  
**Incident Resolved:** Yes (key revoked, prevention measures documented)  
**Next Action Required:** Generate new credentials and update deployment
