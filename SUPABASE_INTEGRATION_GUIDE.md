# 🔗 SAFOS - Supabase Integration Guide

## ✅ What's Been Implemented

### 1. Supabase Client (`src/lib/supabase.ts`)
- Supabase client initialization
- Storage bucket constants
- File upload helper functions
- Authentication helpers

### 2. Supabase Service (`src/lib/supabaseService.ts`)
Complete CRUD operations for:
- ✅ Products (get, save, update, delete)
- ✅ Product image uploads
- ✅ Collections
- ✅ Testimonials
- ✅ Craft Steps
- ✅ Orders (get, create, update status)
- ✅ Store Settings
- ✅ Logo uploads
- ✅ Authentication (login, logout, auth state)

### 3. Database Schema (`supabase-schema.sql`)
Complete schema with:
- Products table
- Collections table
- Testimonials table
- Craft Steps table
- Orders table
- Store Settings table
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for updated_at timestamps

### 4. Storage Setup Guide (`supabase-storage-setup.md`)
Instructions for:
- Creating storage buckets
- Setting storage policies
- Creating admin user
- Getting credentials

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name:** SAFOS
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
4. Wait for project to be created (~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase-schema.sql`
4. Click **Run** or press Ctrl+Enter
5. ✅ All tables created successfully

### Step 3: Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket** for each:

#### Bucket 1: `product-images`
- Name: `product-images`
- Public: ✅ Yes
- File size limit: `5242880` (5MB)
- Allowed MIME types: `image/png,image/jpeg,image/jpg,image/webp,image/gif`

#### Bucket 2: `logos`
- Name: `logos`
- Public: ✅ Yes
- File size limit: `2097152` (2MB)
- Allowed MIME types: `image/png,image/jpeg,image/jpg,image/webp,image/svg+xml`

#### Bucket 3: `website-images`
- Name: `website-images`
- Public: ✅ Yes
- File size limit: `5242880` (5MB)
- Allowed MIME types: `image/png,image/jpeg,image/jpg,image/webp`

### Step 4: Set Storage Policies

For EACH bucket, run these SQL commands in SQL Editor:

```sql
-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Authenticated upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Authenticated update/delete
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

**Replace `'product-images'` with each bucket name** (run 3 times total).

### Step 5: Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Fill in:
   - **Email:** `admin@safos.ma` (or your email)
   - **Password:** Create a strong password
   - **Auto Confirm User:** ✅ Check this
4. Click **Create User**

### Step 6: Get Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

### Step 7: Configure Environment

1. Create `.env` file in project root:
```bash
cp .env.example .env
```

2. Edit `.env` and paste your credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 8: Test Connection

```bash
npm run dev
```

Go to `http://localhost:5173/#admin` and try logging in with your Supabase credentials.

---

## 🔄 MIGRATION FROM LOCALSTORAGE

The current code uses localStorage. To migrate to Supabase:

### Option 1: Manual Migration (Recommended for now)

1. Export data from current system:
   - Admin Panel → Settings → Export
   - Save JSON file

2. Manually enter data into Supabase via SQL Editor or Dashboard

3. Update code to use Supabase instead of localStorage

### Option 2: Automated Migration Script

Create a migration script that:
1. Reads from localStorage
2. Calls Supabase API to insert data
3. Verifies data was saved

---

## 📝 CODE INTEGRATION POINTS

### 1. Update StoreContext to use Supabase

Replace localStorage calls with Supabase service calls:

```typescript
// Before (localStorage)
const products = JSON.parse(localStorage.getItem('safos_products') || '[]');

// After (Supabase)
import { getProducts } from './lib/supabaseService';
const products = await getProducts();
```

### 2. Update AdminDashboard to use Supabase Auth

Replace password check with Supabase auth:

```typescript
// Before
const savedPassword = localStorage.getItem("safos_admin_password") || "safos1007";
if (password === savedPassword) { setAuthed(true); }

// After
import { login } from './lib/supabaseService';
const { success, error } = await login(email, password);
if (success) { setAuthed(true); }
```

### 3. Update Image Uploads

Replace base64 conversion with Supabase Storage upload:

```typescript
// Before (base64)
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target?.result as string;
  setImage(base64);
};

// After (Supabase Storage)
import { uploadProductImage } from './lib/supabaseService';
const { url, error } = await uploadProductImage(file, productId);
if (url) { setImage(url); }
```

---

## 🔐 SECURITY CONSIDERATIONS

### Row Level Security (RLS)

All tables have RLS enabled with these policies:
- **Public:** Can SELECT (view) products, collections, testimonials, craft steps
- **Authenticated:** Can INSERT, UPDATE, DELETE (admin only)

### Storage Security

- All buckets are public (for image access)
- Upload/update/delete requires authentication
- File size limits enforced
- MIME type validation

### Best Practices

1. **Never expose service_role key** in frontend code
2. **Use anon key only** (it's safe for frontend)
3. **Enable email confirmation** for production
4. **Set up rate limiting** if needed
5. **Regular backups** of your database

---

## 🛠️ TROUBLESHOOTING

### "Permission denied" error
- Check if user is authenticated
- Verify RLS policies are correct
- Check bucket policies in Storage

### "Bucket not found" error
- Create the bucket in Supabase Storage
- Check bucket name spelling (case-sensitive!)

### Images not loading
- Verify bucket is public
- Check image URL is correct
- Check browser console for CORS errors

### Auth not working
- Verify credentials in .env file
- Check if user exists in Authentication → Users
- Try signing up a new user

### Database errors
- Run schema SQL again
- Check table names are correct
- Verify RLS policies

---

## 📊 DATABASE STRUCTURE

### Tables Created:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `products` | Product catalog | id, name, price, image_url, stock |
| `collections` | Product collections | id, title, piece_count |
| `testimonials` | Customer reviews | id, name, rating, text |
| `craft_steps` | Manufacturing process | id, title, description |
| `orders` | Customer orders | id, customer_name, total, status |
| `store_settings` | Site configuration | id, key, value (JSON) |

### Storage Buckets:

| Bucket | Purpose | Max Size |
|--------|---------|----------|
| `product-images` | Product photos | 5MB |
| `logos` | Brand logos | 2MB |
| `website-images` | Hero, banners | 5MB |

---

## 🎯 NEXT STEPS

### Immediate:
1. ✅ Set up Supabase project
2. ✅ Run database schema
3. ✅ Create storage buckets
4. ✅ Set up .env file
5. ✅ Test connection

### Short-term:
1. Update StoreContext to use Supabase
2. Update AdminDashboard auth to use Supabase
3. Implement real image uploads to Storage
4. Test all CRUD operations

### Long-term:
1. Add real-time updates (Supabase Realtime)
2. Implement image optimization
3. Add database backups
4. Set up monitoring/alerts
5. Add analytics

---

## 📞 SUPPORT

### Supabase Documentation:
- https://supabase.com/docs
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/storage

### Community:
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

### For This Project:
- Check `FIXES_COMPLETE.md` for admin panel features
- Check `DEPLOYMENT_GUIDE.md` for deployment
- Check `README_AR.md` for Arabic documentation

---

**Status:** ✅ Supabase integration ready  
**Next:** Configure your Supabase project and update .env file  
**Admin Panel:** `https://safos.online/#admin`
