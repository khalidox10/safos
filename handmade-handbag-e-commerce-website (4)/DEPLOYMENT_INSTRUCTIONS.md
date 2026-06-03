# 🚀 SAFOS - Production Deployment Instructions

## ⚠️ CRITICAL: Why You're Getting 404

The `/admin` route returns 404 because **the latest changes haven't been deployed to Vercel yet**.

The code is ready locally, but you need to deploy it.

---

## ✅ VERIFIED: Route Configuration

### App.tsx Routes (✅ Correct):
```typescript
<Route path="/" element={<Website />} />
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### vercel.json (✅ Created):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This configuration is correct for React Router SPA.

---

## 📦 DEPLOYMENT STEPS

### Option 1: Git + Vercel (Recommended)

#### Step 1: Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Add Supabase integration and admin panel"
```

#### Step 2: Connect to GitHub
```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/yourusername/safos.git
git push -u origin main
```

#### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### Step 4: Add Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://sgxiukponkrswkpnlcwx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_u3XTWrv00CiH9Cj8o0pMWw_O3FzB6l0
```

#### Step 5: Deploy
Click **"Deploy"** and wait for build to complete (~2-3 minutes)

---

### Option 2: Vercel CLI (Faster)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
vercel --prod
```

#### Step 4: Add Environment Variables
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

#### Step 5: Redeploy with env vars
```bash
vercel --prod
```

---

### Option 3: Manual Upload (If not using Git)

#### Step 1: Build Locally
```bash
npm run build
```

This creates `dist/` folder with production files.

#### Step 2: Upload to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"** or drag & drop
3. Upload the `dist` folder contents
4. Add environment variables
5. Deploy

---

## 🔍 VERIFICATION CHECKLIST

After deployment, verify these URLs:

### ✅ Should Work:
- [ ] `https://safos.online/` - Main website
- [ ] `https://safos.online/admin/login` - Admin login page
- [ ] `https://safos.online/admin` - Redirects to login

### ❌ If Still Getting 404:

**Check 1: Build Status**
```bash
# Locally verify build works
npm run build
# Should complete without errors
```

**Check 2: Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:
- Verify both variables are set
- Verify they're set for "Production" environment
- Redeploy after adding variables

**Check 3: vercel.json Exists**
Verify `vercel.json` is in your project root and contains the rewrites configuration.

**Check 4: Clear Cache**
Sometimes Vercel caches old builds:
1. Go to Vercel Dashboard
2. Select your project
3. Deployments → Click on latest deployment
4. Click "Redeploy"

---

##  COMMON ISSUES & FIXES

### Issue: "404 on /admin"
**Cause:** Vercel doesn't know about client-side routes

**Fix:** Ensure `vercel.json` exists with rewrites:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Issue: "Environment variables not found"
**Cause:** Variables not set in Vercel

**Fix:** 
1. Vercel Dashboard → Settings → Environment Variables
2. Add both variables
3. Redeploy

### Issue: "Build fails"
**Cause:** TypeScript errors or missing dependencies

**Fix:**
```bash
npm install
npm run build
# Fix any errors shown
```

### Issue: "Blank page after deployment"
**Cause:** Wrong base path or build output directory

**Fix:** Verify in Vercel:
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 📊 DEPLOYMENT STATUS

### Local Build Status:
```
✅ Build successful
✅ No errors
✅ Routes configured
✅ vercel.json created
```

### Production Deployment Status:
```
⏳ Waiting for deployment
⏳ Environment variables need to be added
⏳ vercel.json needs to be committed
```

---

## 🎯 AFTER DEPLOYMENT

### Test These URLs:

1. **Admin Login:**
   ```
   https://safos.online/admin/login
   ```
   Should show login page with:
   - SAFOS logo
   - Email field (pre-filled: admin@safos.ma)
   - Password field
   - Login button

2. **Admin Dashboard (protected):**
   ```
   https://safos.online/admin
   ```
   Should redirect to `/admin/login` if not authenticated

3. **After Login:**
   Should show admin dashboard with:
   - Products tab
   - Settings tab
   - Password tab

---

## 📞 SUPPORT

### If Still Having Issues:

1. **Check Vercel Build Logs:**
   - Vercel Dashboard → Deployments → Click latest
   - Check for errors in build output

2. **Check Browser Console:**
   - Press F12
   - Look for errors in Console tab
   - Screenshot and share

3. **Verify Supabase Setup:**
   - Run `supabase-schema-fixed.sql` in Supabase SQL Editor
   - Create admin user in Authentication
   - Create storage buckets

---

## ✅ FINAL CHECKLIST

Before testing production:

- [ ] Code committed to Git
- [ ] Pushed to GitHub/GitLab
- [ ] Vercel project connected
- [ ] Environment variables added in Vercel
- [ ] vercel.json committed
- [ ] Deployment completed successfully
- [ ] Build logs show no errors
- [ ] Test /admin/login URL
- [ ] Test login with credentials

---

**Current Status:** ⏳ **AWAITING DEPLOYMENT**

**Next Action:** Deploy to Vercel using one of the methods above.

**After Deployment:** Test `https://safos.online/admin/login`
