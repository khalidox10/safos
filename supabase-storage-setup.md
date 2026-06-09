# Supabase Storage Setup Guide

## Step 1: Create Storage Buckets

Go to your Supabase project → Storage → Create new buckets:

### Bucket 1: product-images
- **Name:** `product-images`
- **Public:** ✅ Yes (public bucket)
- **File size limit:** 5MB
- **Allowed MIME types:** image/png, image/jpeg, image/jpg, image/webp, image/gif

### Bucket 2: logos
- **Name:** `logos`
- **Public:** ✅ Yes (public bucket)
- **File size limit:** 2MB
- **Allowed MIME types:** image/png, image/jpeg, image/jpg, image/webp, image/svg+xml

### Bucket 3: website-images
- **Name:** `website-images`
- **Public:** ✅ Yes (public bucket)
- **File size limit:** 5MB
- **Allowed MIME types:** image/png, image/jpeg, image/jpg, image/webp

## Step 2: Set Storage Policies

For each bucket, add these policies:

### Public Read Policy (all buckets)
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

### Authenticated Upload Policy (all buckets)
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

### Authenticated Update/Delete Policy (all buckets)
```sql
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

Repeat for each bucket (change bucket_id accordingly).

## Step 3: Create Admin User

Go to Supabase project → Authentication → Users → Add user

- **Email:** admin@safos.ma (or your email)
- **Password:** (create a strong password)
- **Auto Confirm User:** ✅ Yes

## Step 4: Get Your Credentials

Go to Supabase project → Settings → API

Copy:
- **Project URL:** `https://xxxxx.supabase.co`
- **anon/public key:** `eyJhbG...` (long string)

## Step 5: Configure Environment

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Run Database Schema

Go to Supabase project → SQL Editor → New Query

Copy and paste the contents of `supabase-schema.sql` and run it.

## Step 7: Test Connection

1. Start the development server: `npm run dev`
2. Go to admin panel: `http://localhost:5173/#admin`
3. Login with your Supabase auth credentials
4. Try uploading a product image

## Troubleshooting

### "Permission denied" error
- Check storage bucket policies
- Make sure user is authenticated
- Verify bucket is public

### "Bucket not found" error
- Create the bucket in Supabase Storage
- Check bucket name spelling (case-sensitive)

### Images not loading
- Check if bucket is public
- Verify image URL is correct
- Check browser console for CORS errors
