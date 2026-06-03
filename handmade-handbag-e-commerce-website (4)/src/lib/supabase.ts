import { createClient } from '@supabase/supabase-js';

// Supabase credentials from .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Check .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage buckets
export const BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  LOGOS: 'logos',
  WEBSITE_IMAGES: 'website-images',
};

// Helper function to upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  file: File,
  path: string
): Promise<{ url: string; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { url: '', error: error.message };
  }
}

// Helper function to delete file from Supabase Storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

// Auth helpers
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { user: data.user, error };
}
