import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
}

interface Product {
  id: string;
  name: string;
  name_en: string;
  name_fr: string;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string;
  category: string;
  color: string;
  tag: string | null;
  description: string;
  description_en: string;
  description_fr: string;
  materials_dimensions: string;
  materials_dimensions_en: string;
  materials_dimensions_fr: string;
  care_guide: string;
  care_guide_en: string;
  care_guide_fr: string;
  additional_images: string[];
  video_url: string;
  show_video: boolean;
  show_gallery: boolean;
  show_care_guide: boolean;
  show_dimensions: boolean;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: any;
  loading: boolean;
  fetchStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      // 1. جلب المنتجات بالكامل
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(productsData || []);

      // 2. جلب المجموعات والتصنيفات الديناميكية
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name_ar');
      setCategories(categoriesData || []);

      // 3. جلب الإعدادات والروابط وتفكيك الـ JSONB
      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*');
      
      if (settingsData) {
        const settingsObj: any = {};
        settingsData.forEach((row: any) => {
          settingsObj[row.key] = row.value;
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  return (
    <StoreContext.Provider value={{ products, categories, settings, loading, fetchStoreData }}>
      {children}
    </StoreContext.Provider>
  );
};
