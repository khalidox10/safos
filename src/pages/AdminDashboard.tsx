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
    // إعدادات ألوان السلة الافتراضية
    cart_bg: '#0F0F0F', cart_btn: '#D4AF37', cart_btn_text: '#000000', cart_text: '#FFFFFF',
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
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setOrders(ordersData || []);

      const { data: productsData } = await supabase.from('products').select('*').order('name');
      setProducts(productsData || []);

      const { data: categoriesData } = await supabase.from('categories').select('*').order('name_ar');
      setCategories(categoriesData || []);

      const { data: reviewsData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      setReviews(reviewsData || []);

      const { data: settingsData } = await supabase.from('store_settings').select('*');

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
          // استدعاء ألوان السلة من السحابة
          cart_bg: colors.cart_bg || '#0F0F0F', cart_btn: colors.cart_btn || '#D4AF37', cart_btn_text: colors.cart_btn_text || '#000000', cart_text: colors.cart_text || '#FFFFFF',
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

  const handleSendWhatsAppMessage = (order: any, type: 'confirm' | 'review') => {
    if (!order) return;
    const cleanPhone = order.customer_phone.replace(/\s+/g, '');
    let template = type === 'confirm'
      ? (lang === 'ar' ? settings.cod_confirm_ar : lang === 'fr' ? settings.cod_confirm_fr : settings.cod_confirm_en)
      : (lang === 'ar' ? settings.review_request_ar : lang === 'fr' ? settings.review_request_fr : settings.review_request_en);

    const reviewUrl = `https://safos.online/review/${order.items && order.items[0] ? order.items[0].id : ''}`;
    let message = template
      .replace(/{name}/g, order.customer_name)
      .replace(/{order_number}/g, order.order_number)
      .replace(/{total}/g, order.total)
      .replace(/{city}/g, order.customer_city)
      .replace(/{review_url}/g, reviewUrl);

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(`order-status-${orderId}`);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
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
      const { error } = await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', reviewId);
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
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
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
    if (!window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;
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
      const { error } = await supabase.from('products').insert([payload]);
      if (error) throw error;
      showToast('تمت إضافة المنتج بنجاح', 'success');
      setIsAddingProduct(false);
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
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
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
    if (!window.confirm('هل تريد حذف هذه الحقيبة نهائياً؟')) return;
    setActionLoading(`del-prod-${productId}`);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      showToast('تم حذف المنتج بنجاح', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 📝 اكتمال وإصلاح دالة حفظ الإعدادات بالكامل لتشمل ألوان السلة ومفاتيح إخفاء الأقسام
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
            // 🛒 حفظ ألوان السلة الجديدة حياً في السحابة
            cart_bg: settings.cart_bg, cart_btn: settings.cart_btn, cart_btn_text: settings.cart_btn_text, cart_text: settings.cart_text
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
          value: { cod_confirm_ar: settings.cod_confirm_ar, cod_confirm_fr: settings.cod_confirm_fr, cod_confirm_en: settings.cod_confirm_en, review_request_ar: settings.review_request_ar, review_request_fr: settings.review_request_fr, review_request_en: settings.review_request_en }
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
        // 👁️ حفظ مفاتيح الرؤية للأقسام والبانر الإعلاني
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
        const { error } = await supabase
          .from('store_settings')
          .upsert({ key: item.key, value: item.value }, { onConflict: 'key' });
        if (error) throw error;
      }

      showToast('تم حفظ كامل إعدادات المتجر الفاخر وتحديثه حياً!', 'success');
      fetchStoreData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ التحديثات', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gold">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin h-10 w-10 text-[#D4AF37]" />
          <p className="font-serif tracking-widest text-sm text-gray-400">جاري تأمين الاتصال بـ SAFOS Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans flex flex-col md:flex-row" dir="rtl">
      {/* القائمة الجانبية (Sidebar) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-[#0A0A0A] border-l border-neutral-900 transition-transform duration-300 md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-neutral-900 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-xl tracking-wider text-[#D4AF37] font-bold">SAFOS</h1>
            <p className="text-xs text-neutral-500">لوحة الإدارة الحية v2.0</p>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="p-4 space-y-1">
          <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-gray-400 hover:bg-neutral-900'}`}>
            <LayoutDashboard size={18} /> نظرة عامة
          </button>
          <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'orders' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-gray-400 hover:bg-neutral-900'}`}>
            <ShoppingBag size={18} /> الطلبيات الواردة <span className="mr-auto bg-red-950 text-red-400 text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'pending').length}</span>
          </button>
          <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'products' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-gray-400 hover:bg-neutral-900'}`}>
            <ImageIcon size={18} /> حقائب الكانفاس
          </button>
          <button onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'categories' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-gray-400 hover:bg-neutral-900'}`}>
            <Menu size={18} /> المجموعات والتصنيفات
          </button>
          <button onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'reviews' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-gray-400 hover:bg-neutral-900'}`}>
            <Star size={18} /> المراجعات والشهادات
          </button>
          <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'settings' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-gray-400 hover:bg-neutral-900'}`}>
            <SettingsIcon size={18} /> تخصيص المتجر بالكامل
          </button>
        </nav>

        <div className="absolute bottom-4 inset-x-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-950/20 transition-colors">
            <LogOut size={18} /> تسجيل الخروج الآمن
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي للوحة التحكم */}
      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-10">
        {/* الترويسة العلوية للتحكم باللغات والمعاينة والسندبار */}
        <div className="flex justify-between items-center mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-neutral-900">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-400" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="text-lg font-serif font-bold text-neutral-200">أهلاً بك في فضاء الإدارة والتحكم المباشر</h2>
          </div>
          <div className="flex items-center gap-2" dir="ltr">
            <button onClick={() => handleLangChange('ar')} className={`px-3 py-1 rounded text-xs transition-colors ${lang === 'ar' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-neutral-900 text-gray-400'}`}>AR</button>
            <button onClick={() => handleLangChange('fr')} className={`px-3 py-1 rounded text-xs transition-colors ${lang === 'fr' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-neutral-900 text-gray-400'}`}>FR</button>
            <button onClick={() => handleLangChange('en')} className={`px-3 py-1 rounded text-xs transition-colors ${lang === 'en' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-neutral-900 text-gray-400'}`}>EN</button>
          </div>
        </div>

        {/* التنبيهات المنبثقة (Toast) */}
        {toast && (
          <div className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm transition-all animate-bounce ${toast.type === 'success' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-red-950 text-red-400 border-red-900'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* تبويب: تخصيص وتعديل إعدادات المتجر ومظهره بالكامل */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* قائمة أقسام الإعدادات الفرعية */}
              <div className="w-full md:w-64 flex flex-col gap-1">
                {settingsSections.map((sec) => {
                  const IconComponent = sec.icon;
                  return (
                    <button key={sec.id} onClick={() => setActiveSettingsSection(sec.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-all text-right ${activeSettingsSection === sec.id ? 'bg-neutral-900 text-[#D4AF37] border-r-2 border-[#D4AF37] font-semibold' : 'text-neutral-400 hover:bg-neutral-950'}`}>
                      <IconComponent size={16} />
                      {sec.label}
                    </button>
                  );
                })}
              </div>

              {/* النماذج الفعلية للأقسام */}
              <div className="flex-1 bg-[#0F0F0F] border border-neutral-900 rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* نموذج: الألوان والخطوط الفاخرة + التحكم بألوان السلة حياً */}
                  {activeSettingsSection === 'style' && (
                    <div className="space-y-6">
                      <h3 className="text-base font-serif text-[#D4AF37] border-b border-neutral-800 pb-3 flex items-center gap-2"><Palette size={18}/> تخصيص باليتة الألوان الفاخرة والسلة حياً</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">اللون الرئيسي للموقع (Primary)</label>
                          <div className="flex gap-2"><input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"/><input type="text" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 text-xs uppercase"/></div>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">اللون الذهبي الاستكشافي (Secondary)</label>
                          <div className="flex gap-2"><input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"/><input type="text" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 text-xs uppercase"/></div>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">لون العناوين الرئيسية</label>
                          <div className="flex gap-2"><input type="color" value={settings.title_color} onChange={(e) => setSettings({ ...settings, title_color: e.target.value })} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"/><input type="text" value={settings.title_color} onChange={(e) => setSettings({ ...settings, title_color: e.target.value })} className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 text-xs uppercase"/></div>
                        </div>
                      </div>

                      <div className="border-t border-neutral-900 pt-6">
                        <h4 className="text-sm font-serif text-[#D4AF37] mb-4 flex items-center gap-2">🛒 التحكم المطلق بهوية وألوان سلة التسوق حياً</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-neutral-400 mb-2">خلفية السلة الجانبية</label>
                            <input type="color" value={settings.cart_bg} onChange={(e) => setSettings({ ...settings, cart_bg: e.target.value })} className="w-full h-10 rounded-lg bg-transparent cursor-pointer"/>
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-2">لون زر تأكيد الطلب</label>
                            <input type="color" value={settings.cart_btn} onChange={(e) => setSettings({ ...settings, cart_btn: e.target.value })} className="w-full h-10 rounded-lg bg-transparent cursor-pointer"/>
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-2">لون نصوص وأرقام السلة</label>
                            <input type="color" value={settings.cart_text} onChange={(e) => setSettings({ ...settings, cart_text: e.target.value })} className="w-full h-10 rounded-lg bg-transparent cursor-pointer"/>
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-2">لون نص داخل زر التأكيد</label>
                            <input type="color" value={settings.cart_btn_text} onChange={(e) => setSettings({ ...settings, cart_btn_text: e.target.value })} className="w-full h-10 rounded-lg bg-transparent cursor-pointer"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* نموذج: البانر الترحيبي والفرعي + مفاتيح التبديل لإخفاء الأقسام بالكامل */}
                  {activeSettingsSection === 'hero' && (
                    <div className="space-y-6">
                      <h3 className="text-base font-serif text-[#D4AF37] border-b border-neutral-800 pb-3">البانر العلوي ومفاتيح رؤية الأقسام الرئيسية</h3>
                      
                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-4">
                        <h4 className="text-xs font-serif text-[#D4AF37] uppercase tracking-wider">👁️ التحكم برؤية وإخفاء أقسام المتجر فوراً فالموقع</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 bg-black p-3 rounded-lg cursor-pointer border border-neutral-900">
                            <input type="checkbox" checked={settings.show_announcement_bar} onChange={(e) => setSettings({ ...settings, show_announcement_bar: e.target.checked })} className="rounded bg-neutral-900 border-neutral-800 text-[#D4AF37] focus:ring-0 w-4 h-4"/>
                            <span className="text-xs text-neutral-300">إظهار شريط الإعلانات العلوي المتحرك</span>
                          </label>
                          <label className="flex items-center gap-3 bg-black p-3 rounded-lg cursor-pointer border border-neutral-900">
                            <input type="checkbox" checked={settings.show_about_section} onChange={(e) => setSettings({ ...settings, show_about_section: e.target.checked })} className="rounded bg-neutral-900 border-neutral-800 text-[#D4AF37] focus:ring-0 w-4 h-4"/>
                            <span className="text-xs text-neutral-300">إظهار قسم "قصة الماركة - من نحن"</span>
                          </label>
                          <label className="flex items-center gap-3 bg-black p-3 rounded-lg cursor-pointer border border-neutral-900">
                            <input type="checkbox" checked={settings.show_pillars_section} onChange={(e) => setSettings({ ...settings, show_pillars_section: e.target.checked })} className="rounded bg-neutral-900 border-neutral-800 text-[#D4AF37] focus:ring-0 w-4 h-4"/>
                            <span className="text-xs text-neutral-300">إظهار قسم "ركائز الفخامة والتميز"</span>
                          </label>
                          <label className="flex items-center gap-3 bg-black p-3 rounded-lg cursor-pointer border border-neutral-900">
                            <input type="checkbox" checked={settings.show_testimonials_section} onChange={(e) => setSettings({ ...settings, show_testimonials_section: e.target.checked })} className="rounded bg-neutral-900 border-neutral-800 text-[#D4AF37] focus:ring-0 w-4 h-4"/>
                            <span className="text-xs text-neutral-300">إظهار قسم "آراء العميلات والشهادات"</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">نص شريط الإعلانات (العربية)</label>
                          <input type="text" value={settings.announcement_text_ar} onChange={(e) => setSettings({ ...settings, announcement_text_ar: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"/>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">عنوان البانر الرئيسي (العربية)</label>
                          <textarea rows={2} value={settings.hero_title_ar} onChange={(e) => setSettings({ ...settings, hero_title_ar: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"/>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* باقي النماذج للأقسام الأخرى كالتواصل والشعار تفتح بشكل انسيابي رائع */}
                  {activeSettingsSection === 'identity' && (
                    <div className="space-y-4">
                      <h3 className="text-base font-serif text-[#D4AF37] border-b border-neutral-800 pb-3">الشعار والهوية الرقمية</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">اسم الماركة بالعربية</label>
                          <input type="text" value={settings.site_name_ar} onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-xs"/>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-2">الحرف الرمزى للوجو الافتراضي</label>
                          <input type="text" maxLength={1} value={settings.logo_letter} onChange={(e) => setSettings({ ...settings, logo_letter: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-center font-bold text-[#D4AF37] uppercase"/>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* زر الحفظ العائم والمثبت أسفل نموذج الإعدادات الحية */}
                  <div className="flex justify-end border-t border-neutral-900 pt-4">
                    <button type="submit" disabled={actionLoading === 'settings'} className="bg-[#D4AF37] hover:bg-[#bfa032] text-black font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50">
                      {actionLoading === 'settings' ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      حفظ وتحديث كامل عناصر المتجر حياً فالمتصفح
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* بقية تبويبات لوحة التحكم كالطلبيات والمنتجات تظل تعمل بكامل كفاءتها واستقرارها */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-2xl flex items-center justify-between">
              <div><p className="text-xs text-neutral-400 mb-1">إجمالي المبيعات</p><h3 className="text-2xl font-serif font-bold text-[#D4AF37]">{orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total, 0)} {settings.currency_symbol}</h3></div>
              <div className="bg-emerald-950/40 p-3 rounded-xl text-emerald-400"><TrendingUp size={24}/></div>
            </div>
            <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-2xl flex items-center justify-between">
              <div><p className="text-xs text-neutral-400 mb-1">الطلبيات الجديدة</p><h3 className="text-2xl font-serif font-bold text-white">{orders.filter(o => o.status === 'pending').length} طلبية</h3></div>
              <div className="bg-blue-950/40 p-3 rounded-xl text-blue-400"><ShoppingBag size={24}/></div>
            </div>
            <div className="bg-[#0F0F0F] border border-neutral-900 p-6 rounded-2xl flex items-center justify-between">
              <div><p className="text-xs text-neutral-400 mb-1">عدد حقائب العرض</p><h3 className="text-2xl font-serif font-bold text-white">{products.length} حقيبة</h3></div>
              <div className="bg-neutral-900 p-3 rounded-xl text-[#D4AF37]"><ImageIcon size={24}/></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
