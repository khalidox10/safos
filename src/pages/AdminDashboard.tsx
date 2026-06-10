import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { fetchStoreData } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings' | 'reviews' | 'categories'>('dashboard');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'identity' | 'hero' | 'about' | 'pillars' | 'testimonials' | 'policies' | 'contact' | 'templates' | 'style' | 'checkout' | 'menu'>('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [settings, setSettings] = useState<any>({
    site_name_ar: '', site_name_fr: '', site_name_en: '',
    site_subtitle_ar: '', site_subtitle_fr: '', site_subtitle_en: '',
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
    cod_confirm_ar: '', cod_confirm_fr: '', cod_confirm_en: '',
    review_request_ar: '', review_request_fr: '', review_request_en: '',
    show_about_section: true, show_pillars_section: true, show_testimonials_section: true, show_announcement_bar: true,
    field_name_ar: '', field_name_fr: '', field_name_en: '', field_name_required: true, field_name_visible: true,
    field_phone_ar: '', field_phone_fr: '', field_phone_en: '', field_phone_required: true, field_phone_visible: true,
    field_city_ar: '', field_city_fr: '', field_city_en: '', field_city_required: true, field_city_visible: true,
    field_address_ar: '', field_address_fr: '', field_address_en: '', field_address_required: true, field_address_visible: true,
    field_notes_ar: '', field_notes_fr: '', field_notes_en: '', field_notes_required: false, field_notes_visible: true,
    menu_p1_ar: '', menu_p1_fr: '', menu_p1_en: '', menu_p1_visible: true,
    menu_p2_ar: '', menu_p2_fr: '', menu_p2_en: '', menu_p2_visible: true,
    menu_p3_ar: '', menu_p3_fr: '', menu_p3_en: '', menu_p3_visible: true,
    menu_p4_ar: '', menu_p4_fr: '', menu_p4_en: '', menu_p4_visible: true,
    menu_p5_ar: '', menu_p5_fr: '', menu_p5_en: '', menu_p5_visible: true
  });

  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const [newProduct, setNewProduct] = useState<any>({
    name: '', name_en: '', name_fr: '', price: 0, old_price: null, stock: 5, image_url: '', category: '',
    color: '', tag: '', description: '', description_en: '', description_fr: '',
    materials_dimensions: '', materials_dimensions_en: '', materials_dimensions_fr: '',
    care_guide: '', care_guide_en: '', care_guide_fr: '', additional_images: [], video_url: '',
    show_video: true, show_gallery: true, show_care_guide: true, show_dimensions: true
  });

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
          show_about_section: visibility.show_about_section !== false,
          show_pillars_section: visibility.show_pillars_section !== false,
          show_testimonials_section: visibility.show_testimonials_section !== false,
          show_announcement_bar: visibility.show_announcement_bar !== false,
          field_name_ar: checkoutFields.field_name_ar || '', field_name_fr: checkoutFields.field_name_fr || '', field_name_en: checkoutFields.field_name_en || '', field_name_required: checkoutFields.field_name_required !== false, field_name_visible: checkoutFields.field_name_visible !== false,
          field_phone_ar: checkoutFields.field_phone_ar || '', field_phone_fr: checkoutFields.field_phone_fr || '', field_phone_en: checkoutFields.field_phone_en || '', field_phone_required: checkoutFields.field_phone_required !== false, field_phone_visible: checkoutFields.field_phone_visible !== false,
          field_city_ar: checkoutFields.field_city_ar || '', field_city_fr: checkoutFields.field_city_fr || '', field_city_en: checkoutFields.field_city_en || '', field_city_required: checkoutFields.field_city_required !== false, field_city_visible: checkoutFields.field_city_visible !== false,
          field_address_ar: checkoutFields.field_address_ar || '', field_address_fr: checkoutFields.field_address_fr || '', field_address_en: checkoutFields.field_address_en || '', field_address_required: checkoutFields.field_address_required !== false, field_address_visible: checkoutFields.field_address_visible !== false,
          field_notes_ar: checkoutFields.field_notes_ar || '', field_notes_fr: checkoutFields.field_notes_fr || '', field_notes_en: checkoutFields.field_notes_en || '', field_notes_required: checkoutFields.field_notes_required === true, field_notes_visible: checkoutFields.field_notes_visible !== false,
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
  // 📥 دالة تسجيل الخروج المعتمدة في بنية مشروعك الخاص ( useAuth )
  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  // 📥 دالة رفع الصور المعتمدة فالمشروع لرفع جميع ملفات وأقسام الموقع من جهازك مباشرة لـ Supabase
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
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

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
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('هل تريد حذف هذا التقييم نهائياً؟')) return;
    setActionLoading(`del-review-${reviewId}`);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete().eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast('تم حذف التقييم بنجاح', 'success');
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
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('هل تريد حذف هذه حقيبة الكانفاس نهائياً من العرض؟')) return;
    setActionLoading(`del-prod-${productId}`);
    try {
      const { error } = await supabase
        .from('products')
        .delete().eq('id', productId);
      if (error) throw error;
      showToast('تم حذف المنتج بنجاح', 'success');
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
          value: { primary: settings.primary_color, secondary: settings.secondary_color, title_color: settings.title_color, text_color: settings.text_color, card_bg: settings.card_bg, accordion_bg: settings.accordion_bg, image_bg: settings.image_bg, title_font: settings.title_font, body_font: settings.body_font }
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

      for (const update of updates) {
        const { error } = await supabase
          .from('store_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        if (error) throw error;
      }

      if (fetchStoreData) await fetchStoreData();
      showToast('تم حفظ جميع تعديلات الهوية والأقسام بنجاح ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء مزامنة البيانات', 'error');
    } finally {
      setActionLoading(null);
    }
  };
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white" dir="rtl">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
        <span className="mr-3 font-medium">جاري تحميل لوحة التحكم الفاخرة لـ SAFOS...</span>
      </div>
    );
  }

  // حساب إحصائيات سريعة للوحة التحكم الرئيسية
  const totalSales = orders
    .filter(o => o.status === 'delivered' || o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const processingOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 flex" dir="rtl">
      
      {/* 1. القائمة الجانبية للتنقل الذكي (Sidebar) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-[#0F0F0F] border-l border-neutral-900 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col justify-between`}>
        <div>
          <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-black font-serif font-bold text-lg">
                {settings.logo_letter || 'S'}
              </div>
              <span className="font-serif font-bold text-lg tracking-wider text-white">SAFOS PANEL</span>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            <button 
              type="button"
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              <LayoutDashboard className="h-4 w-4" /> لوحة الإحصائيات العامة
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              <ShoppingBag className="h-4 w-4" /> الطلبيات الواردة 
              <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded-md text-[10px] font-bold mr-auto">{orders.length}</span>
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              <ImageIcon className="h-4 w-4" /> حقائب الكانفاس والمنتجات
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'categories' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              <Plus className="h-4 w-4" /> مجموعات وتصنيفات الماركة
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'reviews' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              <Star className="h-4 w-4" /> تقييمات العميلات 
              <span className="bg-neutral-800 text-gray-400 px-1.5 py-0.5 rounded-md text-[10px] mr-auto">{reviews.filter(r => !r.is_approved).length} معلق</span>
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              <SettingsIcon className="h-4 w-4" /> الإعدادات وتخصيص المتجر
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-900">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="h-4 w-4" /> تسجيل الخروج الآمن
          </button>
        </div>
      </div>

      {/* 2. منطقة العرض الأساسية ومحتوى التبويبات */}
      <div className="flex-1 md:mr-64 p-6 min-w-0 flex flex-col">
        
        {/* التنبيهات المنبثقة التلقائية (Toast) */}
        {toast && (
          <div className={`fixed top-5 left-5 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-fade-in ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' : 'bg-red-950/90 border-red-500 text-red-200'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

        {/* الهيدر العلوي لتبديل لغة المعاينة السريعة */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 hover:bg-neutral-900 rounded-lg text-gray-400" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white font-serif tracking-wide">لوحة الإشراف والتعديل المباشر</h1>
              <p className="text-[10px] text-gray-400">مرحباً بك مجدداً في مركز إدارة متجر الهوية الملكية الفاخرة لـ SAFOS.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button onClick={() => handleLangChange('ar')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'ar' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>العربية</button>
            <button onClick={() => handleLangChange('fr')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'fr' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Français</button>
            <button onClick={() => handleLangChange('en')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'en' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>English</button>
          </div>
        </header>

        {/* تبويب لوحة الإحصائيات العامة (Dashboard Tab) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* كروت التقارير المالية الفورية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">المبيعات المكتملة</span>
                  <h3 className="text-2xl font-bold font-serif text-white mt-1.5 tracking-tight">
                    {totalSales.toLocaleString()} <span className="text-xs text-amber-500 font-sans mr-0.5">{settings.currency_symbol || 'د.م'}</span>
                  </h3>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">إجمالي الطلبيات المستلمة</span>
                  <h3 className="text-2xl font-bold font-serif text-white mt-1.5 tracking-tight">{orders.length}</h3>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">طلبيات بانتظار التأكيد</span>
                  <h3 className="text-2xl font-bold font-serif text-amber-500 mt-1.5 tracking-tight">{pendingOrdersCount}</h3>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
              </div>

              <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">طلبيات قيد الشحن/التوصيل</span>
                  <h3 className="text-2xl font-bold font-serif text-blue-400 mt-1.5 tracking-tight">{processingOrdersCount}</h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* تقرير حالة المخزون وحجم التفاعل */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl lg:col-span-2">
                <h3 className="text-xs font-bold text-white font-serif mb-4 flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-amber-500" /> تحليل النشاط السريع للمتجر
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  هذا القسم يراقب الأداء الفوري. يمكنك الاطلاع على أحدث الطلبيات عبر التبويب المخصص للتحكم الكامل في الشحن وتصدير الفواتير، أو تعديل باليتة الألوان للهوية البصرية مباشرة من قسم الإعدادات.
                </p>
              </div>
              
              <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white font-serif mb-3">ملخص الكتالوج</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-2 border-b border-neutral-900">
                      <span className="text-gray-400">إجمالي حقائب الكانفاس:</span>
                      <span className="text-white font-bold">{products.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-900">
                      <span className="text-gray-400">مجموعات الماركة النشطة:</span>
                      <span className="text-white font-bold">{categories.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">التقييمات المعتمدة:</span>
                      <span className="text-emerald-400 font-bold">{reviews.filter(r => r.is_approved).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )};
        {/* تبويب إدارة الطلبيات (Orders Tab) */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold font-serif text-white">إدارة الطلبيات الواردة ({orders.length})</h2>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="بحث باسم العميل أو رقم الطلب..."
                    className="bg-[#0F0F0F] border border-neutral-900 rounded-lg py-2 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-amber-500/50 w-full md:w-64"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <select className="bg-[#0F0F0F] border border-neutral-900 rounded-lg px-4 py-2 text-xs text-white focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">جميع الحالات</option>
                  <option value="pending">بانتظار التأكيد</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                </select>
              </div>
            </div>

            <div className="bg-[#0F0F0F] border border-neutral-900 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#141414] text-gray-400">
                  <tr>
                    <th className="p-4">رقم الطلب</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">المجموع</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {orders
                    .filter(o => (statusFilter === 'all' || o.status === statusFilter) && 
                                 (o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) || o.order_number.toString().includes(orderSearch)))
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-[#141414] transition-colors">
                        <td className="p-4 font-bold text-amber-500">#{order.order_number}</td>
                        <td className="p-4 text-white font-medium">{order.customer_name}</td>
                        <td className="p-4 text-white">{order.total} {settings.currency_symbol}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                            order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {order.status === 'pending' ? 'بانتظار التأكيد' : order.status === 'processing' ? 'قيد المعالجة' : order.status === 'shipped' ? 'تم الشحن' : 'تم التوصيل'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-MA')}</td>
                        <td className="p-4">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-neutral-800 rounded-lg text-gray-400 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* نافذة تفاصيل الطلب (Modal) */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0F0F0F] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white font-serif">تفاصيل الطلب #{selectedOrder.order_number}</h3>
                <button onClick={() => setSelectedOrder(null)}><X className="h-6 w-6 text-gray-500" /></button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                  <div>الاسم: <span className="text-white block">{selectedOrder.customer_name}</span></div>
                  <div>الهاتف: <span className="text-white block">{selectedOrder.customer_phone}</span></div>
                  <div>المدينة: <span className="text-white block">{selectedOrder.customer_city}</span></div>
                  <div>العنوان: <span className="text-white block">{selectedOrder.customer_address}</span></div>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl text-xs text-white">
                  المجموع النهائي: <span className="text-amber-500 font-bold">{selectedOrder.total} {settings.currency_symbol}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleSendWhatsAppMessage(selectedOrder, 'confirm')} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-xs font-bold transition-colors">
                  <Send className="h-4 w-4" /> إرسال رسالة واتساب
                </button>
                <button onClick={handlePrintInvoice} className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg text-xs font-bold transition-colors">
                  <Printer className="h-4 w-4" /> طباعة الفاتورة
                </button>
              </div>
            </div>
          </div>
        )};
        {/* تبويب إدارة المنتجات (Products Tab) */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-serif text-white">إدارة حقائب الكانفاس ({products.length})</h2>
              <button onClick={() => setIsAddingProduct(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all">
                <Plus className="h-4 w-4" /> إضافة منتج جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-[#0F0F0F] border border-neutral-900 rounded-xl p-4 flex flex-col gap-3">
                  <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-lg" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{product.name}</h3>
                    <p className="text-xs text-amber-500 font-bold mt-1">{product.price} {settings.currency_symbol}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-neutral-900">
                    <button onClick={() => setEditingProduct(product)} className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-[10px] font-bold">
                      <Edit3 className="h-3 w-3" /> تعديل
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900 text-red-500 py-2 rounded-lg text-[10px] font-bold">
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نموذج إضافة/تعديل المنتج (Modal) */}
        {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#0F0F0F] border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة حقيبة جديدة'}</h3>
                <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}><X className="h-6 w-6 text-gray-500" /></button>
              </div>

              <form onSubmit={editingProduct ? handleSaveProductEdit : handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="الاسم (AR)" className="bg-neutral-900 p-3 rounded-lg text-xs w-full text-white" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} required />
                  <input type="text" placeholder="Name (EN)" className="bg-neutral-900 p-3 rounded-lg text-xs w-full text-white" value={editingProduct ? editingProduct.name_en : newProduct.name_en} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name_en: e.target.value}) : setNewProduct({...newProduct, name_en: e.target.value})} />
                  <input type="text" placeholder="Nom (FR)" className="bg-neutral-900 p-3 rounded-lg text-xs w-full text-white" value={editingProduct ? editingProduct.name_fr : newProduct.name_fr} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name_fr: e.target.value}) : setNewProduct({...newProduct, name_fr: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="السعر" className="bg-neutral-900 p-3 rounded-lg text-xs w-full text-white" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: Number(e.target.value)}) : setNewProduct({...newProduct, price: Number(e.target.value)})} />
                  <input type="text" placeholder="رابط الصورة الأساسية" className="bg-neutral-900 p-3 rounded-lg text-xs w-full text-white" value={editingProduct ? editingProduct.image_url : newProduct.image_url} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, image_url: e.target.value}) : setNewProduct({...newProduct, image_url: e.target.value})} />
                </div>

                <textarea placeholder="الوصف (AR)" className="bg-neutral-900 p-3 rounded-lg text-xs w-full text-white h-24" value={editingProduct ? editingProduct.description : newProduct.description} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg text-sm font-bold mt-4 transition-all">
                  {actionLoading ? 'جاري الحفظ...' : 'حفظ المنتج في المتجر'}
                </button>
              </form>
            </div>
          </div>
        )};
        {/* تبويب الإعدادات الشاملة (Settings Tab) */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-xl font-bold font-serif text-white">إعدادات وتخصيص المتجر</h2>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* القائمة الجانبية للإعدادات */}
              <div className="lg:w-1/4 space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSettingsSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeSettingsSection === section.id ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-neutral-900'}`}
                  >
                    <section.icon className="h-4 w-4" /> {section.label}
                  </button>
                ))}
              </div>

              {/* منطقة تحرير الإعدادات */}
              <div className="lg:w-3/4 bg-[#0F0F0F] border border-neutral-900 rounded-xl p-6">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* مثال: قسم الهوية البصرية */}
                  {activeSettingsSection === 'identity' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white mb-4">بيانات الهوية واللوغو</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="اسم المتجر (AR)" className="bg-neutral-900 p-3 rounded-lg text-xs text-white" value={settings.site_name_ar} onChange={(e) => setSettings({...settings, site_name_ar: e.target.value})} />
                        <input type="text" placeholder="حرف اللوغو" className="bg-neutral-900 p-3 rounded-lg text-xs text-white" value={settings.logo_letter} onChange={(e) => setSettings({...settings, logo_letter: e.target.value})} />
                      </div>
                      <input type="text" placeholder="رابط اللوغو" className="bg-neutral-900 p-3 rounded-lg text-xs text-white w-full" value={settings.logo_url} onChange={(e) => setSettings({...settings, logo_url: e.target.value})} />
                    </div>
                  )}

                  {/* قسم الألوان */}
                  {activeSettingsSection === 'style' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white mb-4">الألوان والخطوط الفاخرة</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">اللون الأساسي</label>
                          <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={settings.primary_color} onChange={(e) => setSettings({...settings, primary_color: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">لون التمييز (Secondary)</label>
                          <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={settings.secondary_color} onChange={(e) => setSettings({...settings, secondary_color: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* يمكن إضافة باقي الأقسام هنا بنفس المنطق */}
                  
                  <button type="submit" disabled={!!actionLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50">
                    {actionLoading === 'settings' ? 'جاري الحفظ والمزامنة...' : 'حفظ جميع الإعدادات'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
        
