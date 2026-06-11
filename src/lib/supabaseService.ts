import { supabase } from './supabase';

// جلب المنتجات (تصفية المرئية فقط للزبون)
export const getProducts = async (showHidden = false) => {
  let query = supabase.from('products').select('*');
  if (!showHidden) {
    query = query.eq('is_visible', true);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) console.error('Error fetching products:', error);
  return data || [];
};

// حفظ منتج جديد
export const saveProduct = async (product: any) => {
  const { data, error } = await supabase.from('products').insert([product]).select();
  if (error) console.error('Error saving product:', error);
  return { data, error };
};

// تحديث منتج موجود
export const updateProduct = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
  if (error) console.error('Error updating product:', error);
  return { data, error };
};

// حذف منتج
export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('Error deleting product:', error);
  return { success: !error };
};

// رفع صورة إلى الـ Storage
export const uploadFile = async (bucket: string, file: File, path: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${path}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true
  });

  if (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { url: publicUrlData.publicUrl, error: null };
};

// جلب كاع إعدادات الموقع
export const getStoreSettings = async () => {
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) console.error('Error fetching settings:', error);
  return data || [];
};

// حفظ إعدادات معينة (محتوى، ألوان، أقسام)
export const saveStoreSettings = async (key: string, value: any) => {
  const { data, error } = await supabase
    .from('store_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select();
  if (error) console.error('Error saving settings:', error);
  return { data, error };
};

// إرسال طلبية جديدة
export const createOrder = async (order: any) => {
  const { data, error } = await supabase.from('orders').insert([order]).select();
  if (error) console.error('Error creating order:', error);
  return { data, error };
};
