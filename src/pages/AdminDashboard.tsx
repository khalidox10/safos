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
    admin_bg_color: '#FFFFFF', admin_card_bg: '#F4F4F5', admin_text_color: '#18181B',
    admin_button_bg_color: '#18181B', admin_button_text_color: '#FFFFFF',
    button_bg_color: '#D4AF37', button_text_color: '#000000',
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
    field_name_ar: '', field_name_fr: '', field_name_en: '', field_name_required: true, field_name_visible: true,
    field_phone_ar: '', field_phone_fr: '', field_phone_en: '', field_phone_required: true, field_phone_visible: true,
    field_city_ar: '', field_city_fr: '', field_city_en: '', field_city_required: true, field_city_visible: true,
    field_address_ar: '', field_address_fr: '', field_address_en: '', field_address_required: true, field_address_visible: true,
    field_notes_ar: '', field_notes_fr: '', field_notes_en: '', field_notes_required: false, field_notes_visible: true,
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
  const [paymentFilter, setPaymentFilter] = useState('all');

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

  const handleLangChange = (newLang: 'ar' | 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('safos-lang', newLang);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          throw new Error("لم يتم العثور على عميل سوبابيس الموحد.");
        }
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
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name_ar');
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      const { data: settingsData, error: settingsError } = await supabase
        .from('store_settings')
        .select('*');
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
          admin_bg_color: colors.admin_bg_color || '#FFFFFF', admin_card_bg: colors.admin_card_bg || '#F4F4F5', admin_text_color: colors.admin_text_color || '#18181B',
          admin_button_bg_color: colors.admin_button_bg_color || '#18181B', admin_button_text_color: colors.admin_button_text_color || '#FFFFFF',
          button_bg_color: colors.button_bg_color || '#D4AF37', button_text_color: colors.button_text_color || '#000000',
          currency: contact.currency || 'MAD', currency_symbol: contact.currency_symbol || 'د.م',
          about_title_ar: about.title_ar || '', about_title_fr: about.title_fr || '', about_title_en: about.title_en || '',
          about_text_ar: about.text_ar || '', about_text_fr: about.text_fr || '', about_text_en: about.text_en || '',
          about_image: about.image || '',
          p1_title_ar: pillars.p1_title_ar || '', p1_title_fr: pillars.p1_title_fr || '', p1_title_en: pillars.p1_title_en || '', p1_desc_ar: pillars.p1_desc_ar || '', p1_desc_fr: pillars.p1_desc_fr || '', p1_desc_en: pillars.p1_desc_en || '',
          p2_title_ar: pillars.p2_title_ar || '', p2_title_fr: pillars.p2_title_fr || '', p2_title_en: pillars.p2_title_en || '', p2_desc_ar: pillars.p2_desc_ar || '', p2_desc_fr: pillars.p2_desc_fr || '', p2_desc_en: pillars.p2_desc_en || '',
          p3_title_ar: pillars.p3_title_ar || '', p3_title_fr: pillars.p3_title_fr || '', p3_title_en: pillars.p3_title_en || '', p3_desc_ar: pillars.p3_desc_ar || '', p3_desc_fr: pillars.p3_desc_fr || '', p3_desc_en: pillars.p3_desc_en || '',
          t1_name_ar: testimonials.t1_name_ar || '', t1_name_fr: testimonials.t1_name_fr || '', t1_name_en: testimonials.t1_name_en || '', t1_text_ar: testimonials.t1_text_ar || '', t1_text_fr: testimonials.t1_text_fr || '', t1_text_en: testimonials.t1_text_en || '', t1_rating: testimonials.t1_rating || '5',
          t2_name_ar: testimonials.t2_name_ar || '', t2_name_fr: testimonials.t2_name_fr || '', t2_name_en: testimonials.t2_name_en || '', t2_text_ar: testimonials.t2_text_ar || '', t2_text_fr: settings.testimonials?.t2_text_fr || '', t2_text_en: testimonials.t2_text_en || '', t2_rating: testimonials.t2_rating || '5',
          shipping_policy_ar: policies.shipping_ar || '', shipping_policy_fr: policies.shipping_fr || '', shipping_policy_en: policies.shipping_en || '',
          refund_policy_ar: policies.refund_ar || '', refund_policy_fr: policies.refund_fr || '', refund_policy_en: policies.refund_en || '',
          copyright_text: policies.copyright || '',
          // استرداد قوالب رسائل الواتساب
          cod_confirm_ar: templates.cod_confirm_ar || '', cod_confirm_fr: templates.cod_confirm_fr || '', cod_confirm_en: templates.cod_confirm_en || '',
          review_request_ar: templates.review_request_ar || '', review_request_fr: templates.review_request_fr || '', review_request_en: templates.review_request_en || '',
          // استرداد أزرار الإخفاء والإظهار للأقسام (Visibility Toggles)
          show_about_section: visibility.show_about_section !== false,
          show_pillars_section: visibility.show_pillars_section !== false,
          show_testimonials_section: visibility.show_testimonials_section !== false,
          show_announcement_bar: visibility.show_announcement_bar !== false,
          // استرداد إدارة حقول الشراء للزبون
          field_name_ar: checkoutFields.field_name_ar || '', field_name_fr: checkoutFields.field_name_fr || '', field_name_en: checkoutFields.field_name_en || '', field_name_required: checkoutFields.field_name_required !== false, field_name_visible: checkoutFields.field_name_visible !== false,
          field_phone_ar: checkoutFields.field_phone_ar || '', field_phone_fr: checkoutFields.field_phone_fr || '', field_phone_en: checkoutFields.field_phone_en || '', field_phone_required: checkoutFields.field_phone_required !== false, field_phone_visible: checkoutFields.field_phone_visible !== false,
          field_city_ar: checkoutFields.field_city_ar || '', field_city_fr: checkoutFields.field_city_fr || '', field_city_en: checkoutFields.field_city_en || '', field_city_required: checkoutFields.field_city_required !== false, field_city_visible: checkoutFields.field_city_visible !== false,
          field_address_ar: checkoutFields.field_address_ar || '', field_address_fr: checkoutFields.field_address_fr || '', field_address_en: checkoutFields.field_address_en || '', field_address_required: checkoutFields.field_address_required !== false, field_address_visible: checkoutFields.field_address_visible !== false,
          field_notes_ar: checkoutFields.field_notes_ar || '', field_notes_fr: checkoutFields.field_notes_fr || '', field_notes_en: checkoutFields.field_notes_en || '', field_notes_required: checkoutFields.field_notes_required === true, field_notes_visible: checkoutFields.field_notes_visible !== false,
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

  // دالة تسجيل الخروج المعتمدة في بنية مشروعك الخاص ( useAuth )
  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  // دالة رفع الصور المعتمدة فالمشروع لرفع جميع ملفات وأقسام الموقع من جهازك مباشرة لـ Supabase
  async function handleImageUpload(file: File, bucketName: string): Promise<string> {
    const fileName = `safos-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { url, error } = await uploadFile(bucketName, file, fileName);
    if (error || !url) {
      throw new Error(error || 'فشل رفع الصورة');
    }
    return url;
  }

  // تحميل الصور مباشرة على جهاز المستخدم
  const handleDownloadImage = async (imageUrl: string, fileName: string) => {
    if (!imageUrl) return;
    try {
      showToast('جاري التحميل على جهازك...', 'success');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace(/\s+/g, '_')}_safos.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  // تفعيل وإرسال قوالب رسائل الواتساب الديناميكية (تأكيد الـ COD / طلب التقييم)
  const handleSendWhatsAppMessage = (order: any, type: 'confirm' | 'review') => {
    if (!order) return;
    const cleanPhone = order.customer_phone.replace(/\s+/g, '');
    
    let template = '';
    if (type === 'confirm') {
      template = lang === 'ar' ? settings.cod_confirm_ar : lang === 'fr' ? settings.cod_confirm_fr : settings.cod_confirm_en;
    } else {
      template = lang === 'ar' ? settings.review_request_ar : lang === 'fr' ? settings.review_request_fr : settings.review_request_en;
    }

    const firstProduct = order.items && order.items[0] ? (order.items[0].productName || order.items[0].product_name) : '';
    const reviewUrl = `https://safos.online/review/${order.items && order.items[0] ? order.items[0].id : ''}`;

    let message = template
      .replace(/{name}/g, order.customer_name)
      .replace(/{order_number}/g, order.order_number)
      .replace(/{total}/g, order.total)
      .replace(/{city}/g, order.customer_city)
      .replace(/{review_url}/g, reviewUrl);

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(`order-status-${orderId}`);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast('تم تحديث حالة الطلب بنجاح', 'success');
      await fetchStoreData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // التحكم بالمراجعات والتقييمات الفعلي للزبناء (التفعيل والحذف)
  const handleToggleReviewStatus = async (reviewId: string, currentStatus: boolean) => {
    setActionLoading(`review-${reviewId}`);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: !currentStatus } : r));
      showToast('تم تعديل مظهر التقييم فالموقع حياً', 'success');
      await fetchStoreData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('هل يريد حذف هذا التقييم نهائياً؟')) return;
    setActionLoading(`del-review-${reviewId}`);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete().eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast('تم حذف التقييم بنجاح', 'success');
      await fetchStoreData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save-category');
    try {
      const { error } = editingCategory
        ? await supabase.from('categories').update(newCategory).eq('id', editingCategory.id)
        : await supabase.from('categories').insert([newCategory]);
      
      if (error) throw error;
      showToast('تم حفظ المجموعة بنجاح', 'success');
      setIsAddingCategory(false);
      setEditingCategory(null);
      setNewCategory({ name_ar: '', name_fr: '', name_en: '' });
      await fetchStoreData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المجموعة؟ جميع المنتجات المربوطة بها ستصبح بدون تصنيف.')) return;
    setActionLoading(`del-cat-${catId}`);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', catId);
      if (error) throw error;
      showToast('تم حذف المجموعة بنجاح', 'success');
      await fetchStoreData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add-product');
    try {
      const payload = { ...newProduct };
      if (!payload.category) payload.category = null;

      const { error } = await supabase
        .from('products')
        .insert([payload]);
      if (error) throw error;
      showToast('تمت إضافة منتج الكانفاس الفاخر بنجاح', 'success');
      setIsAddingProduct(false);
      setNewProduct({
        name: '', name_en: '', name_fr: '', price: 0, old_price: null, stock: 5, image_url: '', category: '',
        color: '', tag: '', description: '', description_en: '', description_fr: '',
        materials_dimensions: '', materials_dimensions_en: '', materials_dimensions_fr: '',
        care_guide: '', care_guide_en: '', care_guide_fr: '', additional_images: [], video_url: '',
        show_video: true, show_gallery: true, show_care_guide: true, show_dimensions: true
      });
      await fetchStoreData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionLoading(`save-prod-${editingProduct.id}`);
    try {
      const payload = { ...editingProduct };
      if (!payload.category) payload.category = null as any;

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);
      if (error) throw error;
      showToast('تم حفظ تعديلات الحقيبة بنجاح', 'success');
      setEditingProduct(null);
      await fetchStoreData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('هل يريد حذف هذه حقيبة الكانفاس نهائياً من العرض؟')) return;
    setActionLoading(`del-prod-${productId}`);
    try {
      const { error } = await supabase
        .from('products')
        .delete().eq('id', productId);
      if (error) throw error;
      showToast('تم حذف المنتج بنجاح', 'success');
      await fetchStoreData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

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
          value: { primary: settings.primary_color, secondary: settings.secondary_color, title_color: settings.title_color, text_color: settings.text_color, card_bg: settings.card_bg, accordion_bg: settings.accordion_bg, image_bg: settings.image_bg, title_font: settings.title_font, body_font: settings.body_font, admin_bg_color: settings.admin_bg_color, admin_card_bg: settings.admin_card_bg, admin_text_color: settings.admin_text_color, admin_button_bg_color: settings.admin_button_bg_color, admin_button_text_color: settings.admin_button_text_color, button_bg_color: settings.button_bg_color, button_text_color: settings.button_text_color }
        },
        {
          key: 'contact',
          value: {
            phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email, address: settings.address,
            instagram: settings.instagram, facebook: settings.facebook, tiktok: settings.tiktok, currency: settings.currency, currency_symbol: settings.currency_symbol
          }
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
          value: {
            p1_title_ar: settings.p1_title_ar, p1_title_fr: settings.p1_title_fr, p1_title_en: settings.p1_title_en, p1_desc_ar: settings.p1_desc_ar, p1_desc_fr: settings.p1_desc_fr, p1_desc_en: settings.p1_desc_en,
            p2_title_ar: settings.p2_title_ar, p2_title_fr: settings.p2_title_fr, p2_title_en: settings.p2_title_en, p2_desc_ar: settings.p2_desc_ar, p2_desc_fr: settings.p2_desc_fr, p2_desc_en: settings.p2_desc_en,
            p3_title_ar: settings.p3_title_ar, p3_title_fr: settings.p3_title_fr, p3_title_en: settings.p3_title_en, p3_desc_ar: settings.p3_desc_ar, p3_desc_fr: settings.p3_desc_fr, p3_desc_en: settings.p3_desc_en
          }
        },
        {
          key: 'testimonials',
          value: {
            t1_name_ar: settings.t1_name_ar, t1_name_fr: settings.t1_name_fr, t1_name_en: settings.t1_name_en, t1_text_ar: settings.t1_text_ar, t1_text_fr: settings.t1_text_fr, t1_text_en: settings.t1_text_en, t1_rating: settings.t1_rating,
            t2_name_ar: settings.t2_name_ar, t2_name_fr: settings.t2_name_fr, t2_name_en: settings.t2_name_en, t2_text_ar: settings.t2_text_ar, t2_text_fr: settings.t2_text_fr, t2_text_en: settings.t2_text_en, t2_rating: settings.t2_rating
          }
        },
        {
          key: 'policies',
          value: { shipping_ar: settings.shipping_policy_ar, shipping_fr: settings.shipping_policy_fr, shipping_en: settings.shipping_policy_en, refund_ar: settings.refund_policy_ar, refund_fr: settings.refund_policy_fr, refund_en: settings.refund_policy_en, copyright: settings.copyright_text }
        },
        {
          key: 'templates',
          value: {
            cod_confirm_ar: settings.cod_confirm_ar, cod_confirm_fr: settings.cod_confirm_fr, cod_confirm_en: settings.cod_confirm_en,
            review_request_ar: settings.review_request_ar, review_request_fr: settings.review_request_fr, review_request_en: settings.review_request_en
          }
        },
        // مزامنة قائمة التنقل
        {
          key: 'menu_links',
          value: {
            menu_p1_ar: settings.menu_p1_ar, menu_p1_fr: settings.menu_p1_fr, menu_p1_en: settings.menu_p1_en, menu_p1_visible: settings.menu_p1_visible,
            menu_p2_ar: settings.menu_p2_ar, menu_p2_fr: settings.menu_p2_fr, menu_p2_en: settings.menu_p2_en, menu_p2_visible: settings.menu_p2_visible,
            menu_p3_ar: settings.menu_p3_ar, menu_p3_fr: settings.menu_p3_fr, menu_p3_en: settings.menu_p3_en, menu_p3_visible: settings.menu_p3_visible,
            menu_p4_ar: settings.menu_p4_ar, menu_p4_fr: settings.menu_p4_fr, menu_p4_en: settings.menu_p4_en, menu_p4_visible: settings.menu_p4_visible,
            menu_p5_ar: settings.menu_p5_ar, menu_p5_fr: settings.menu_p5_fr, menu_p5_en: settings.menu_p5_en, menu_p5_visible: settings.menu_p5_visible
          }
        },
        // مزامنة حقول الشراء للزبون
        {
          key: 'checkout_fields',
          value: {
            field_name_ar: settings.field_name_ar, field_name_fr: settings.field_name_fr, field_name_en: settings.field_name_en, field_name_required: settings.field_name_required, field_name_visible: settings.field_name_visible,
            field_phone_ar: settings.field_phone_ar, field_phone_fr: settings.field_phone_fr, field_phone_en: settings.field_phone_en, field_phone_required: settings.field_phone_required, field_phone_visible: settings.field_phone_visible,
            field_city_ar: settings.field_city_ar, field_city_fr: settings.field_city_fr, field_city_en: settings.field_city_en, field_city_required: settings.field_city_required, field_city_visible: settings.field_city_visible,
            field_address_ar: settings.field_address_ar, field_address_fr: settings.field_address_fr, field_address_en: settings.field_address_en, field_address_required: settings.field_address_required, field_address_visible: settings.field_address_visible,
            field_notes_ar: settings.field_notes_ar, field_notes_fr: settings.field_notes_fr, field_notes_en: settings.field_notes_en, field_notes_required: settings.field_notes_required, field_notes_visible: settings.field_notes_visible
          }
        },
        // مزامنة الإخفاء والإظهار حياً
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

      for (const item of updates) {
        const { error } = await supabase.from('store_settings').upsert({
          key: item.key,
          value: item.value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        if (error) throw error;
      }

      showToast('تمت مزامنة وحفظ جميع التخصيصات حياً', 'success');
      await fetchStoreData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.payment_status === 'paid')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock < 3);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number?.toLowerCase() || '').includes(orderSearch.toLowerCase()) ||
      (order.customer_name?.toLowerCase() || '').includes(orderSearch.toLowerCase()) ||
      (order.customer_phone || '').includes(orderSearch);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const pendingPercent = Math.round((orders.filter(o => o.status === 'pending').length / totalOrdersCount) * 100);
  const confirmedPercent = Math.round((orders.filter(o => o.status === 'confirmed').length / totalOrdersCount) * 100);
  const shippedPercent = Math.round((orders.filter(o => o.status === 'shipped').length / totalOrdersCount) * 100);
  const deliveredPercent = Math.round((orders.filter(o => o.status === 'delivered').length / totalOrdersCount) * 100);
  const cancelledPercent = Math.round((orders.filter(o => o.status === 'cancelled').length / totalOrdersCount) * 100);

  return (
    <div 
      style={{
        '--admin-bg-theme': settings.admin_bg_color || '#FFFFFF',
        '--admin-text-theme': settings.admin_text_color || '#18181B',
        '--admin-card-theme': settings.admin_card_bg || '#F4F4F5',
        '--admin-btn-theme': settings.admin_button_bg_color || '#18181B',
        '--admin-btn-text': settings.admin_button_text_color || '#FFFFFF',
        '--secondary-theme': settings.secondary_color || '#D4AF37'
      } as React.CSSProperties}
      className="min-h-screen flex font-sans antialiased selection:bg-amber-500/30 print:bg-white print:text-black animate-fadeIn"
      style={{ backgroundColor: 'var(--admin-bg-theme)', color: 'var(--admin-text-theme)' }}
    >
      
      {/* القائمة الجانبية الفاخرة للوحة التحكم بتصميم أبيض مجهز */}
      <aside className="print:hidden fixed inset-y-0 right-0 z-30 w-64 bg-white border-l border-zinc-200 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:translate-x-0">
        <div>
          <div className="p-8 border-b border-zinc-100 text-center">
            <h1 className="text-2xl font-bold tracking-[0.3em]" style={{ color: 'var(--secondary-theme)' }}>
              {lang === 'ar' ? settings.site_name_ar : lang === 'fr' ? settings.site_name_fr : settings.site_name_en}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">
              {lang === 'ar' ? settings.site_subtitle_ar : lang === 'fr' ? settings.site_subtitle_fr : settings.site_subtitle_en}
            </p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'الإحصائيات العامة والتحليل', icon: LayoutDashboard },
              { id: 'orders', label: 'إدارة الطلبيات والمبيعات', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
              { id: 'products', label: 'مخزون وحقائب الكانفاس', icon: TrendingUp, badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined },
              { id: 'categories', label: 'مجموعات وتصنيفات السلع', icon: Menu },
              { id: 'reviews', label: 'تقييمات وآراء العميلات', icon: Star },
              { id: 'settings', label: 'تخصيص الموقع والرسائل', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 text-xs font-light"
                  style={{
                    backgroundColor: isActive ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                    color: isActive ? 'var(--secondary-theme)' : '#71717a',
                    borderRight: isActive ? `3px solid var(--secondary-theme)` : 'none'
                  }}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon size={16} style={{ color: isActive ? 'var(--secondary-theme)' : '#71717a' }} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-100 text-zinc-500">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-100 space-y-3">
          <div className="flex items-center justify-center space-x-2 space-x-reverse bg-zinc-50 p-2 rounded-xl border border-zinc-100">
            <button onClick={() => handleLangChange('ar')} className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all ${lang === 'ar' ? 'text-black font-bold' : 'text-zinc-400'}`} style={{ backgroundColor: lang === 'ar' ? 'var(--secondary-theme)' : 'transparent' }}>AR</button>
            <button onClick={() => handleLangChange('fr')} className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all ${lang === 'fr' ? 'text-black font-bold' : 'text-zinc-400'}`} style={{ backgroundColor: lang === 'fr' ? 'var(--secondary-theme)' : 'transparent' }}>FR</button>
            <button onClick={() => handleLangChange('en')} className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all ${lang === 'en' ? 'text-black font-bold' : 'text-zinc-400'}`} style={{ backgroundColor: lang === 'en' ? 'var(--secondary-theme)' : 'transparent' }}>EN</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي للوحة */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto print:p-0">
        <div className="print:hidden flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-2xl font-light">
              {activeTab === 'dashboard' && 'الإحصائيات العامة والتحليل'}
              {activeTab === 'orders' && 'سجل المبيعات والطلبات'}
              {activeTab === 'products' && 'إدارة المنتجات وتعديل الخصائص'}
              {activeTab === 'categories' && 'إدارة مجموعات وتصنيفات السلع'}
              {activeTab === 'reviews' && 'إدارة وتقييمات العميلات الحقيقية'}
              {activeTab === 'settings' && 'تخصيص كامل لأقسام المتجر والرسائل'}
            </h2>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-white border border-zinc-100 hover:text-amber-500 rounded-xl transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: loading ? 'var(--secondary-theme)' : '#71717a' }} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-100 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* 1. الإحصائيات العامة */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 print:hidden animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: 'var(--admin-card-theme)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="text-xs text-zinc-400">إجمالي الأرباح المدفوعة</span>
                    <div className="mt-4 text-3xl font-light">{totalRevenue.toLocaleString()} <span style={{ color: 'var(--secondary-theme)' }}>درهم</span></div>
                  </div>
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: 'var(--admin-card-theme)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="text-xs text-zinc-400">الطلبات المعلقة</span>
                    <div className="mt-4 text-3xl font-light" style={{ color: 'var(--secondary-theme)' }}>{pendingOrdersCount}</div>
                  </div>
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: 'var(--admin-card-theme)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="text-xs text-red-500">نقص المخزون (&lt;3)</span>
                    <div className="mt-4 text-3xl font-light text-red-500">{lowStockProducts.length}</div>
                  </div>
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: 'var(--admin-card-theme)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="text-xs text-zinc-400">مجموع التشكيلة</span>
                    <div className="mt-4 text-3xl font-light">{products.length}</div>
                  </div>
                </div>

                {/* الرسوم البيانية التفاعلية لحالات الطلب */}
                <div className="border p-8 rounded-3xl" style={{ backgroundColor: 'var(--admin-card-theme)', borderColor: 'rgba(0,0,0,0.05)' }}>
                  <h3 className="text-lg font-light">تحليل وتوزيع حالات طلبيات الكانفاس</h3>
                  <p className="text-xs text-zinc-400 mt-1">نسب حية لتتبع تقدم التوصيل وشحن الحقائب من ورشة SAFOS</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-10">
                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="var(--secondary-theme)" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * pendingPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{pendingPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500">قيد الانتظار ({orders.filter(o => o.status === 'pending').length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#8b5cf6" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * confirmedPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{confirmedPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500">مؤكدة ({orders.filter(o => o.status === 'confirmed').length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * shippedPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{shippedPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500">مشحونة ({orders.filter(o => o.status === 'shipped').length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * deliveredPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{deliveredPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500">تم التوصيل ({orders.filter(o => o.status === 'delivered').length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#ef4444" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * cancelledPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{cancelledPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500">ملغاة ({orders.filter(o => o.status === 'cancelled').length})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. سجل المبيعات والطلب */}
            {activeTab === 'orders' && (
              <div className="space-y-6 print:hidden">
                <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                  <input
                    type="text"
                    placeholder="البحث بالاسم، الهاتف، أو رقم الطلب..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full md:w-96 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none"
                  />
                  <div className="flex gap-3">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-zinc-200 text-zinc-600 py-2 px-3 rounded-xl text-xs">
                      <option value="all">كل حالات الشحن</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfbf9] text-zinc-400 text-[10px] uppercase border-b border-zinc-100">
                      <tr>
                        <th className="py-4 px-6">رقم الطلب</th>
                        <th className="py-4 px-6">العميل</th>
                        <th className="py-4 px-6 text-left">قيمة الطلب</th>
                        <th className="py-4 px-6 text-center">حالة الشحن</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50/50">
                          <td className="py-4 px-6 font-mono text-xs font-semibold" style={{ color: 'var(--secondary-theme)' }}>{order.order_number}</td>
                          <td className="py-4 px-6 font-medium text-zinc-800">{order.customer_name}</td>
                          <td className="py-4 px-6 text-left">{order.total} درهم</td>
                          <td className="py-4 px-6 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs py-1 px-2.5 rounded bg-white border border-zinc-200"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">مؤكد</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التوصيل</option>
                              <option value="cancelled">ملغى</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-center flex items-center justify-center space-x-2 space-x-reverse">
                            <button onClick={() => setSelectedOrder(order)} className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200"><Eye size={14}/></button>
                            <button onClick={() => handleSendWhatsAppMessage(order, 'confirm')} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="إرسال رسالة تأكيد COD مخصصة"><Send size={14}/></button>
                            {order.status === 'delivered' && (
                              <button onClick={() => handleSendWhatsAppMessage(order, 'review')} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200" title="إرسال رابط التقييم للزبونة"><Star size={14}/></button>
                            )}
                            <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. إدارة السلع وحقائب الكانفاس */}
            {activeTab === 'products' && (
              <div className="space-y-6 print:hidden animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-light">حقائب الكانفاس</h3>
                  <button onClick={() => setIsAddingProduct(true)} className="text-[#faf6ef] text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 space-x-reverse" style={{ backgroundColor: 'var(--admin-btn-theme)', color: 'var(--admin-btn-text)' }}>
                    <Plus size={16} />
                    <span>إضافة حقيبة كانفاس جديدة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-300 transition-all bg-white" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <div>
                        <div className="w-full h-48 bg-zinc-50 rounded-xl overflow-hidden mb-4 relative" style={{ backgroundColor: settings.colors?.image_bg || '#f4f4f5' }}>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-light">لا توجد صورة</div>
                          )}
                          {product.image_url && (
                            <button
                              onClick={() => handleDownloadImage(product.image_url, product.name)}
                              className="absolute bottom-3 right-3 bg-white/80 hover:bg-zinc-100 text-zinc-700 p-2.5 rounded-full shadow-md"
                              title="تحميل الصورة على جهازك"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                        <h4 className="text-base font-light">{product.name}</h4>
                        <p className="text-xs font-mono mt-1" style={{ color: 'var(--secondary-theme)' }}>{product.price} درهم</p>
                      </div>

                      <div className="border-t border-zinc-100 pt-4 mt-4 flex gap-2">
                        <button onClick={() => setEditingProduct(product)} className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 space-x-reverse">
                          <Edit3 size={14} />
                          <span>تعديل التفاصيل والخصائص</span>
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* إدارة المجموعات والتصنيفات الديناميكية بالكامل */}
            {activeTab === 'categories' && (
              <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-light">مجموعات وتصنيفات السلع</h3>
                  <button onClick={() => setIsAddingCategory(true)} className="text-[#faf6ef] text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 space-x-reverse" style={{ backgroundColor: 'var(--admin-btn-theme)', color: 'var(--admin-btn-text)' }}>
                    <Plus size={16} />
                    <span>إضافة مجموعة جديدة</span>
                  </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfbf9] text-zinc-400 text-[10px] uppercase border-b border-zinc-100">
                      <tr>
                        <th className="py-4 px-6">المجموعة بالعربية</th>
                        <th className="py-4 px-6">المجموعة بالفرنسية</th>
                        <th className="py-4 px-6">المجموعة بالإنجليزية</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-zinc-50/50">
                          <td className="py-4 px-6 font-medium text-zinc-800">{cat.name_ar}</td>
                          <td className="py-4 px-6 text-zinc-400">{cat.name_fr}</td>
                          <td className="py-4 px-6 text-zinc-400">{cat.name_en}</td>
                          <td className="py-4 px-6 text-center flex items-center justify-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setNewCategory({ name_ar: cat.name_ar, name_fr: cat.name_fr, name_en: cat.name_en });
                                setIsAddingCategory(true);
                              }}
                              className="p-1.5 bg-zinc-100 text-zinc-600 rounded hover:bg-zinc-200"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* إدارة مراجعات وتقييمات العميلات */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 print:hidden">
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfbf9] text-zinc-400 text-[10px] uppercase border-b border-zinc-100">
                      <tr>
                        <th className="py-4 px-6">اسم العميلة</th>
                        <th className="py-4 px-6">التقييم</th>
                        <th className="py-4 px-6">التعليق والملاحظة</th>
                        <th className="py-4 px-6 text-center">حالة الإظهار فالموقع</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {reviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-zinc-50/50">
                          <td className="py-4 px-6 font-medium text-zinc-800">{rev.customer_name}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-amber-500">
                              {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-zinc-400">{rev.comment}</td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleToggleReviewStatus(rev.id, rev.is_approved)}
                              className={`text-[10px] py-1 px-3 rounded-full border transition-all ${
                                rev.is_approved 
                                  ? 'bg-emerald-100 text-emerald-600 border-emerald-200' 
                                  : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                              }`}
                            >
                              {rev.is_approved ? 'نشط وظاهر' : 'مخفي ومعلق'}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => handleDeleteReview(rev.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. تخصيص كامل لأقسام المتجر والرسائل باللغات الثلاث */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-3 mb-4">أقسام واجهة المتجر</h3>
                  {settingsSections.map((sec) => {
                    const Icon = sec.icon;
                    const isSecActive = activeSettingsSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSettingsSection(sec.id)}
                        className="w-full flex items-center space-x-3 space-x-reverse p-3.5 rounded-xl text-xs transition-all font-light"
                        style={{
                          backgroundColor: isSecActive ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                          color: isSecActive ? 'var(--secondary-theme)' : '#71717a'
                        }}
                      >
                        <Icon size={16} />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    
                    {activeSettingsSection === 'identity' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-medium">هوية المتجر الفاخرة والشعار</h4>
                          <p className="text-xs text-zinc-400 mt-1">تعديل الاسم والوصوف الرئيسية للماركة والألوان</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الاسم بالعربية</label>
                            <input type="text" value={settings.site_name_ar || ''} onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الاسم بالفرنسية</label>
                            <input type="text" value={settings.site_name_fr || ''} onChange={(e) => setSettings({ ...settings, site_name_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الاسم بالإنجليزية</label>
                            <input type="text" value={settings.site_name_en || ''} onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الفرعي بالعربية</label>
                            <input type="text" value={settings.site_subtitle_ar || ''} onChange={(e) => setSettings({ ...settings, site_subtitle_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الفرعي بالفرنسية</label>
                            <input type="text" value={settings.site_subtitle_fr || ''} onChange={(e) => setSettings({ ...settings, site_subtitle_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الفرعي بالإنجليزية</label>
                            <input type="text" value={settings.site_subtitle_en || ''} onChange={(e) => setSettings({ ...settings, site_subtitle_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الحرف الرمزي للشعار</label>
                            <input type="text" maxLength={1} value={settings.logo_letter} onChange={(e) => setSettings({ ...settings, logo_letter: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm text-center font-bold" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">شعار المتجر (الشعار الحالي: {settings.logo_url ? 'مرفوع' : 'لا يوجد'})</label>
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <label className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 text-zinc-700 py-2.5 px-4 rounded-xl text-xs border border-zinc-200 transition-all flex items-center space-x-2 space-x-reverse">
                                <Upload size={14} />
                                <span>رفع شعار من جهازك</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const url = await handleImageUpload(file, BUCKETS.LOGOS);
                                        setSettings({ ...settings, logo_url: url });
                                        showToast('تم رفع الشعار بنجاح، احفظ التغييرات لحفظها نهائياً', 'success');
                                      } catch (err: any) {
                                        showToast(err.message, 'error');
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🟢 قسم الألوان والخطوط الفاخرة وخلفيات الكروت المحدث بالكامل للداشبورد والموقع */}
                    {activeSettingsSection === 'style' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-medium">الألوان والخطوط وخلفيات النصوص والصور</h4>
                          <p className="text-xs text-zinc-400 mt-1">تعديل كامل لألوان المتجر والداشبورد والخلفيات حياً</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">اللون الأساسي للموقع (Primary)</label>
                            <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">اللون الثانوي / الذهبي للموقع (Secondary)</label>
                            <input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون العناوين الكبرى والشعار (Title Color)</label>
                            <input type="color" value={settings.title_color} onChange={(e) => setSettings({ ...settings, title_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون النصوص والوصوف والفقرات (Text Color)</label>
                            <input type="color" value={settings.text_color} onChange={(e) => setSettings({ ...settings, text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        {/* مغير ألوان لوحة التحكم (الداشبورد) وأزرارها تفاعلياً */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية لوحة التحكم (Dashboard BG)</label>
                            <input type="color" value={settings.admin_bg_color} onChange={(e) => setSettings({ ...settings, admin_bg_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون بطاقات لوحة التحكم (Dashboard Card BG)</label>
                            <input type="color" value={settings.admin_card_bg} onChange={(e) => setSettings({ ...settings, admin_card_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون نصوص لوحة التحكم (Dashboard Text Color)</label>
                            <input type="color" value={settings.admin_text_color} onChange={(e) => setSettings({ ...settings, admin_text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون خلفية أزرار الداشبورد (Dashboard Button BG)</label>
                            <input type="color" value={settings.admin_button_bg_color} onChange={(e) => setSettings({ ...settings, admin_button_bg_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون نصوص أزرار الداشبورد (Dashboard Button Text)</label>
                            <input type="color" value={settings.admin_button_text_color} onChange={(e) => setSettings({ ...settings, admin_button_text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية كروت الحقائب والآراء (Card BG)</label>
                            <input type="color" value={settings.card_bg} onChange={(e) => setSettings({ ...settings, card_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية الأكورديون المطوي (Accordion BG)</label>
                            <input type="color" value={settings.accordion_bg} onChange={(e) => setSettings({ ...settings, accordion_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية إطارات صور الحقائب (Image Frame BG)</label>
                            <input type="color" value={settings.image_bg} onChange={(e) => setSettings({ ...settings, image_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">خط العناوين الكبرى (Heading Font)</label>
                            <select value={settings.title_font} onChange={(e) => setSettings({ ...settings, title_font: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 focus:outline-none">
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Cinzel">Cinzel</option>
                              <option value="Cairo">Cairo (عربي فاخر)</option>
                              <option value="Cormorant Garamond">Cormorant Garamond</option>
                              <option value="Tajawal">Tajawal</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">خط النصوص والوصوف العادية (Body Font)</label>
                            <select value={settings.body_font} onChange={(e) => setSettings({ ...settings, body_font: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 focus:outline-none">
                              <option value="Montserrat">Montserrat</option>
                              <option value="Lato">Lato</option>
                              <option value="Inter">Inter</option>
                              <option value="Tajawal">Tajawal (عربي ناعم)</option>
                              <option value="Roboto">Roboto</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🟢 قسم إدارة المينيو وقائمة التنقل التفاعلية باللغات الثلاث */}
                    {activeSettingsSection === 'menu' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">إدارة قائمة التنقل (Menu Manager)</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل وتخصيص أسماء الروابط الخمسة بالكامل باللغات الثلاث مع تفعيلها وإخفائها</p>
                        </div>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num} className="border-b border-zinc-100 pb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-500 font-semibold">رابط التنقل {num}</span>
                              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                <input type="checkbox" checked={settings[`menu_p${num}_visible`]} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_visible`]: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                                <span>إظهار في القائمة</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="الاسم بالعربية" value={settings[`menu_p${num}_ar`] || ''} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_ar`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالفرنسية" value={settings[`menu_p${num}_fr`] || ''} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_fr`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالإنجليزية" value={settings[`menu_p${num}_en`] || ''} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_en`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 🟢 قسم إدارة حقول الشراء للزبون (Checkout Fields) تفاعلياً كأزرار إخفاء وإظهار */}
                    {activeSettingsSection === 'checkout' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">إدارة حقول الشراء (Checkout Manager)</h4>
                          <p className="text-xs text-zinc-500 mt-1">التحكم في حقول استمارة معلومات الشحن وتعديل أسمائها لبراند SAFOS</p>
                        </div>
                        {['name', 'phone', 'city', 'address', 'notes'].map((field) => (
                          <div key={field} className="border-b border-zinc-100 pb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-500 uppercase">حقل: {field === 'name' ? 'الاسم' : field === 'phone' ? 'الهاتف' : field === 'city' ? 'المدينة' : field === 'address' ? 'العنوان' : 'ملاحظات'}</span>
                              <div className="flex space-x-3 space-x-reverse">
                                <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                  <input type="checkbox" checked={settings[`field_${field}_visible`]} onChange={(e) => setSettings({ ...settings, [`field_${field}_visible`]: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                                  <span>ظاهر فالموقع</span>
                                </label>
                                <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                  <input type="checkbox" checked={settings[`field_${field}_required`]} onChange={(e) => setSettings({ ...settings, [`field_${field}_required`]: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                                  <span>حقل إجباري</span>
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="الاسم بالعربية" value={settings[`field_${field}_ar`] || ''} onChange={(e) => setSettings({ ...settings, [`field_${field}_ar`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالفرنسية" value={settings[`field_${field}_fr`] || ''} onChange={(e) => setSettings({ ...settings, [`field_${field}_fr`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالإنجليزية" value={settings[`field_${field}_en`] || ''} onChange={(e) => setSettings({ ...settings, [`field_${field}_en`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSettingsSection === 'hero' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">الشاشة الترحيبية (Hero Banner)</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل البانر الترويجي لمتجر SAFOS والرفع من جهازك باللغات الثلاث</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الرئيسي بالعربية</label>
                            <textarea value={settings.hero_title_ar || ''} onChange={(e) => setSettings({ ...settings, hero_title_ar: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الرئيسي بالفرنسية</label>
                            <textarea value={settings.hero_title_fr || ''} onChange={(e) => setSettings({ ...settings, hero_title_fr: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الرئيسي بالإنجليزية</label>
                            <textarea value={settings.hero_title_en || ''} onChange={(e) => setSettings({ ...settings, hero_title_en: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الفرعي بالعربية</label>
                            <input type="text" value={settings.hero_subtitle_ar || ''} onChange={(e) => setSettings({ ...settings, hero_subtitle_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الفرعي بالفرنسية</label>
                            <input type="text" value={settings.hero_subtitle_fr || ''} onChange={(e) => setSettings({ ...settings, hero_subtitle_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">العنوان الفرعي بالإنجليزية</label>
                            <input type="text" value={settings.hero_subtitle_en || ''} onChange={(e) => setSettings({ ...settings, hero_subtitle_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">شريط الإعلانات بالعربية</label>
                            <input type="text" value={settings.announcement_text_ar || ''} onChange={(e) => setSettings({ ...settings, announcement_text_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm text-amber-500" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">شريط الإعلانات بالفرنسية</label>
                            <input type="text" value={settings.announcement_text_fr || ''} onChange={(e) => setSettings({ ...settings, announcement_text_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm text-amber-500" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">شريط الإعلانات بالإنجليزية</label>
                            <input type="text" value={settings.announcement_text_en || ''} onChange={(e) => setSettings({ ...settings, announcement_text_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm text-amber-500" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الوصف التفصيلي بالعربية</label>
                            <textarea value={settings.hero_description_ar || ''} onChange={(e) => setSettings({ ...settings, hero_description_ar: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الوصف التفصيلي بالفرنسية</label>
                            <textarea value={settings.hero_description_fr || ''} onChange={(e) => setSettings({ ...settings, hero_description_fr: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">الوصف التفصيلي بالإنجليزية</label>
                            <textarea value={settings.hero_description_en || ''} onChange={(e) => setSettings({ ...settings, hero_description_en: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-550 block mb-1.5 font-medium">صورة البانر الرئيسي</label>
                          <label className="cursor-pointer w-full bg-white hover:bg-zinc-100 text-zinc-700 p-3 rounded-xl text-xs border border-zinc-200 flex items-center justify-center space-x-2 space-x-reverse">
                            <Upload size={14} />
                            <span>رفع صورة البانر من جهازك</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await handleImageUpload(file, BUCKETS.PRODUCT_IMAGES);
                                    setSettings({ ...settings, hero_image_url: url });
                                    showToast('تم رفع صورة البانر بنجاح', 'success');
                                  } catch (err: any) {
                                    showToast(err.message, 'error');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'about' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">قصة الماركة (Brand Story)</h4>
                          <p className="text-xs text-zinc-500 mt-1">قصة الحرفة اليدوية لكتان الكانفاس بورشة SAFOS</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">عنوان قصة ورشتنا بالعربية</label>
                            <input type="text" value={settings.about_title_ar || ''} onChange={(e) => setSettings({ ...settings, about_title_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">عنوان قصة ورشتنا بالفرنسية</label>
                            <input type="text" value={settings.about_title_fr || ''} onChange={(e) => setSettings({ ...settings, about_title_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">عنوان قصة ورشتنا بالإنجليزية</label>
                            <input type="text" value={settings.about_title_en || ''} onChange={(e) => setSettings({ ...settings, about_title_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">قصة ورشتنا الفنية بالتفصيل بالعربية</label>
                            <textarea value={settings.about_text_ar || ''} onChange={(e) => setSettings({ ...settings, about_text_ar: e.target.value })} className="w-full h-32 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">قصة ورشتنا الفنية بالتفصيل بالفرنسية</label>
                            <textarea value={settings.about_text_fr || ''} onChange={(e) => setSettings({ ...settings, about_text_fr: e.target.value })} className="w-full h-32 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm text-[#1a1410]" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">قصة ورشتنا الفنية بالتفصيل بالإنجليزية</label>
                            <textarea value={settings.about_text_en || ''} onChange={(e) => setSettings({ ...settings, about_text_en: e.target.value })} className="w-full h-32 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm text-[#1a1410]" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1.5 font-medium">صورة ورشة التطريز اليدوي</label>
                          <label className="cursor-pointer w-full bg-white hover:bg-zinc-100 text-zinc-700 p-3 rounded-xl text-xs border border-zinc-200 flex items-center justify-center space-x-2 space-x-reverse">
                            <Upload size={14} />
                            <span>رفع صورة الورشة من جهازك</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await handleImageUpload(file, BUCKETS.PRODUCT_IMAGES);
                                    setSettings({ ...settings, about_image: url });
                                    showToast('تم رفع صورة قصة الماركة بنجاح', 'success');
                                  } catch (err: any) {
                                    showToast(err.message, 'error');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'pillars' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">ركائز ومميزات الفخامة الثلاث</h4>
                          <p className="text-xs text-zinc-500 mt-1">تخصيص العناوين والوصف للمميزات الثلاثة لـ الكانفاس المتقن</p>
                        </div>
                        {/* الركائز بـ 3 لغات */}
                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-amber-500 font-semibold">المميز الأول (Pillar 1)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="العنوان بالعربية" value={settings.p1_title_ar || ''} onChange={(e) => setSettings({ ...settings, p1_title_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="العنوان بالفرنسية" value={settings.p1_title_fr || ''} onChange={(e) => setSettings({ ...settings, p1_title_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="العنوان بالإنجليزية" value={settings.p1_title_en || ''} onChange={(e) => setSettings({ ...settings, p1_title_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="الوصف بالعربية" value={settings.p1_desc_ar || ''} onChange={(e) => setSettings({ ...settings, p1_desc_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الوصف بالفرنسية" value={settings.p1_desc_fr || ''} onChange={(e) => setSettings({ ...settings, p1_desc_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الوصف بالإنجليزية" value={settings.p1_desc_en || ''} onChange={(e) => setSettings({ ...settings, p1_desc_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>

                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-amber-500 font-semibold">المميز الثاني (Pillar 2)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="العنوان بالعربية" value={settings.p2_title_ar || ''} onChange={(e) => setSettings({ ...settings, p2_title_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="العنوان بالفرنسية" value={settings.p2_title_fr || ''} onChange={(e) => setSettings({ ...settings, p2_title_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="العنوان بالإنجليزية" value={settings.p2_title_en || ''} onChange={(e) => setSettings({ ...settings, p2_title_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="الوصف بالعربية" value={settings.p2_desc_ar || ''} onChange={(e) => setSettings({ ...settings, p2_desc_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الوصف بالفرنسية" value={settings.p2_desc_fr || ''} onChange={(e) => setSettings({ ...settings, p2_desc_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الوصف بالإنجليزية" value={settings.p2_desc_en || ''} onChange={(e) => setSettings({ ...settings, p2_desc_en: e.target.value })} className="w-full bg-black border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>

                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-amber-500 font-semibold">المميز الثالث (Pillar 3)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="العنوان بالعربية" value={settings.p3_title_ar || ''} onChange={(e) => setSettings({ ...settings, p3_title_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="العنوان بالفرنسية" value={settings.p3_title_fr || ''} onChange={(e) => setSettings({ ...settings, p3_title_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="العنوان بالإنجليزية" value={settings.p3_title_en || ''} onChange={(e) => setSettings({ ...settings, p3_title_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="الوصف بالعربية" value={settings.p3_desc_ar || ''} onChange={(e) => setSettings({ ...settings, p3_desc_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الوصف بالفرنسية" value={settings.p3_desc_fr || ''} onChange={(e) => setSettings({ ...settings, p3_desc_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الوصف بالإنجليزية" value={settings.p3_desc_en || ''} onChange={(e) => setSettings({ ...settings, p3_desc_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'testimonials' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">آراء وتقييمات العميلات الحقيقية</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل مراجعات عينات الزبناء الوفيات للمتجر باللغات الثلاث</p>
                        </div>
                        
                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-amber-500 font-semibold">المراجعة الأولى (Testimonial 1)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="الاسم بالعربية" value={settings.t1_name_ar || ''} onChange={(e) => setSettings({ ...settings, t1_name_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الاسم بالفرنسية" value={settings.t1_name_fr || ''} onChange={(e) => setSettings({ ...settings, t1_name_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الاسم بالإنجليزية" value={settings.t1_name_en || ''} onChange={(e) => setSettings({ ...settings, t1_name_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <textarea placeholder="المراجعة بالعربية" value={settings.t1_text_ar || ''} onChange={(e) => setSettings({ ...settings, t1_text_ar: e.target.value })} className="w-full h-16 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <textarea placeholder="المراجعة بالفرنسية" value={settings.t1_text_fr || ''} onChange={(e) => setSettings({ ...settings, t1_text_fr: e.target.value })} className="w-full h-16 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <textarea placeholder="المراجعة بالإنجليزية" value={settings.t1_text_en || ''} onChange={(e) => setSettings({ ...settings, t1_text_en: e.target.value })} className="w-full h-16 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>

                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-amber-500 font-semibold">المراجعة الثانية (Testimonial 2)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="الاسم بالعربية" value={settings.t2_name_ar || ''} onChange={(e) => setSettings({ ...settings, t2_name_ar: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الاسم بالفرنسية" value={settings.t2_name_fr || ''} onChange={(e) => setSettings({ ...settings, t2_name_fr: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <input type="text" placeholder="الاسم بالإنجليزية" value={settings.t2_name_en || ''} onChange={(e) => setSettings({ ...settings, t2_name_en: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <textarea placeholder="المراجعة بالعربية" value={settings.t2_text_ar || ''} onChange={(e) => setSettings({ ...settings, t2_text_ar: e.target.value })} className="w-full h-16 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <textarea placeholder="المراجعة بالفرنسية" value={settings.t2_text_fr || ''} onChange={(e) => setSettings({ ...settings, t2_text_fr: e.target.value })} className="w-full h-16 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            <textarea placeholder="المراجعة بالإنجليزية" value={settings.t2_text_en || ''} onChange={(e) => setSettings({ ...settings, t2_text_en: e.target.value })} className="w-full h-16 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm animate-fadeIn" />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'policies' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">السياسات وتذييل الصفحة</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل سياسات الشحن وسياسة الاسترجاع وحقوق الملكية للمتجر باللغات الثلاث</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-550 block mb-1.5 font-medium">سياسة الشحن بالعربية</label>
                            <textarea value={settings.shipping_policy_ar || ''} onChange={(e) => setSettings({ ...settings, shipping_policy_ar: e.target.value })} className="w-full h-24 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-550 block mb-1.5 font-medium">سياسة الشحن بالفرنسية</label>
                            <textarea value={settings.shipping_policy_fr || ''} onChange={(e) => setSettings({ ...settings, shipping_policy_fr: e.target.value })} className="w-full h-24 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-550 block mb-1.5 font-medium">سياسة الشحن بالإنجليزية</label>
                            <textarea value={settings.shipping_policy_en || ''} onChange={(e) => setSettings({ ...settings, shipping_policy_en: e.target.value })} className="w-full h-24 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-550 block mb-1.5 font-medium">سياسة الاسترجاع بالعربية</label>
                            <textarea value={settings.refund_policy_ar || ''} onChange={(e) => setSettings({ ...settings, refund_policy_ar: e.target.value })} className="w-full h-24 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-550 block mb-1.5 font-medium">سياسة الاسترجاع بالفرنسية</label>
                            <textarea value={settings.refund_policy_fr || ''} onChange={(e) => setSettings({ ...settings, refund_policy_fr: e.target.value })} className="w-full h-24 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm animate-fadeIn" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-550 block mb-1.5 font-medium">سياسة الاسترجاع بالإنجليزية</label>
                            <textarea value={settings.refund_policy_en || ''} onChange={(e) => setSettings({ ...settings, refund_policy_en: e.target.value })} className="w-full h-24 bg-[#faf6ef] border border-[#b8935a]/25 p-3 rounded-xl text-sm animate-fadeIn" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-550 block mb-1.5 font-medium">حقوق الملكية وتذييل الصفحة (Copyright)</label>
                          <input type="text" value={settings.copyright_text} onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })} className="w-full bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm" />
                        </div>

                        {/* أزرار التفعيل والإخفاء الحية للأقسام الكبرى فالمتجر */}
                        <div className="border-t border-zinc-200 pt-5 space-y-4">
                          <h4 className="text-xs text-amber-500 font-semibold mb-2">التحكم في إظهار وإخفاء الأقسام الكبرى فالمتجر</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                              <input type="checkbox" checked={settings.show_announcement_bar} onChange={(e) => setSettings({ ...settings, show_announcement_bar: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                              <span>شريط الإعلانات الفوقاني</span>
                            </label>
                            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                              <input type="checkbox" checked={settings.show_about_section} onChange={(e) => setSettings({ ...settings, show_about_section: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                              <span>قسم قصة ورشتنا (من نحن)</span>
                            </label>
                            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                              <input type="checkbox" checked={settings.show_pillars_section} onChange={(e) => setSettings({ ...settings, show_pillars_section: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                              <span>قسم ركائز الفخامة</span>
                            </label>
                            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                              <input type="checkbox" checked={settings.show_testimonials_section} onChange={(e) => setSettings({ ...settings, show_testimonials_section: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                              <span>قسم تقييمات العميلات</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'contact' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">بيانات وقنوات التواصل الاجتماعي</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل الهاتف، روابط واتساب، إنستغرام، فيسبوك وتيك توك</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">رقم الهاتف الفعلي للتواصل</label>
                            <input type="text" value={settings.phone || ''} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">رقم الواتساب للتواصل المباشر</label>
                            <input type="text" value={settings.whatsapp || ''} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" placeholder="+212600000000" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">البريد الإلكتروني للعلامة</label>
                            <input type="email" value={settings.email || ''} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">عنوان مشغل المتجر الفعلي (المدينة/الحي)</label>
                            <input type="text" value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">انستغرام (Instagram Username)</label>
                            <input type="text" value={settings.instagram || ''} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-mono" placeholder="safos.bags" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">فيسبوك (Facebook)</label>
                            <input type="text" value={settings.facebook || ''} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-mono" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">تيك توك (TikTok)</label>
                            <input type="text" value={settings.tiktok || ''} onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-mono" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* القسم الفرعي لتعديل قوالب رسائل الواتساب حياً وتضمين المتغيرات */}
                    {activeSettingsSection === 'templates' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">تعديل قوالب رسائل الواتساب</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل قوالب تأكيد طلبيات الـ COD وإرسال روابط التقييم باللغات الثلاث</p>
                        </div>
                        
                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-emerald-400 font-semibold">قالب تأكيد طلبيات COD (WhatsApp COD Confirmation)</h5>
                          <div className="grid grid-cols-1 gap-3 text-[10px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 leading-relaxed">
                            <p><strong>المتغيرات المتاحة للاستخدام داخل قالب الرسالة:</strong></p>
                            <p>• `{'{name}'}`: اسم الكليان • `{'{order_number}'}`: رقم الطلبية • `{'{total}'}`: قيمة الطلب • `{'{city}'}`: المدينة</p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">القالب بالعربية</label>
                              <textarea value={settings.cod_confirm_ar || ''} onChange={(e) => setSettings({ ...settings, cod_confirm_ar: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">القالب بالفرنسية</label>
                              <textarea value={settings.cod_confirm_fr || ''} onChange={(e) => setSettings({ ...settings, cod_confirm_fr: e.target.value })} className="w-full h-20 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm text-[#1a1410]" />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">القالب بالإنجليزية</label>
                              <textarea value={settings.cod_confirm_en || ''} onChange={(e) => setSettings({ ...settings, cod_confirm_en: e.target.value })} className="w-full h-20 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm text-[#1a1410]" />
                            </div>
                          </div>
                        </div>

                        <div className="border-b border-zinc-100 pb-4 space-y-4">
                          <h5 className="text-xs text-amber-500 font-semibold">قالب طلب التقييم ورابط المراجعات (WhatsApp Review Request)</h5>
                          <div className="grid grid-cols-1 gap-3 text-[10px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 leading-relaxed">
                            <p><strong>المتغيرات المتاحة للاستخدام:</strong></p>
                            <p>• `{'{name}'}`: اسم الزبونة • `{'{review_url}'}`: الرابط المباشر للتقييم</p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">القالب بالعربية</label>
                              <textarea value={settings.review_request_ar || ''} onChange={(e) => setSettings({ ...settings, review_request_ar: e.target.value })} className="w-full h-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">القالب بالفرنسية</label>
                              <textarea value={settings.review_request_fr || ''} onChange={(e) => setSettings({ ...settings, review_request_fr: e.target.value })} className="w-full h-20 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm text-[#1a1410]" />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">القالب بالإنجليزية</label>
                              <textarea value={settings.review_request_en || ''} onChange={(e) => setSettings({ ...settings, review_request_en: e.target.value })} className="w-full h-20 bg-zinc-50 border border-[#b8935a]/25 p-3 rounded-xl text-sm text-[#1a1410]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🟢 قسم الألوان والخطوط الفاخرة وخلفيات الكروت المحدث بالكامل للداشبورد والموقع */}
                    {activeSettingsSection === 'style' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-medium">الألوان والخطوط وخلفيات النصوص والصور</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل كامل لألوان المتجر والداشبورد والخلفيات حياً</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">اللون الأساسي للموقع (Primary)</label>
                            <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">اللون الثانوي / الذهبي للموقع (Secondary)</label>
                            <input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون العناوين الكبرى والشعار (Title Color)</label>
                            <input type="color" value={settings.title_color} onChange={(e) => setSettings({ ...settings, title_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون النصوص والوصوف والفقرات (Text Color)</label>
                            <input type="color" value={settings.text_color} onChange={(e) => setSettings({ ...settings, text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        {/* مغير ألوان لوحة التحكم (الداشبورد) وأزرارها تفاعلياً */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية لوحة التحكم (Dashboard BG)</label>
                            <input type="color" value={settings.admin_bg_color} onChange={(e) => setSettings({ ...settings, admin_bg_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون بطاقات لوحة التحكم (Dashboard Card BG)</label>
                            <input type="color" value={settings.admin_card_bg} onChange={(e) => setSettings({ ...settings, admin_card_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون نصوص لوحة التحكم (Dashboard Text Color)</label>
                            <input type="color" value={settings.admin_text_color} onChange={(e) => setSettings({ ...settings, admin_text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون خلفية أزرار الداشبورد (Dashboard Button BG)</label>
                            <input type="color" value={settings.admin_button_bg_color} onChange={(e) => setSettings({ ...settings, admin_button_bg_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5">لون نصوص أزرار الداشبورد (Dashboard Button Text)</label>
                            <input type="color" value={settings.admin_button_text_color} onChange={(e) => setSettings({ ...settings, admin_button_text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية كروت الحقائب والآراء (Card BG)</label>
                            <input type="color" value={settings.card_bg} onChange={(e) => setSettings({ ...settings, card_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية الأكورديون المطوي (Accordion BG)</label>
                            <input type="color" value={settings.accordion_bg} onChange={(e) => setSettings({ ...settings, accordion_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">لون خلفية إطارات صور الحقائب (Image Frame BG)</label>
                            <input type="color" value={settings.image_bg} onChange={(e) => setSettings({ ...settings, image_bg: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium">خط العناوين الكبرى (Heading Font)</label>
                            <select value={settings.title_font} onChange={(e) => setSettings({ ...settings, title_font: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 focus:outline-none">
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Cinzel">Cinzel</option>
                              <option value="Cairo">Cairo (عربي فاخر)</option>
                              <option value="Cormorant Garamond">Cormorant Garamond</option>
                              <option value="Tajawal">Tajawal</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">خط النصوص والوصوف العادية (Body Font)</label>
                            <select value={settings.body_font} onChange={(e) => setSettings({ ...settings, body_font: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 focus:outline-none">
                              <option value="Montserrat">Montserrat</option>
                              <option value="Lato">Lato</option>
                              <option value="Inter">Inter</option>
                              <option value="Tajawal">Tajawal (عربي ناعم)</option>
                              <option value="Roboto">Roboto</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🟢 قسم إدارة المينيو وقائمة التنقل التفاعلية باللغات الثلاث */}
                    {activeSettingsSection === 'menu' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light font-medium">إدارة قائمة التنقل (Menu Manager)</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل وتخصيص أسماء الروابط الخمسة بالكامل باللغات الثلاث مع تفعيلها وإخفائها</p>
                        </div>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num} className="border-b border-zinc-100 pb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-500 font-semibold">رابط التنقل {num}</span>
                              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                <input type="checkbox" checked={settings[`menu_p${num}_visible`]} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_visible`]: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37] focus:ring-0" />
                                <span>إظهار في القائمة</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="الاسم بالعربية" value={settings[`menu_p${num}_ar`] || ''} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_ar`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالفرنسية" value={settings[`menu_p${num}_fr`] || ''} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_fr`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالإنجليزية" value={settings[`menu_p${num}_en`] || ''} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_en`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 🟢 قسم إدارة حقول الشراء للزبون (Checkout Fields) تفاعلياً كأزرار إخفاء وإظهار */}
                    {activeSettingsSection === 'checkout' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light font-medium">إدارة حقول الشراء (Checkout Manager)</h4>
                          <p className="text-xs text-zinc-500 mt-1">التحكم في حقول استمارة معلومات الشحن وتعديل أسمائها لبراند SAFOS</p>
                        </div>
                        {['name', 'phone', 'city', 'address', 'notes'].map((field) => (
                          <div key={field} className="border-b border-zinc-100 pb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-500 uppercase">حقل: {field === 'name' ? 'الاسم' : field === 'phone' ? 'الهاتف' : field === 'city' ? 'المدينة' : field === 'address' ? 'العنوان' : 'ملاحظات'}</span>
                              <div className="flex space-x-3 space-x-reverse">
                                <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                  <input type="checkbox" checked={settings[`field_${field}_visible`]} onChange={(e) => setSettings({ ...settings, [`field_${field}_visible`]: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                                  <span>ظاهر فالموقع</span>
                                </label>
                                <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                  <input type="checkbox" checked={settings[`field_${field}_required`]} onChange={(e) => setSettings({ ...settings, [`field_${field}_required`]: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                                  <span>حقل إجباري</span>
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="الاسم بالعربية" value={settings[`field_${field}_ar`] || ''} onChange={(e) => setSettings({ ...settings, [`field_${field}_ar`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالفرنسية" value={settings[`field_${field}_fr`] || ''} onChange={(e) => setSettings({ ...settings, [`field_${field}_fr`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                              <input type="text" placeholder="الاسم بالإنجليزية" value={settings[`field_${field}_en`] || ''} onChange={(e) => setSettings({ ...settings, [`field_${field}_en`]: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-xs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 🟢 أزرار التفعيل والإخفاء الحية للأقسام الكبرى فالمتجر */}
                    {activeSettingsSection === 'policies' && (
                      <div className="space-y-4 border-t border-zinc-200 pt-5">
                        <h4 className="text-xs text-amber-500 font-semibold mb-2">التحكم في إظهار وإخفاء الأقسام الكبرى فالمتجر</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                            <input type="checkbox" checked={settings.show_announcement_bar} onChange={(e) => setSettings({ ...settings, show_announcement_bar: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                            <span>شريط الإعلانات الفوقاني</span>
                          </label>
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                            <input type="checkbox" checked={settings.show_about_section} onChange={(e) => setSettings({ ...settings, show_about_section: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                            <span>قسم قصة ورشتنا (من نحن)</span>
                          </label>
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                            <input type="checkbox" checked={settings.show_pillars_section} onChange={(e) => setSettings({ ...settings, show_pillars_section: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                            <span>قسم ركائز الفخامة</span>
                          </label>
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                            <input type="checkbox" checked={settings.show_testimonials_section} onChange={(e) => setSettings({ ...settings, show_testimonials_section: e.target.checked })} className="rounded border-zinc-200 bg-zinc-50 text-[#D4AF37]" />
                            <span>قسم تقييمات العميلات</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-zinc-900 pt-6 mt-6 flex justify-end">
                      <button type="submit" disabled={actionLoading === 'settings'} className="text-black font-semibold py-3 px-8 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-all text-xs" style={{ backgroundColor: 'var(--secondary-theme)', color: '#000000' }}>
                        <Save size={18} />
                        <span>{actionLoading === 'settings' ? 'جاري الحفظ والمزامنة...' : 'مزامنة وحفظ التعديلات حياً'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ------------------ أ. نافذة إضافة منتج جديد بالكامل (Add Product Modal) ------------------ */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">إضافة حقيبة كانفاس جديدة للتشكيلة</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">اسم الحقيبة بالعربية *</label>
                  <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm text-[#1a1410]" placeholder="مثال: حقيبة صفاء الكانفاس" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">الاسم بالإنجليزي (EN) *</label>
                  <input type="text" required value={newProduct.name_en} onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" placeholder="Safaa Canvas Bag" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">السعر الموحد (درهم) *</label>
                  <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">المخزون المتوفر</label>
                  <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* قائمة اختيار التصنيف الديناميكي المقروء مباشرة من جدول categories */}
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">الصنف والمجموعة *</label>
                  <select 
                    required
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} 
                    className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]"
                  >
                    <option value="">اختر المجموعة...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">الألوان المتوفرة</label>
                  <input type="text" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" placeholder="بيج × أسود" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">التاغ الترويجي</label>
                  <input type="text" value={newProduct.tag} onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" placeholder="جديد، الأكثر مبيعاً" />
                </div>
              </div>
              
              {/* أزرار الإخفاء والإظهار للميزات (Visibility Toggles) للمنتج الجديد */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_video} onChange={(e) => setNewProduct({ ...newProduct, show_video: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار الفيديو</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_gallery} onChange={(e) => setNewProduct({ ...newProduct, show_gallery: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار المعرض</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_care_guide} onChange={(e) => setNewProduct({ ...newProduct, show_care_guide: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار دليل العناية</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_dimensions} onChange={(e) => setNewProduct({ ...newProduct, show_dimensions: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار المقاسات</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#b8935a]/20 pt-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">رفع الصورة الرئيسية من جهازك</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-800 text-[#faf6ef] p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, BUCKETS.PRODUCT_IMAGES);
                            setNewProduct({ ...newProduct, image_url: url });
                            showToast('تم رفع الصورة بنجاح', 'success');
                          } catch (err: any) {
                            showToast(err.message, 'error');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">رفع صور إضافية للمعرض</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-800 text-[#faf6ef] p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل صورة إضافية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, BUCKETS.PRODUCT_IMAGES);
                            setNewProduct((prev: any) => ({
                              ...prev,
                              additional_images: [...prev.additional_images, url]
                            }));
                            showToast('تمت إضافة صورة للمعرض', 'success');
                          } catch (err: any) {
                            showToast(err.message, 'error');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#5c4330] mb-1.5 block">رابط الفيديو الترويجي (يوتيوب أو فيديو مباشر)</label>
                <input type="text" value={newProduct.video_url} onChange={(e) => setNewProduct({ ...newProduct, video_url: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs font-mono text-[#1a1410]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">وصف الحقيبة بالعربية</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full h-16 bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">وصف الحقيبة بالفرنسية</label>
                  <textarea value={newProduct.description_en} onChange={(e) => setNewProduct({ ...newProduct, description_en: e.target.value })} className="w-full h-16 bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">مقاسات الحقيبة بالعربية</label>
                  <input type="text" value={newProduct.materials_dimensions} onChange={(e) => setNewProduct({ ...newProduct, materials_dimensions: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" placeholder="المتوسط: 36cm x 27.5cm" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">مقاسات الحقيبة بالفرنسية</label>
                  <input type="text" value={newProduct.materials_dimensions_en} onChange={(e) => setNewProduct({ ...newProduct, materials_dimensions_en: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" placeholder="Moyen: 36cm x 27.5cm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">دليل التنظيف والعناية بالعربية</label>
                  <textarea value={newProduct.care_guide} onChange={(e) => setNewProduct({ ...newProduct, care_guide: e.target.value })} className="w-full h-16 bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">دليل التنظيف والعناية بالفرنسية</label>
                  <textarea value={newProduct.care_guide_en} onChange={(e) => setNewProduct({ ...newProduct, care_guide_en: e.target.value })} className="w-full h-16 bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
              </div>
              <div className="border-t border-[#b8935a]/20 pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="bg-[#1a1410] text-[#faf6ef] py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === 'add-product'} className="bg-[#b8935a] text-black py-2.5 px-6 rounded-xl text-xs font-bold">إضافة التشكيلة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ ب. نافذة تعديل تفاصيل المنتج بالكامل (Edit Product Modal) ------------------ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">تعديل مواصفات الحقيبة</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اسم الحقيبة بالعربية</label>
                  <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الاسم بالإنجليزي (EN)</label>
                  <input type="text" value={editingProduct.name_en} onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر الموحد (درهم)</label>
                  <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">المخزون المتوفر</label>
                  <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الصنف والمجموعة *</label>
                  <select 
                    required
                    value={editingProduct.category} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                    className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]"
                  >
                    <option value="">اختر المجموعة...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الألوان</label>
                  <input type="text" value={editingProduct.color || ''} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التاغ</label>
                  <input type="text" value={editingProduct.tag || ''} onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-300" />
                </div>
              </div>

              {/* أزرار الإخفاء والإظهار للميزات (Visibility Toggles) للمنتج الذي يتم تعديله */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_video} onChange={(e) => setEditingProduct({ ...editingProduct, show_video: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار الفيديو</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_gallery} onChange={(e) => setEditingProduct({ ...editingProduct, show_gallery: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار المعرض</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_care_guide} onChange={(e) => setEditingProduct({ ...editingProduct, show_care_guide: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار دليل العناية</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_dimensions} onChange={(e) => setEditingProduct({ ...editingProduct, show_dimensions: e.target.checked })} className="rounded border-zinc-800 bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار المقاسات</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#b8935a]/20 pt-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رفع صورة رئيسية جديدة</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-855 text-[#faf6ef] p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, BUCKETS.PRODUCT_IMAGES);
                            setEditingProduct({ ...editingProduct, image_url: url });
                            showToast('تم تغيير الصورة الرئيسية', 'success');
                          } catch (err: any) {
                            showToast(err.message, 'error');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رفع صور إضافية للمعرض</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-855 text-[#faf6ef] p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل صورة إضافية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, BUCKETS.PRODUCT_IMAGES);
                            setEditingProduct((prev: any) => ({
                              ...prev,
                              additional_images: [...(prev.additional_images || []), url]
                            }));
                            showToast('تمت إضافة صورة للمعرض', 'success');
                          } catch (err: any) {
                            showToast(err.message, 'error');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#5c4330] mb-1.5 block">رابط الفيديو الترويجي</label>
                <input type="text" value={editingProduct.video_url || ''} onChange={(e) => setEditingProduct({ ...editingProduct, video_url: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs font-mono text-[#1a1410]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">الوصف التفصيلي لثوب الكانفاس بالعربية</label>
                  <textarea value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full h-16 bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">الوصف التفصيلي لثوب الكانفاس بالفرنسية</label>
                  <textarea value={editingProduct.description_en || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })} className="w-full h-16 bg-black border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">أبعاد الحقيبة الدقيقة بالعربية</label>
                  <input type="text" value={editingProduct.materials_dimensions || ''} onChange={(e) => setEditingProduct({ ...editingProduct, materials_dimensions: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">أبعاد الحقيبة الدقيقة بالفرنسية</label>
                  <input type="text" value={editingProduct.materials_dimensions_en || ''} onChange={(e) => setEditingProduct({ ...editingProduct, materials_dimensions_en: e.target.value })} className="w-full bg-black border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">طرق تنظيف الكانفاس والتطريز بالعربية</label>
                  <textarea value={editingProduct.care_guide || ''} onChange={(e) => setEditingProduct({ ...editingProduct, care_guide: e.target.value })} className="w-full h-16 bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-[#5c4330] mb-1.5 block">طرق تنظيف الكانفاس والتطريز بالفرنسية</label>
                  <textarea value={editingProduct.care_guide_en || ''} onChange={(e) => setEditingProduct({ ...editingProduct, care_guide_en: e.target.value })} className="w-full h-16 bg-black border border-[#b8935a]/25 p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
              </div>
              <div className="border-t border-zinc-900 pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setEditingProduct(null)} className="bg-[#1a1410] text-[#faf6ef] py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === `save-prod-${editingProduct.id}`} className="bg-[#D4AF37] text-black py-2.5 px-6 rounded-xl text-xs font-bold" style={{ backgroundColor: 'var(--secondary-theme)' }}>حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ د. نافذة إضافة/تعديل مجموعة جديدة (Add/Edit Category Modal) ------------------ */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">{editingCategory ? 'تعديل اسم المجموعة' : 'إضافة مجموعة جديدة'}</h3>
              <button onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-right">
              <div>
                <label className="text-xs text-[#5c4330] mb-1.5 block">اسم المجموعة بالعربية *</label>
                <input type="text" required value={newCategory.name_ar} onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm text-[#1a1410]" placeholder="مثال: حقائب السهرات" />
              </div>
              <div>
                <label className="text-xs text-[#5c4330] mb-1.5 block">اسم المجموعة بالفرنسية *</label>
                <input type="text" required value={newCategory.name_fr} onChange={(e) => setNewCategory({ ...newCategory, name_fr: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm text-[#1a1410]" placeholder="Sacs de Soirée" />
              </div>
              <div>
                <label className="text-xs text-[#5c4330] mb-1.5 block">اسم المجموعة بالإنجليزية *</label>
                <input type="text" required value={newCategory.name_en} onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value })} className="w-full bg-[#faf6ef] border border-[#b8935a]/25 p-2.5 rounded-xl text-sm text-[#1a1410]" placeholder="Evening Bags" />
              </div>
              <div className="border-t border-zinc-900 pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }} className="bg-[#1a1410] text-[#faf6ef] py-2.5 px-5 rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="bg-[#D4AF37] text-black py-2.5 px-5 rounded-xl text-xs font-bold" style={{ backgroundColor: 'var(--secondary-theme)' }}>حفظ المجموعة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ ج. نافذة تفاصيل ومعالجة الطلبات المنبثقة والجاهزة للطباعة ------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:absolute print:inset-0 print:bg-white print:p-0">
          <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl print:border-0 print:bg-white print:text-black print:shadow-none animate-scaleIn">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-[#0F0F0F] print:hidden">
              <div>
                <span className="text-xs text-amber-500 font-mono font-bold">{selectedOrder.order_number}</span>
                <h3 className="text-base font-light text-zinc-200 mt-0.5">تفاصيل ومعالجة الطلب للعميل</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-900 text-zinc-500 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6 print:p-8">
              {/* ترويسة الفاتورة المخصصة للطباعة وتجهيز الشحنات */}
              <div className="hidden print:block text-center border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold tracking-[0.2em] text-black">
                  {lang === 'ar' ? settings.site_name_ar : lang === 'fr' ? settings.site_name_fr : settings.site_name_en}
                </h1>
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  {lang === 'ar' ? settings.site_subtitle_ar : lang === 'fr' ? settings.site_subtitle_fr : settings.site_subtitle_en}
                </p>
                <div className="text-right mt-6 text-xs text-gray-600">
                  <p>رقم الفاتورة: #{selectedOrder.order_number}</p>
                  <p>التاريخ: {new Date(selectedOrder.created_at).toLocaleDateString('ar-MA')}</p>
                </div>
              </div>

              <div className="bg-[#0D0D0D] border border-zinc-900 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 print:bg-white print:border-gray-200 print:text-black">
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">اسم العميل بالكامل</h4>
                  <p className="text-sm font-semibold print:text-black">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">المدينة وعنوان الشحن</h4>
                  <p className="text-sm print:text-black">{selectedOrder.customer_city} • {selectedOrder.customer_address}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">الهاتف للتواصل</h4>
                  <p className="text-sm font-mono print:text-black">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">طريقة الدفع</h4>
                  <p className="text-sm print:text-black">الدفع عند الاستلام (COD)</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-3 print:text-black">الحقائب الفاخرة المشمولة:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-[#0F0F0F] border border-zinc-900 rounded-xl print:bg-white print:border-gray-200">
                      <div>
                        <span className="text-sm font-light text-zinc-200 print:text-black">{item.productName || item.product_name}</span>
                        <span className="text-xs text-zinc-500 block mt-0.5">الكمية: {item.qty || item.quantity} حقيبة</span>
                      </div>
                      <span className="text-sm text-[#D4AF37] font-semibold print:text-black">{(Number(item.price) * Number(item.qty || item.quantity)).toLocaleString()} درهم</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex justify-between items-center print:border-gray-200">
                <span className="text-sm text-zinc-400 print:text-black">المجموع الإجمالي للطلبية:</span>
                <span className="text-xl font-light text-[#D4AF37] print:text-black print:font-bold">{Number(selectedOrder.total).toLocaleString()} درهم</span>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-zinc-900/50 rounded-xl text-xs text-zinc-400 print:hidden">
                  <span className="font-semibold block mb-1">ملاحظات الزبون الإضافية:</span>
                  {selectedOrder.notes}
                </div>
              )}

              {/* تذييل الفاتورة للزبون المطبوع */}
              <div className="hidden print:block text-center text-[10px] text-gray-400 border-t pt-8 mt-8">
                شكرًا لكم على تسوقكم من SAFOS • حقائب كانفاس مصنوعة يدويًا بفخر مغربي 🇲🇦
              </div>
            </div>

            <div className="p-6 bg-[#0F0F0F] border-t border-zinc-900 flex flex-wrap gap-3 justify-between items-center print:hidden">
              <div className="flex gap-2">
                <button onClick={() => handleSendWhatsAppMessage(selectedOrder, 'confirm')} className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Send size={14} />
                  <span>تأكيد وشحن عبر واتساب</span>
                </button>
                <button onClick={handlePrintInvoice} className="bg-zinc-900 hover:bg-zinc-850 text-zinc-100 py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 space-x-reverse border border-zinc-800">
                  <Printer size={14} />
                  <span>تحميل / طباعة الفاتورة</span>
                </button>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 py-2 px-5 rounded-xl text-xs">إغلاق</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
