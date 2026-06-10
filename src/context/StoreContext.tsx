import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 🔹 تعريف أنواع البيانات للتصنيفات
interface Category {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
}

// 🔹 تعريف أنواع البيانات للمنتجات
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

// 🔹 تعريف عناصر سلة التسوق
interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

// 🔹 القيم الافتراضية الذكية للهوية البصرية وإخفاء الأقسام لحماية الموقع من الانهيار
const defaultSettings: any = {
  colors: {
    primary: '#0A0A0A',
    secondary: '#D4AF37',
    title_color: '#FFFFFF',
    text_color: '#A1A1AA',
    card_bg: '#0F0F0F',
    image_bg: '#0F0F0F',
    title_font: 'Playfair Display, sans-serif',
    body_font: 'Montserrat, sans-serif',
    // 🛒 ألوان السلة الجديدة المضافة للتحكم بها من لوحة التحكم حياً
    cart_bg: '#0F0F0F',
    cart_btn: '#D4AF37',
    cart_btn_text: '#000000',
    cart_text: '#FFFFFF'
  },
  visibility: {
    show_announcement_bar: true,
    show_about_section: true,
    show_pillars_section: true,
    show_testimonials_section: true,
  },
  show_pillars_section: true,
  show_about_section: true,
  show_testimonials_section: true,
  brand: {
    name_ar: 'SAFOS',
    subtitle_ar: 'Atelier',
    logo_url: ''
  },
  hero: {
    announcement_ar: 'شحن مجاني وسريع لكافة المدن المغربية',
    title_ar: 'فخامة التطريز اليدوي\nتلتقي بالتصميم العصري',
    description_ar: 'اكتشفي تشكيلة حقائب الكانفاس الحصرية والمطرزة باليد على يد أمهر الحرفيين بمراكش.'
  },
  contact: {
    currency_symbol: 'د.م.',
    currency: 'MAD',
    whatsapp: '',
    instagram: '',
    tiktok: ''
  }
};

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: any;
  cart: CartItem[];
  loading: boolean;
  fetchStoreData: () => void;
  addToCart: (product: Product, quantity: number, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
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
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 📥 جلب البيانات الحية من Supabase ومزامنتها مع الإعدادات الافتراضية
  const fetchStoreData = async () => {
    setLoading(true);
    try {
      // 1. جلب المنتجات
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(productsData || []);

      // 2. جلب التصنيفات
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name_ar');
      setCategories(categoriesData || []);

      // 3. جلب إعدادات المتجر وعمل دمج آمن (Safe Deep Merge) مع القيم الافتراضية
      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*');
      
      if (settingsData) {
        const settingsObj: any = { ...defaultSettings };
        
        settingsData.forEach((row: any) => {
          // إذا كانت القيمة عبارة عن كائن (Object) مثل الألوان أو الرؤية، ندمجها بلطف لتفادي فقدان الخصائص الفرعية
          if (row.value && typeof row.value === 'object' && !Array.isArray(row.value)) {
            settingsObj[row.key] = {
              ...defaultSettings[row.key],
              ...row.value
            };
          } else {
            settingsObj[row.key] = row.value;
          }
        });

        // تأكيد وجود المفاتيح المباشرة للرؤية لتتوافق مع شروط الهوم بيج بكل مرونة
        if (settingsObj.visibility) {
          settingsObj.show_pillars_section = settingsObj.visibility.show_pillars_section;
          settingsObj.show_about_section = settingsObj.visibility.show_about_section;
          settingsObj.show_testimonials_section = settingsObj.visibility.show_testimonials_section;
        }
        
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error fetching store data from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🛒 إدارة سلة التسوق محلياً ومزامنتها مع المتصفح
  useEffect(() => {
    const savedCart = localStorage.getItem('safos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    }
    fetchStoreData();
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('safos_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity: number, color?: string) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    const newCart = [...cart];

    if (existingItemIndex > -1) {
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity, selectedColor: color || product.color });
    }
    saveCartToStorage(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCartToStorage(newCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCartToStorage(newCart);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <StoreContext.Provider value={{ 
      products, 
      categories, 
      settings, 
      cart, 
      loading, 
      fetchStoreData,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </StoreContext.Provider>
  );
};
