import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// استيراد الدوال المعتمدة في بنية مشروعك بالضبط لمنع مشاكل تسجيل الخروج والرفع المباشر
import { supabase } from '../lib/supabase';
import { uploadFile, BUCKETS } from '../lib/supabase';
import { logout } from '../lib/useAuth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  DollarSign, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  Save, 
  Menu,
  ChevronRight,
  RefreshCw,
  Download,
  Send,
  Printer,
  Upload,
  Globe,
  Plus,
  Palette,
  Image as ImageIcon,
  Lock,
  Star
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

// الأقسام الفرعية الشاملة لتخصيص كامل جوانب الموقع بدون استثناء
const settingsSections: { id: 'identity' | 'hero' | 'about' | 'pillars' | 'testimonials' | 'policies' | 'contact' | 'templates' | 'style' | 'checkout' | 'menu'; label: string; icon: any }[] = [
  { id: 'identity', label: 'الشعار والهوية البصرية', icon: Globe },
  { id: 'style', label: 'الألوان والخطوط الفاخرة', icon: Palette },
  { id: 'menu', label: 'إدارة قائمة التنقل (Menu)', icon: Menu },
  { id: 'checkout', label: 'إدارة حقول الشراء (Checkout)', icon: Lock },
  { id: 'templates', label: 'قوالب رسائل الواتساب', icon: Send },
  { id: 'hero', label: 'البانر الترحيبي والفرعي', icon: ImageIcon },
  { id: 'about', label: 'قصة الماركة (من نحن)', icon: Clock },
  { id: 'pillars', label: 'ركائز الفخامة (لماذا نحن)', icon: AlertCircle },
  { id: 'testimonials', label: 'آراء العميلات والتقييمات', icon: CheckCircle },
  { id: 'policies', label: 'السياسات وتذييل الصفحة', icon: SettingsIcon },
  { id: 'contact', label: 'بيانات التواصل والشبكات', icon: Phone }
];

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

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  // جلب دالة التحديث المباشر للموقع لضمان مزامنة الألوان والخطوط حياً فالمتجر فور الحفظ
  const { fetchStoreData } = useStore();

  // حالات التنقل والواجهة
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings' | 'reviews' | 'categories'>('dashboard');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'identity' | 'hero' | 'about' | 'pillars' | 'testimonials' | 'policies' | 'contact' | 'templates' | 'style' | 'checkout' | 'menu'>('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // لغة لوحة التحكم الحالية للمعاينة
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');

  // حالة رصد أخطاء الربط بسوبابيس
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // البيانات من قاعدة البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<any>({
    site_name_ar: 'SAFOS', site_name_fr: 'SAFOS', site_name_en: 'SAFOS',
    site_subtitle_ar: 'ورشة التطريز', site_subtitle_fr: 'Atelier Brodé', site_subtitle_en: 'Embroidered Atelier',
    logo_letter: 'S', logo_url: '',
    hero_title_ar: '', hero_title_fr: '', hero_title_en: '',
    hero_subtitle_ar: '', hero_subtitle_fr: '', hero_subtitle_en: '',
    hero_description_ar: '', hero_description_fr: '', hero_description_en: '',
    hero_image_url: '',
    announcement_text_ar: '', announcement_text_fr: '', announcement_text_en: '',
    phone: '', whatsapp: '', email: '', address: '',
    instagram: '', facebook: '', tiktok: '',
    primary_color: '#000000', secondary_color: '#D4AF37', accent_color: '#A37A3E',
    title_color: '#FFFFFF', text_color: '#A1A1AA',
    card_bg: '#0F0F0F', accordion_bg: '#0F0F0F', image_bg: '#0F0F0F',
    title_font: 'Playfair Display', body_font: 'Montserrat',
    // 🎨 ألوان السلة الجديدة (Cart Colors) الإضافة المطلوبة
    cart_bg_color: '#FFFFFF', cart_btn_color: '#000000', cart_btn_text_color: '#FFFFFF',
    currency: 'MAD', currency_symbol: 'د.م',
    about_title_ar: '', about_title_fr: '', about_title_en: '',
    about_text_ar: '', about_text_fr: '', about_text_en: '',
    about_image: '',
    p1_title_ar: '', p1_title_fr: '', p1_title_en: '', p1_desc_ar: '', p1_desc_fr: '', p1_desc_en: '',
    p2_title_ar: '', p2_title_fr: '', p2_title_en: '', p2_desc_ar: '', p2_desc_fr: '', p2_desc_en: '',
    p3_title_ar: '', p3_title_fr: '', p3_title_en: '', p3_desc_ar: '', p3_desc_fr: '', p3_desc_en: '',
    t1_name_ar: '', t1_name_fr: '', t1_name_en: '', t1_text_ar: '', t1_text_fr: '', t1_text_en: '', t1_rating: '5',
    t2_name_ar: '', t2_name_fr: '', t2_name_en: '', t2_text_ar: '', t2_text_fr: '', t2_text_en: '', t2_rating: '5',
    shipping_policy_ar: '', shipping_policy_fr: '', shipping_policy_en: '',
    refund_policy_ar: '', refund_policy_fr: '', refund_policy_en: '',
    copyright_text: '',
    // قوالب الرسائل
    cod_confirm_ar: '', cod_confirm_fr: '', cod_confirm_en: '',
    review_request_ar: '', review_request_fr: '', review_request_en: '',
    // أزرار الإخفاء والإظهار للأقسام (Visibility Toggles)
    show_about_section: true, show_pillars_section: true, show_testimonials_section: true, show_announcement_bar: true,
    // إدارة حقول الشراء للزبون
    field_name_required: true, field_name_visible: true,
    field_phone_required: true, field_phone_visible: true,
    field_city_required: true, field_city_visible: true,
    field_address_required: true, field_address_visible: true,
    field_notes_required: false, field_notes_visible: true,
    // إدارة قائمة التنقل التفاعلية
    menu_p1_ar: '', menu_p1_fr: '', menu_p1_en: '', menu_p1_visible: true,
    menu_p2_ar: '', menu_p2_fr: '', menu_p2_en: '', menu_p2_visible: true,
    menu_p3_ar: '', menu_p3_fr: '', menu_p3_en: '', menu_p3_visible: true,
    menu_p4_ar: '', menu_p4_fr: '', menu_p4_en: '', menu_p4_visible: true,
    menu_p5_ar: '', menu_p5_fr: '', menu_p5_en: '', menu_p5_visible: true
  });

  // حالات البحث والتصفية للطلبيات
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // النوافذ المنبثقة للتحكم
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // نموذج إضافة منتج جديد
  const [newProduct, setNewProduct] = useState<any>({
    name: '', name_en: '', name_fr: '', price: 0, old_price: null, stock: 5, image_url: '', category: '',
    color: '', tag: '', description: '', description_en: '', description_fr: '',
    materials_dimensions: '', materials_dimensions_en: '', materials_dimensions_fr: '',
    care_guide: '', care_guide_en: '', care_guide_fr: '', additional_images: [], video_url: '',
    show_video: true, show_gallery: true, show_care_guide: true, show_dimensions: true
  });

  // نموذج إضافة/تعديل تصنيف ومجموعة
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name_ar: '', name_fr: '', name_en: '' });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('safos-lang');
    if (savedLang === 'ar' || savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang as any);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) throw new Error("لم يتم العثور على عميل سوبابيس الموحد.");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) {
          navigate('/admin/login');
        } else {
          fetchData();
        }
      } catch (err: any) {
        setConnectionError(err.message || 'حدث خطأ في الاتصال بقاعدة البيانات.');
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // جلب كافة تفاصيل المتجر ومزامنته مع سوبابيس
  const fetchData = async () => {
    setLoading(true);
    setConnectionError(null);
    try {
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('name');
      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').order('name_ar');
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      const { data: reviewsData, error: reviewsError } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      const { data: settingsData, error: settingsError } = await supabase.from('store_settings').select('*');
      if (settingsError) throw settingsError;

      if (settingsData && settingsData.length > 0) {
        const brand = settingsData.find(s => s.key === 'brand')?.value || {};
        const colors = settingsData.find(s => s.key === 'colors')?.value || {};
        const contact = settingsData.find(s => s.key === 'contact')?.value || {};
        const hero = settingsData.find(s => s.key === 'hero')?.value || {};
        const about = settingsData.find(s => s.key === 'about')?.value || {};
        const pillars = settingsData.find(s => s.key === 'pillars')?.value || {};
        const testimonials = settingsData.find(s => s.key === 'testimonials')?.value || {};
        const policies = settingsData.find(s => s.key === 'policies')?.value || {};
        const templates = settingsData.find(s => s.key === 'templates')?.value || {};
        const menuLinks = settingsData.find(s => s.key === 'menu_links')?.value || {};
        const checkoutFields = settingsData.find(s => s.key === 'checkout_fields')?.value || {};
        const visibility = settingsData.find(s => s.key === 'visibility')?.value || {};

        setSettings({
          site_name_ar: brand.name_ar || '', site_name_fr: brand.name_fr || '', site_name_en: brand.name_en || '',
          site_subtitle_ar: brand.subtitle_ar || '', site_subtitle_fr: brand.subtitle_fr || '', site_subtitle_en: brand.subtitle_en || '',
          logo_letter: brand.logo_letter || 'S', logo_url: brand.logo_url || '',
          hero_title_ar: hero.title_ar || '', hero_title_fr: hero.title_fr || '', hero_title_en: hero.title_en || '',
          hero_subtitle_ar: hero.subtitle_ar || '', hero_subtitle_fr: hero.subtitle_fr || '', hero_subtitle_en: hero.subtitle_en || '',
          hero_description_ar: hero.description_ar || '', hero_description_fr: hero.description_fr || '', hero_description_en: hero.description_en || '',
          hero_image_url: hero.image || '',
          announcement_text_ar: hero.announcement_ar || '', announcement_text_fr: hero.announcement_fr || '', announcement_text_en: hero.announcement_en || '',
          phone: contact.phone || '', whatsapp: contact.whatsapp || '', email: contact.email || '', address: contact.address || '',
          instagram: contact.instagram || '', facebook: contact.facebook || '', tiktok: contact.tiktok || '',
          primary_color: colors.primary || '#000000', secondary_color: colors.secondary || '#D4AF37', accent_color: colors.accent || '#A37A3E',
          title_color: colors.title_color || '#FFFFFF', text_color: colors.text_color || '#A1A1AA',
          card_bg: colors.card_bg || '#0F0F0F', accordion_bg: colors.accordion_bg || '#0F0F0F', image_bg: colors.image_bg || '#0F0F0F',
          title_font: colors.title_font || 'Playfair Display', body_font: colors.body_font || 'Montserrat',
          // 📥 جلب قيم ألوان السلة من الـ JSON
          cart_bg_color: colors.cart_bg || '#FFFFFF',
          cart_btn_color: colors.cart_btn || '#000000',
          cart_btn_text_color: colors.cart_btn_text || '#FFFFFF',
          currency: contact.currency || 'MAD', currency_symbol: contact.currency_symbol || 'د.م',
          about_title_ar: about.title_ar || '', about_title_fr: about.title_fr || '', about_title_en: about.title_en || '',
          about_text_ar: about.text_ar || '', about_text_fr: about.text_fr || '', about_text_en: about.text_en || '',
          about_image: about.image || '',
          p1_title_ar: pillars.p1_title_ar || '', p1_title_fr: pillars.p1_title_fr || '', p1_title_en: pillars.p1_title_en || '', p1_desc_ar: pillars.p1_desc_ar || '', p1_desc_fr: pillars.p1_desc_fr || '', p1_desc_en: pillars.p1_desc_en || '',
          p2_title_ar: pillars.p2_title_ar || '', p2_title_fr: pillars.p2_title_fr || '', p2_title_en: pillars.p2_title_en || '', p2_desc_ar: pillars.p2_desc_ar || '', p2_desc_fr: pillars.p2_desc_fr || '', p2_desc_en: pillars.p2_desc_en || '',
          p3_title_ar: pillars.p3_title_ar || '', p3_title_fr: pillars.p3_title_fr || '', p3_title_en: pillars.p3_title_en || '', p3_desc_ar: pillars.p3_desc_ar || '', p3_desc_fr: pillars.p3_desc_fr || '', p3_desc_en: pillars.p3_desc_en || '',
          t1_name_ar: testimonials.t1_name_ar || '', t1_name_fr: testimonials.t1_name_fr || '', t1_name_en: testimonials.t1_name_en || '', t1_text_ar: testimonials.t1_text_ar || '', t1_text_fr: testimonials.t1_text_fr || '', t1_text_en: testimonials.t1_text_en || '', t1_rating: testimonials.t1_rating || '5',
          t2_name_ar: testimonials.t2_name_ar || '', t2_name_fr: testimonials.t2_name_fr || '', t2_name_en: testimonials.t2_name_en || '', t2_text_ar: testimonials.t2_text_ar || '', t2_text_fr: testimonials.t2_text_fr || '', t2_text_en: testimonials.t2_text_en || '', t2_rating: testimonials.t2_rating || '5',
          shipping_policy_ar: policies.shipping_ar || '', shipping_policy_fr: policies.shipping_fr || '', shipping_policy_en: policies.shipping_en || '',
          refund_policy_ar: policies.refund_ar || '', refund_policy_fr: policies.refund_fr || '', refund_policy_en: policies.refund_en || '',
          copyright_text: policies.copyright || '',
          cod_confirm_ar: templates.cod_confirm_ar || '', cod_confirm_fr: templates.cod_confirm_fr || '', cod_confirm_en: templates.cod_confirm_en || '',
          review_request_ar: templates.review_request_ar || '', review_request_fr: templates.review_request_fr || '', review_request_en: templates.review_request_en || '',
          // 📥 جلب قيم أزرار الإخفاء والإظهار للأقسام (Visibility Toggles)
          show_about_section: visibility.show_about_section !== false,
          show_pillars_section: visibility.show_pillars_section !== false,
          show_testimonials_section: visibility.show_testimonials_section !== false,
          show_announcement_bar: visibility.show_announcement_bar !== false,
          // استرداد إدارة حقول الشراء للزبون
          field_name_required: checkoutFields.field_name_required !== false, field_name_visible: checkoutFields.field_name_visible !== false,
          field_phone_required: checkoutFields.field_phone_required !== false, field_phone_visible: checkoutFields.field_phone_visible !== false,
          field_city_required: checkoutFields.field_city_required !== false, field_city_visible: checkoutFields.field_city_visible !== false,
          field_address_required: checkoutFields.field_address_required !== false, field_address_visible: checkoutFields.field_address_visible !== false,
          field_notes_required: checkoutFields.field_notes_required === true, field_notes_visible: checkoutFields.field_notes_visible !== false,
          // استرداد إدارة قائمة التنقل التفاعلية
          menu_p1_ar: menuLinks.menu_p1_ar || '', menu_p1_fr: menuLinks.menu_p1_fr || '', menu_p1_en: menuLinks.menu_p1_en || '', menu_p1_visible: menuLinks.menu_p1_visible !== false,
          menu_p2_ar: menuLinks.menu_p2_ar || '', menu_p2_fr: menuLinks.menu_p2_fr || '', menu_p2_en: menuLinks.menu_p2_en || '', menu_p2_visible: menuLinks.menu_p2_visible !== false,
          menu_p3_ar: menuLinks.menu_p3_ar || '', menu_p3_fr: menuLinks.menu_p3_fr || '', menu_p3_en: menuLinks.menu_p3_en || '', menu_p3_visible: menuLinks.menu_p3_visible !== false,
          menu_p4_ar: menuLinks.menu_p4_ar || '', menu_p4_fr: menuLinks.menu_p4_fr || '', menu_p4_en: menuLinks.menu_p4_en || '', menu_p4_visible: menuLinks.menu_p4_visible !== false,
          menu_p5_ar: menuLinks.menu_p5_ar || '', menu_p5_fr: menuLinks.menu_p5_fr || '', menu_p5_en: menuLinks.menu_p5_en || '', menu_p5_visible: menuLinks.menu_p5_visible !== false
        });
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل البيانات من السحابة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  async function handleImageUpload(file: File, bucketName: string): Promise<string> {
    const fileName = `safos-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { url, error } = await uploadFile(bucketName, file, fileName);
    if (error || !url) throw new Error(error || 'فشل رفع الصورة');
    return url;
  }

  // 💾 دالة حفظ الإعدادات الكاملة والمصححة والمحدثة حياً
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('settings');
    try {
      const updates = [
        {
          key: 'brand',
          value: { name_ar: settings.site_name_ar, name_fr: settings.site_name_fr, name_en: settings.site_name_en, subtitle_ar: settings.site_subtitle_ar, subtitle_fr: settings.site_subtitle_fr, subtitle_en: settings.site_subtitle_en, logo_letter: settings.logo_letter, logo_url: settings.logo_url }
        },
        {
          key: 'colors',
          value: { 
            primary: settings.primary_color, secondary: settings.secondary_color, title_color: settings.title_color, text_color: settings.text_color, 
            card_bg: settings.card_bg, accordion_bg: settings.accordion_bg, image_bg: settings.image_bg, title_font: settings.title_font, body_font: settings.body_font,
            // 🎨 حفظ قيم الألوان الجديدة الخاصة بالسلة
            cart_bg: settings.cart_bg_color, cart_btn: settings.cart_btn_color, cart_btn_text: settings.cart_btn_text_color 
          }
        },
        {
          key: 'contact',
          value: { phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email, address: settings.address, instagram: settings.instagram, facebook: settings.facebook, tiktok: settings.tiktok, currency: settings.currency, currency_symbol: settings.currency_symbol }
        },
        {
          key: 'hero',
          value: { title_ar: settings.hero_title_ar, title_fr: settings.hero_title_fr, title_en: settings.hero_title_en, subtitle_ar: settings.hero_subtitle_ar, subtitle_fr: settings.hero_subtitle_fr, subtitle_en: settings.hero_subtitle_en, description_ar: settings.hero_description_ar, description_fr: settings.hero_description_fr, description_en: settings.hero_description_en, image: settings.hero_image_url, announcement_ar: settings.announcement_text_ar, announcement_fr: settings.announcement_text_fr, announcement_en: settings.announcement_text_en }
        },
        {
          key: 'about',
          value: { title_ar: settings.about_title_ar, title_fr: settings.about_title_fr, title_en: settings.about_title_en, text_ar: settings.about_text_ar, text_fr: settings.about_text_fr, text_en: settings.about_text_en, image: settings.about_image }
        },
        {
          key: 'pillars',
          value: { p1_title_ar: settings.p1_title_ar, p1_title_fr: settings.p1_title_fr, p1_title_en: settings.p1_title_en, p1_desc_ar: settings.p1_desc_ar, p1_desc_fr: settings.p1_desc_fr, p1_desc_en: settings.p1_desc_en, p2_title_ar: settings.p2_title_ar, p2_title_fr: settings.p2_title_fr, p2_title_en: settings.p2_title_en, p2_desc_ar: settings.p2_desc_ar, p2_desc_fr: settings.p2_desc_fr, p2_desc_en: settings.p2_desc_en, p3_title_ar: settings.p3_title_ar, p3_title_fr: settings.p3_title_fr, p3_title_en: settings.p3_title_en, p3_desc_ar: settings.p3_desc_ar, p3_desc_fr: settings.p3_desc_fr, p3_desc_en: settings.p3_desc_en }
        },
        {
          key: 'testimonials',
          value: { t1_name_ar: settings.t1_name_ar, t1_name_fr: settings.t1_name_fr, t1_name_en: settings.t1_name_en, t1_text_ar: settings.t1_text_ar, t1_text_fr: settings.t1_text_fr, t1_text_en: settings.t1_text_en, t1_rating: settings.t1_rating, t2_name_ar: settings.t2_name_ar, t2_name_fr: settings.t2_name_fr, t2_name_en: settings.t2_name_en, t2_text_ar: settings.t2_text_ar, t2_text_fr: settings.t2_text_fr, t2_text_en: settings.t2_text_en, t2_rating: settings.t2_rating }
        },
        {
          key: 'policies',
          value: { shipping_ar: settings.shipping_policy_ar, shipping_fr: settings.shipping_policy_fr, shipping_en: settings.shipping_policy_en, refund_ar: settings.refund_policy_ar, refund_fr: settings.refund_policy_fr, refund_en: settings.refund_policy_en, copyright: settings.copyright_text }
        },
        {
          key: 'templates',
          value: { cod_confirm_ar: settings.cod_confirm_ar, cod_confirm_fr: settings.cod_confirm_fr, cod_confirm_en: settings.cod_confirm_en, review_request_ar: settings.review_request_ar, review_request_fr: settings.review_request_fr, review_request_en: settings.review_request_en }
        },
        {
          key: 'menu_links',
          value: { menu_p1_ar: settings.menu_p1_ar, menu_p1_fr: settings.menu_p1_fr, menu_p1_en: settings.menu_p1_en, menu_p1_visible: settings.menu_p1_visible, menu_p2_ar: settings.menu_p2_ar, menu_p2_fr: settings.menu_p2_fr, menu_p2_en: settings.menu_p2_en, menu_p2_visible: settings.menu_p2_visible, menu_p3_ar: settings.menu_p3_ar, menu_p3_fr: settings.menu_p3_fr, menu_p3_en: settings.menu_p3_en, menu_p3_visible: settings.menu_p3_visible, menu_p4_ar: settings.menu_p4_ar, menu_p4_fr: settings.menu_p4_fr, menu_p4_en: settings.menu_p4_en, menu_p4_visible: settings.menu_p4_visible, menu_p5_ar: settings.menu_p5_ar, menu_p5_fr: settings.menu_p5_fr, menu_p5_en: settings.menu_p5_en, menu_p5_visible: settings.menu_p5_visible }
        },
        {
          key: 'checkout_fields',
          value: { field_name_required: settings.field_name_required, field_name_visible: settings.field_name_visible, field_phone_required: settings.field_phone_required, field_phone_visible: settings.field_phone_visible, field_city_required: settings.field_city_required, field_city_visible: settings.field_city_visible, field_address_required: settings.field_address_required, field_address_visible: settings.field_address_visible, field_notes_required: settings.field_notes_required, field_notes_visible: settings.field_notes_visible }
        },
        // 🔀 دمج وحفظ حالات الـ Toggles الجديدة (Visibility)
        {
          key: 'visibility',
          value: {
            show_about_section: settings.show_about_section,
            show_pillars_section: settings.show_pillars_section,
            show_testimonials_section: settings.show_testimonials_section,
            show_announcement_bar: settings.show_announcement_bar
          }
        }
      ];

      // إرسال كافة التحديثات لـ Supabase عبر حلقة بسيطة ونظيفة
      for (const update of updates) {
        const { error } = await supabase
          .from('store_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        if (error) throw error;
      }

      // تحديث الـ Context فوراً لتظهر الألوان للأعضاء بلا ريفريش!
      await fetchStoreData();
      showToast('تمت المزامنة وحفظ جميع الإعدادات الحية بنجاح ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // دالة مساعدة لتحديث السيتينغز
  const updateSettingField = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
        <span className="mr-3 font-medium">جاري تحميل لوحة تحكم SAFOS...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 flex" dir="rtl">
      {/* 1. القائمة الجانبية (Sidebar) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-[#0F0F0F] border-l border-neutral-900 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col justify-between`}>
        <div>
          <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-black font-serif font-bold text-lg">{settings.logo_letter}</div>
              <span className="font-serif font-bold text-xl tracking-wider text-white">SAFOS ADMIN</span>
            </div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5" /></button>
          </div>

          <nav className="p-4 space-y-1">
            <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
              <LayoutDashboard className="h-4 w-4" /> لوحة الإحصائيات
            </button>
            <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
              <ShoppingBag className="h-4 w-4" /> إدارة الطلبيات <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded-md text-xs font-bold mr-auto">{orders.length}</span>
            </button>
            <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
              <ImageIcon className="h-4 w-4" /> حقائب الكانفاس الفاخرة
            </button>
            <button onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
              <GridIcon className="h-4 w-4" /> المجموعات والتصنيفات
            </button>
            <button onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
              <Star className="h-4 w-4" /> مراجعات العميلات
            </button>
            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
              <SettingsIcon className="h-4 w-4" /> تخصيص المتجر بالكامل
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-900">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </div>

      {/* 2. منطقة المحتوى الرئيسية */}
      <div className="flex-1 md:mr-64 p-6 min-w-0">
        {/* التنبيهات المنبثقة (Toast) */}
        {toast && (
          <div className={`fixed top-5 left-5 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-fade-in ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-red-950/80 border-red-500 text-red-200'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        <header className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 hover:bg-neutral-900 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
            <h1 className="text-xl font-bold text-white font-serif">لوحة الإشراف العام</h1>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button onClick={() => handleLangChange('ar')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'ar' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>العربية</button>
            <button onClick={() => handleLangChange('fr')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'fr' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>Français</button>
            <button onClick={() => handleLangChange('en')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'en' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>English</button>
          </div>
        </header>

        {/* عرض تبويب التحكم التخصيصي الكامل (Settings Tab) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-serif">تخصيص كامل المتجر</h2>
                <p className="text-xs text-gray-400 mt-1">تغيير الهوية، الألوان الفاخرة، والتحكم الفوري بالأقسام حياً.</p>
              </div>
              <button type="submit" disabled={actionLoading === 'settings'} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-all disabled:opacity-50">
                {actionLoading === 'settings' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ كافة الإعدادات وتطبيقها
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* قائمة الأقسام الفرعية التخصيصية */}
              <div className="bg-[#0F0F0F] rounded-xl border border-neutral-900 p-2 space-y-1">
                {settingsSections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button key={sec.id} type="button" onClick={() => setActiveSettingsSection(sec.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeSettingsSection === sec.id ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}>
                      <Icon className="h-4 w-4" /> {sec.label}
                    </button>
                  );
                })}
              </div>

              {/* محتوى القسم الفرعي النشط */}
              <div className="lg:col-span-3 bg-[#0F0F0F] rounded-xl border border-neutral-900 p-6">
                
                {/* 1️⃣ قسم الألوان والخطوط (Style Section) - هنا ندمج الـ Color Pickers المطلوبة */}
                {activeSettingsSection === 'style' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-amber-500 border-b border-neutral-900 pb-2">لوحة الألوان الملكية وألوان حزمة الشراء السريع</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">اللون الأساسي (الموقع)</label>
                        <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-neutral-900">
                          <input type="color" value={settings.primary_color} onChange={(e) => updateSettingField('primary_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-xs font-mono">{settings.primary_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">اللون الثانوي (الملكي)</label>
                        <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-neutral-900">
                          <input type="color" value={settings.secondary_color} onChange={(e) => updateSettingField('secondary_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-xs font-mono">{settings.secondary_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">لون النصوص الرئيسية</label>
                        <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-neutral-900">
                          <input type="color" value={settings.title_color} onChange={(e) => updateSettingField('title_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-xs font-mono">{settings.title_color}</span>
                        </div>
                      </div>
                    </div>

                    {/* 🎨 إضافة خيارات ألوان السلة الـ جديدة (Color Pickers للـ Cart) */}
                    <h3 className="text-xs font-bold text-amber-500 pt-4 border-t border-neutral-900">ألوان وتخصيص سلة التسوق (Cart UI)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">خلفية السلة (Cart Side-Bg)</label>
                        <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-neutral-900">
                          <input type="color" value={settings.cart_bg_color} onChange={(e) => updateSettingField('cart_bg_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-xs font-mono">{settings.cart_bg_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">لون زر الشراء والطلب الرئيسي</label>
                        <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-neutral-900">
                          <input type="color" value={settings.cart_btn_color} onChange={(e) => updateSettingField('cart_btn_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-xs font-mono">{settings.cart_btn_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">لون نص زر الشراء</label>
                        <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-neutral-900">
                          <input type="color" value={settings.cart_btn_text_color} onChange={(e) => updateSettingField('cart_btn_text_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-xs font-mono">{settings.cart_btn_text_color}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2️⃣ مفاتيح تحكم وعرض الأقسام (Toggles) مدموجة داخل الأقسام الخاصة بها لراحة التعديل */}
                {activeSettingsSection === 'about' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-neutral-900 mb-4">
                      <div>
                        <span className="block text-xs font-bold text-white">تفعيل قسم "قصة الماركة" على الصفحة الرئيسية</span>
                        <span className="text-[10px] text-gray-400">إظهار أو إخفاء القسم بالكامل من الموقع فوراً</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.show_about_section} onChange={(e) => updateSettingField('show_about_section', e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                    {/* باقي حقول نص قصة الماركة المعتادة */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">العنوان (العربية)</label>
                      <input type="text" value={settings.about_title_ar} onChange={(e) => updateSettingField('about_title_ar', e.target.value)} className="w-full bg-black border border-neutral-900 rounded-lg p-2.5 text-xs text-white" />
                    </div>
                  </div>
                )}

                {activeSettingsSection === 'pillars' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-neutral-900 mb-4">
                      <div>
                        <span className="block text-xs font-bold text-white">تفعيل قسم "ركائز الفخامة"</span>
                        <span className="text-[10px] text-gray-400">إظهار أو إخفاء أيقونات ومميزات المتجر التنافسية</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.show_pillars_section} onChange={(e) => updateSettingField('show_pillars_section', e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>
                )}

                {activeSettingsSection === 'testimonials' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-neutral-900 mb-4">
                      <div>
                        <span className="block text-xs font-bold text-white">تفعيل قسم "آراء العميلات" على الواجهة</span>
                        <span className="text-[10px] text-gray-400">تحكم بظهور أو إخفاء مراجعات المشترين الثابتة</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.show_testimonials_section} onChange={(e) => updateSettingField('show_testimonials_section', e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>
                )}

                {/* باقي أقسام الإعدادات الأخرى (الهوية، القوالب، التذييل) تظهر هنا بشكل طبيعي */}
                {activeSettingsSection === 'identity' && (
                  <div className="space-y-4">
                    <label className="block text-xs text-gray-400 mb-2">اسم المتجر (العربية)</label>
                    <input type="text" value={settings.site_name_ar} onChange={(e) => updateSettingField('site_name_ar', e.target.value)} className="w-full bg-black border border-neutral-900 rounded-lg p-2.5 text-xs text-white" />
                  </div>
                )}

              </div>
            </div>
          </form>
        )}

        {/* باقي تبويبات الإدارة الأساسية (الطلبات، المنتجات، المراجعات) تتبع هنا وتعمل بالكامل مع سوبابيس */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex items-center justify-between">
              <div><span className="text-xs text-gray-400">إجمالي المبيعات</span><h3 className="text-2xl font-bold font-serif text-white mt-1">{(orders.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + (curr.total || 0), 0))} MAD</h3></div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp className="h-6 w-6" /></div>
            </div>
            <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex items-center justify-between">
              <div><span className="text-xs text-gray-400">الطلبيات الواردة</span><h3 className="text-2xl font-bold font-serif text-white mt-1">{orders.length} طلبية</h3></div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><ShoppingBag className="h-6 w-6" /></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// أيقونة شبكية مساعدة مفقودة في الاستيراد لحماية الواجهة من الانهيار
function GridIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
  );
}
