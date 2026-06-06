import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// استيراد الدوال وعميل سوبابيس المعتمدين في بنية مشروعك بالضبط
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
  Lock
} from 'lucide-react';

// قاموس الترجمات للغات التلقائية واليدوية لصفحة الزبون
const translations = {
  ar: {
    thankYou: "تم تسجيل طلبكِ بنجاح، سنتواصل معكِ قريباً لتأكيد طلبيتك",
    subtotal: "المجموع الفرعي",
    total: "المجموع الإجمالي",
    shipping: "الشحن والتوصيل",
    free: "مجاني",
    orderNow: "تأكيد الطلب السريع",
    addToCart: "إضافة إلى السلة",
    careGuide: "دليل العناية بالحقيبة",
    dimensions: "مقاسات الحقيبة الدقيقة",
    description: "الوصف والتفاصيل",
    color: "الألوان المتوفرة"
  },
  fr: {
    thankYou: "Votre commande a été enregistrée avec succès, nous vous contacterons bientôt pour confirmer votre commande.",
    subtotal: "Sous-total",
    total: "Total global",
    shipping: "Livraison",
    free: "Gratuite",
    orderNow: "Confirmer la commande",
    addToCart: "Ajouter au panier",
    careGuide: "Guide d'entretien",
    dimensions: "Dimensions de l'article",
    description: "Description & Détails",
    color: "Couleurs disponibles"
  }
};

interface Product {
  id: string;
  name: string;
  name_en: string;
  price: number;
  old_price: number | null; // سنحافظ عليه برمجياً كـ null للحفاظ على السعر الفردي الفاخر
  image_url: string;
  color: string;
  tag: string | null;
  category: string;
  stock: number;
  description?: string;
  materials_dimensions?: string;
  care_guide?: string;
  additional_images?: string[];
  video_url?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings'>('dashboard');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'identity' | 'hero' | 'about' | 'pillars' | 'testimonials' | 'policies'>('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // لغة واجهة العميل الافتراضية
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');

  // حالة رصد أخطاء الربط بسوبابيس
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // البيانات من قاعدة البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>({
    site_name: 'SAFOS',
    site_subtitle: 'Embroidered Atelier',
    logo_letter: 'S',
    logo_url: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image_url: '',
    announcement_text: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    primary_color: '#000000',
    secondary_color: '#D4AF37',
    accent_color: '#A37A3E',
    currency: 'MAD',
    currency_symbol: 'د.م',
    about_title: '',
    about_text: '',
    about_image: '',
    p1_title: '', p1_desc: '',
    p2_title: '', p2_desc: '',
    p3_title: '', p3_desc: '',
    t1_name: '', t1_text: '', t1_rating: '5',
    t2_name: '', t2_text: '', t2_rating: '5',
    shipping_policy: '',
    refund_policy: '',
    copyright_text: ''
  });

  // حالات البحث والتصفية للطلبيات
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // النوافذ المنبثقة
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // نموذج إضافة منتج جديد متوافق مع الكانفاس وبدون سعر قديم
  const [newProduct, setNewProduct] = useState<any>({
    name: '',
    name_en: '',
    price: 0,
    old_price: null, // دائماً فارغ للحفاظ على السعر الفردي الفاخر
    stock: 5,
    image_url: '',
    category: 'classic',
    color: '',
    tag: '',
    description: '',
    materials_dimensions: '',
    care_guide: '',
    additional_images: [],
    video_url: ''
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // الكشف التلقائي عن لغة المتصفح أو الهاتف يدوياً وآلياً
  useEffect(() => {
    const savedLang = localStorage.getItem('safos-lang');
    if (savedLang === 'ar' || savedLang === 'fr') {
      setLang(savedLang as any);
    } else {
      const userLang = navigator.language || (navigator as any).userLanguage || '';
      if (userLang.startsWith('ar')) {
        setLang('ar');
      } else {
        setLang('fr');
      }
    }
  }, []);

  const handleLangChange = (newLang: 'ar' | 'fr') => {
    setLang(newLang);
    localStorage.setItem('safos-lang', newLang);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          throw new Error("لم يتم العثور على عميل سوبابيس الموحد. يرجى التحقق من ملف src/lib/supabase.ts");
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

  // جلب البيانات من الخادم
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

        setSettings({
          site_name: brand.name || 'SAFOS',
          site_subtitle: brand.subtitle || 'Embroidered Atelier',
          logo_letter: brand.logo_letter || 'S',
          logo_url: brand.logo_url || '',
          hero_title: hero.title || '',
          hero_subtitle: hero.subtitle || '',
          hero_description: hero.description || '',
          hero_image_url: hero.image || '',
          announcement_text: hero.announcement_text || '',
          phone: contact.phone || '',
          whatsapp: contact.whatsapp || '',
          email: contact.email || '',
          address: contact.address || '',
          instagram: contact.instagram || '',
          facebook: contact.facebook || '',
          tiktok: contact.tiktok || '',
          primary_color: colors.primary || '#000000',
          secondary_color: colors.secondary || '#D4AF37',
          accent_color: colors.accent || '#A37A3E',
          currency: contact.currency || 'MAD',
          currency_symbol: contact.currency_symbol || 'د.م',
          about_title: about.title || '',
          about_text: about.text || '',
          about_image: about.image || '',
          p1_title: pillars.p1_title || '', p1_desc: pillars.p1_desc || '',
          p2_title: pillars.p2_title || '', p2_desc: pillars.p2_desc || '',
          p3_title: pillars.p3_title || '', p3_desc: pillars.p3_desc || '',
          t1_name: testimonials.t1_name || '', t1_text: testimonials.t1_text || '', t1_rating: testimonials.t1_rating || '5',
          t2_name: testimonials.t2_name || '', t2_text: testimonials.t2_text || '', t2_rating: testimonials.t2_rating || '5',
          shipping_policy: policies.shipping || '',
          refund_policy: policies.refund || '',
          copyright_text: policies.copyright || ''
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

  // 📥 دالة رفع الصور المعتمدة فالمشروع لرفع جميع ملفات وأقسام الموقع من جهازك مباشرة
  async function handleImageUpload(file: File, bucketName: string): Promise<string> {
    const fileName = `safos-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { url, error } = await uploadFile(bucketName, file, fileName);
    if (error || !url) {
      throw new Error(error || 'فشل رفع الصورة');
    }
    return url;
  }

  // 📥 ميزة تحميل صور الحقائب مباشرة على الكمبيوتر أو الهاتف
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

  // 💬 ميزة مشاركة تفاصيل الطلب هاتفياً عبر واتساب لتأكيد الـ COD
  const handleShareOnWhatsApp = (order: any) => {
    if (!order) return;
    const cleanPhone = order.customer_phone.replace(/\s+/g, '');
    const itemsList = order.items && Array.isArray(order.items)
      ? order.items.map((i: any) => `- ${i.productName || i.product_name} (Qty: ${i.qty || i.quantity})`).join('%0A')
      : '';
    
    const message = `السلام عليكم لالة/سيدي *${order.customer_name}*،%0A%0Aشرفتنا باختيارك لعلامة *SAFOS* للحقائب الكانفاس المطرزة الفاخرة. 🎒✨%0A%0Aنؤكد لكم طلبيتكم بنجاح.%0A*المنتجات المطلوبة:*%0A${itemsList}%0A*المجموع الإجمالي:* ${order.total} درهم.%0A%0Aسيتم إرسال طلبيتكم مع الموزع قريباً. هل العنوان بالمدينة *${order.customer_city}* صحيح ومؤكد؟ %0A%0Aشكراً جزيلاً لثقتكم.`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank');
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟')) return;
    setActionLoading(`delete-order-${orderId}`);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast('تم حذف الطلب بنجاح', 'success');
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
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);
      if (error) throw error;
      showToast('تمت إضافة منتج الكانفاس الفاخر بنجاح', 'success');
      setIsAddingProduct(false);
      setNewProduct({
        name: '', name_en: '', price: 0, old_price: null, stock: 5, image_url: '', category: 'classic',
        color: '', tag: '', description: '', materials_dimensions: '', care_guide: '', additional_images: [], video_url: ''
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
      const { error } = await supabase
        .from('products')
        .update(editingProduct)
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
        .delete()
        .eq('id', productId);
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
          value: { name: settings.site_name, subtitle: settings.site_subtitle, logo_letter: settings.logo_letter, logo_url: settings.logo_url }
        },
        {
          key: 'colors',
          value: { primary: settings.primary_color, secondary: settings.secondary_color, accent: settings.accent_color }
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
          value: { title: settings.hero_title, subtitle: settings.hero_subtitle, description: settings.hero_description, image: settings.hero_image_url, announcement_text: settings.announcement_text }
        },
        {
          key: 'about',
          value: { title: settings.about_title, text: settings.about_text, image: settings.about_image }
        },
        {
          key: 'pillars',
          value: {
            p1_title: settings.p1_title, p1_desc: settings.p1_desc,
            p2_title: settings.p2_title, p2_desc: settings.p2_desc,
            p3_title: settings.p3_title, p3_desc: settings.p3_desc
          }
        },
        {
          key: 'testimonials',
          value: {
            t1_name: settings.t1_name, t1_text: settings.t1_text, t1_rating: settings.t1_rating,
            t2_name: settings.t2_name, t2_text: settings.t2_text, t2_rating: settings.t2_rating
          }
        },
        {
          key: 'policies',
          value: { shipping: settings.shipping_policy, refund: settings.refund_policy, copyright: settings.copyright_text }
        }
      ];

      for (const item of updates) {
        const { error } = await supabase
          .from('store_settings')
          .upsert(item, { onConflict: 'key' });
        if (error) throw error;
      }

      showToast('تمت مزامنة وحفظ جميع إعدادات الهوية الفاخرة بنجاح', 'success');
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

  const settingsSections: { id: 'identity' | 'hero' | 'about' | 'pillars' | 'testimonials' | 'policies'; label: string; icon: any }[] = [
    { id: 'identity', label: 'الشعار والهوية', icon: Globe },
    { id: 'hero', label: 'البانر الترحيبي والفرعي', icon: ImageIcon },
    { id: 'about', label: 'قصة الماركة (من نحن)', icon: Clock },
    { id: 'pillars', label: 'ركائز الفخامة (لماذا نحن)', icon: AlertCircle },
    { id: 'testimonials', label: 'آراء العميلات والتقييمات', icon: CheckCircle },
    { id: 'policies', label: 'السياسات وتذييل الصفحة', icon: SettingsIcon },
  ];

  if (connectionError) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex items-center justify-center p-6">
        <div className="bg-zinc-950 border border-red-500/20 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-light text-zinc-100">فشل الاتصال بـ Supabase</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{connectionError}</p>
          <div className="pt-4 border-t border-zinc-900">
            <button onClick={() => window.location.reload()} className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 py-2.5 rounded-xl text-xs font-semibold transition-all">إعادة محاولة الاتصال</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex font-sans antialiased selection:bg-amber-500/30 print:bg-white print:text-black">
      
      {/* القائمة الجانبية الفاخرة */}
      <aside className="print:hidden fixed inset-y-0 right-0 z-30 w-64 bg-black border-l border-zinc-900 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:translate-x-0">
        <div>
          <div className="p-8 border-b border-zinc-900 text-center">
            <h1 className="text-2xl font-bold tracking-[0.3em] text-[#D4AF37]">{settings.site_name}</h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{settings.site_subtitle}</p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'الإحصائيات العامة', icon: LayoutDashboard },
              { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
              { id: 'products', label: 'مخزون المنتجات', icon: TrendingUp, badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined },
              { id: 'settings', label: 'تخصيص الموقع بالكامل', icon: SettingsIcon },
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
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 text-sm ${
                    isActive ? 'bg-gradient-to-l from-amber-500/10 to-amber-500/0 text-[#D4AF37] border-r-2 border-[#D4AF37] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.03)]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon size={18} className={isActive ? 'text-[#D4AF37]' : 'text-zinc-400'} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-300'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-900 space-y-3">
          {/* محدد اللغات اليدوي للمعاينة السريعة في الهيدر */}
          <div className="flex items-center justify-center space-x-2 space-x-reverse bg-zinc-950 p-2 rounded-xl border border-zinc-900">
            <button onClick={() => handleLangChange('ar')} className={`flex-1 py-1 px-3 text-xs rounded-lg transition-all ${lang === 'ar' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400'}`}>العربية</button>
            <button onClick={() => handleLangChange('fr')} className={`flex-1 py-1 px-3 text-xs rounded-lg transition-all ${lang === 'fr' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400'}`}>FR / EN</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all duration-200 text-sm">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto print:p-0">
        <div className="print:hidden flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div>
            <h2 className="text-2xl font-light text-zinc-100">
              {activeTab === 'dashboard' && 'الإحصائيات العامة'}
              {activeTab === 'orders' && 'سجل المبيعات والطلبات'}
              {activeTab === 'products' && 'إدارة المنتجات وتعديل الخصائص'}
              {activeTab === 'settings' && 'تخصيص كامل لأقسام المتجر'}
            </h2>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-amber-500 rounded-xl">
            <RefreshCw size={18} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-950 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* 1. الإحصائيات العامة */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                    <span className="text-xs text-zinc-500">إجمالي الأرباح المدفوعة</span>
                    <div className="mt-4 text-3xl font-light">{totalRevenue.toLocaleString()} <span className="text-xs text-amber-500">درهم</span></div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                    <span className="text-xs text-zinc-500">الطلبات المعلقة</span>
                    <div className="mt-4 text-3xl font-light text-amber-500">{pendingOrdersCount}</div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                    <span className="text-xs text-red-400">نقص المخزون (&lt;3)</span>
                    <div className="mt-4 text-3xl font-light text-red-400">{lowStockProducts.length}</div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                    <span className="text-xs text-zinc-500">مجموع التشكيلة</span>
                    <div className="mt-4 text-3xl font-light">{products.length}</div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                  <h3 className="text-lg font-light text-zinc-200">تحليل الأداء المالي</h3>
                  <div className="h-48 w-full relative mt-8 flex items-end justify-between border-b border-zinc-800">
                    <div className="w-12 bg-zinc-900 h-24 rounded-t-lg mx-auto" />
                    <div className="w-12 bg-zinc-900 h-36 rounded-t-lg mx-auto" />
                    <div className="w-12 bg-gradient-to-t from-amber-500/5 to-amber-500/20 border border-amber-500/30 h-44 rounded-t-lg mx-auto" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. سجل المبيعات والطلبات */}
            {activeTab === 'orders' && (
              <div className="space-y-6 print:hidden">
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <input
                    type="text"
                    placeholder="البحث بالاسم، الهاتف، أو رقم الطلب..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full md:w-96 p-2.5 bg-black border border-zinc-900 rounded-xl text-zinc-200"
                  />
                  <div className="flex gap-3">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-black border border-zinc-900 text-zinc-300 py-2 px-3 rounded-xl text-xs">
                      <option value="all">كل حالات الشحن</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#0D0D0D] text-zinc-500 text-[10px] uppercase border-b border-zinc-900">
                      <tr>
                        <th className="py-4 px-6">رقم الطلب</th>
                        <th className="py-4 px-6">العميل</th>
                        <th className="py-4 px-6 text-left">قيمة الطلب</th>
                        <th className="py-4 px-6 text-center">حالة الشحن</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-900/30">
                          <td className="py-4 px-6 font-mono text-xs text-amber-500">{order.order_number}</td>
                          <td className="py-4 px-6 font-medium text-zinc-100">{order.customer_name}</td>
                          <td className="py-4 px-6 text-left">{order.total} درهم</td>
                          <td className="py-4 px-6 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs py-1 px-2.5 rounded bg-black border border-zinc-800"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">مؤكد</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التوصيل</option>
                              <option value="cancelled">ملغى</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-center flex items-center justify-center space-x-2 space-x-reverse">
                            <button onClick={() => setSelectedOrder(order)} className="p-1.5 bg-zinc-900 text-zinc-300 rounded-lg"><Eye size={14} /></button>
                            <button onClick={() => handleShareOnWhatsApp(order)} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg" title="مشاركة على واتساب لتأكيد الـ COD"><Send size={14} /></button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 bg-red-500/5 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. إدارة السلع والمنتجات بالكامل */}
            {activeTab === 'products' && (
              <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-light text-zinc-300">حقائب الكانفاس</h3>
                  <button onClick={() => setIsAddingProduct(true)} className="bg-[#D4AF37] hover:bg-amber-500 text-black text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 space-x-reverse">
                    <Plus size={16} />
                    <span>إضافة حقيبة كانفاس جديدة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-850 transition-all">
                      <div>
                        <div className="w-full h-48 bg-zinc-900 rounded-xl overflow-hidden mb-4 relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-light">لا توجد صورة</div>
                          )}
                          {product.image_url && (
                            <button
                              onClick={() => handleDownloadImage(product.image_url, product.name)}
                              className="absolute bottom-3 right-3 bg-black/70 hover:bg-amber-500 hover:text-black text-white p-2.5 rounded-full shadow-lg"
                              title="تحميل الصورة على جهازك"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                        <h4 className="text-base font-light text-zinc-100">{product.name}</h4>
                        <p className="text-xs text-[#D4AF37] font-mono mt-1">{product.price} درهم</p>
                      </div>

                      <div className="border-t border-zinc-900 pt-4 mt-4 flex gap-2">
                        <button onClick={() => setEditingProduct(product)} className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 space-x-reverse">
                          <Edit3 size={14} />
                          <span>تعديل التفاصيل</span>
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-xl"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. تخصيص كامل لأقسام المتجر */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-3 mb-4">أقسام واجهة المتجر</h3>
                  {settingsSections.map((sec) => {
                    const Icon = sec.icon;
                    const isSecActive = activeSettingsSection === sec.id;
                    return (
