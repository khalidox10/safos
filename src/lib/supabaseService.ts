import { supabase, BUCKETS, uploadFile } from './supabase';
import type { Product, Collection, Testimonial, CraftStep, Order, StoreInfo } from '../context/StoreContext';

// ============ PRODUCTS ============

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      nameEn: p.name_en,
      price: Number(p.price),
      oldPrice: p.old_price ? Number(p.old_price) : null,
      image: p.image_url || '',
      color: p.color,
      tag: p.tag,
      category: p.category,
      stock: p.stock,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function saveProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        name_en: product.nameEn,
        price: product.price,
        old_price: product.oldPrice,
        image_url: product.image,
        color: product.color,
        tag: product.tag,
        category: product.category,
        stock: product.stock,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      nameEn: data.name_en,
      price: Number(data.price),
      oldPrice: data.old_price ? Number(data.old_price) : null,
      image: data.image_url || '',
      color: data.color,
      tag: data.tag,
      category: data.category,
      stock: data.stock,
    };
  } catch (error) {
    console.error('Error saving product:', error);
    return null;
  }
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<boolean> {
  try {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.nameEn) updateData.name_en = updates.nameEn;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.oldPrice !== undefined) updateData.old_price = updates.oldPrice;
    if (updates.image) updateData.image_url = updates.image;
    if (updates.color) updateData.color = updates.color;
    if (updates.tag !== undefined) updateData.tag = updates.tag;
    if (updates.category) updateData.category = updates.category;
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// ============ PRODUCT IMAGE UPLOAD ============

export async function uploadProductImage(file: File, productId?: string): Promise<{ url: string; error: string | null }> {
  const fileName = `${Date.now()}-${file.name}`;
  const path = productId ? `${productId}/${fileName}` : fileName;
  return uploadFile(BUCKETS.PRODUCT_IMAGES, file, path);
}

// ============ COLLECTIONS ============

export async function getCollections(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(c => ({
      title: c.title,
      sub: c.subtitle || '',
      img: c.image_url || '',
      count: c.piece_count || 0,
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

// ============ TESTIMONIALS ============

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(t => ({
      name: t.name,
      role: t.role || '',
      text: t.text,
      rating: t.rating || 5,
      avatar: t.avatar || '',
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

// ============ CRAFT STEPS ============

export async function getCraftSteps(): Promise<CraftStep[]> {
  try {
    const { data, error } = await supabase
      .from('craft_steps')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    
    return data.map(s => ({
      num: s.step_number,
      title: s.title,
      desc: s.description || '',
      img: s.image_url || '',
    }));
  } catch (error) {
    console.error('Error fetching craft steps:', error);
    return [];
  }
}

// ============ ORDERS ============

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(o => ({
      id: o.order_number,
      date: o.created_at.split('T')[0],
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerCity: o.customer_city || '',
      customerAddress: o.customer_address || '',
      items: o.items,
      total: Number(o.total),
      status: o.status,
      notes: o.notes || '',
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order | null> {
  try {
    const orderNumber = `SAF-${Date.now().toString().slice(-6)}`;
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_city: order.customerCity,
        customer_address: order.customerAddress,
        items: order.items,
        total: order.total,
        status: 'pending',
        notes: order.notes || '',
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.order_number,
      date: data.created_at.split('T')[0],
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerCity: data.customer_city || '',
      customerAddress: data.customer_address || '',
      items: data.items,
      total: Number(data.total),
      status: data.status,
      notes: data.notes || '',
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

export async function updateOrderStatus(orderNumber: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_number', orderNumber);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

// ============ STORE SETTINGS ============

export async function getStoreSettings(): Promise<Partial<StoreInfo>> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*');
    
    if (error) throw error;
    
    const settings: any = {};
    data.forEach((row: any) => {
      settings[row.key] = row.value;
    });
    
    return settings;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return {};
  }
}

export async function saveStoreSettings(key: string, value: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving store settings:', error);
    return false;
  }
}

// ============ LOGO UPLOAD ============

export async function uploadLogo(file: File): Promise<{ url: string; error: string | null }> {
  const fileName = `logo-${Date.now()}-${file.name}`;
  return uploadFile(BUCKETS.LOGOS, file, fileName);
}

// ============ AUTH ============

export async function checkAuth(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function onAuthStateChange(callback: (authenticated: boolean) => void) {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session);
  });
}

// Unused variable fix
// Fix for unused variable warning in logout function
export async function logoutWithCallback(callback?: () => void): Promise<void> {
  await supabase.auth.signOut();
  if (callback) callback();
}
