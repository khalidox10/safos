import React, { useState, useEffect } from 'react';
// استيراد عميل سوبابيس الموحد من مشروعك لتفادي مشاكل التهيئة
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Truck, 
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
  Image as ImageIcon
} from 'lucide-react';

// قاموس الترجمات لتطبيق ميزة اللغات التلقائية واليدوية في صفحة الزبون الافتراضية
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

export default function AdminDashboard() {
  // حالات التنقل والواجهة
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings'>('dashboard');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'identity' | 'hero' | 'about' | 'pillars' | 'testimonials' | 'policies'>('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // لغة لوحة التحكم الحالية (العربية/الفرنسية) للمعاينة
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');

  // حالة رصد أخطاء الربط بسوبابيس لتجنب الصفحة البيضاء
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // البيانات من قاعدة البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
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

  // حالات البحث والتصفية
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // نوافذ التحكم المنبثقة
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // نموذج إضافة منتج جديد
  const [newProduct, setNewProduct] = useState<any>({
    name: '',
    name_en: '',
    price: 0,
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

  // الكشف التلقائي عن اللغة من الهاتف/المتصفح مع إمكانية التغيير يدوياً
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
          window.location.href = '/admin/login';
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

  // جلب كافة تفاصيل الموقع والبراند
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

  // 📥 تفعيل ميزة الرفع الفعلي للصور من جهازك لـ Supabase Storage
  const handleUploadToStorage = async (file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('safos-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('safos-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      showToast(`فشل رفع الصورة: ${err.message}`, 'error');
      throw err;
    }
  };

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

  // 💬 ميزة مشاركة تفاصيل الطلب السريع على الواتساب بنقرة واحدة
  const handleShareOnWhatsApp = (order: any) => {
    if (!order) return;
    const cleanPhone = order.customer_phone.replace(/\s+/g, '');
    const itemsList = order.items && Array.isArray(order.items)
      ? order.items.map((i: any) => `- ${i.productName || i.product_name} (Qty: ${i.qty || i.quantity})`).join('%0A')
      : '';
    
    const message = `السلام عليكم لالة/سيدي *${order.customer_name}*،%0A%0Aشرفتنا باختيارك لعلامة *SAFOS* للحقائب الكانفاس المطرزة الفاخرة. 🎒✨%0A%0Aنؤكد لكم طلبيتكم بنجاح.%0A*المنتجات المطلوبة:*%0A${itemsList}%0A*المجموع الإجمالي:* ${order.total} درهم.%0A%0Aسيتم إرسال طلبيتكم مع الموزع قريباً. هل العنوان بالمدينة *${order.customer_city}* صحيح ومؤكد؟ %0A%0Aشكراً جزيلاً لثقتكم.`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank');
  };

  // التحكم بالطلبات
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

  // إضافة منتج جديد بالكامل
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
        name: '', name_en: '', price: 0, stock: 5, image_url: '', category: 'classic',
        color: '', tag: '', description: '', materials_dimensions: '', care_guide: '', additional_images: [], video_url: ''
      });
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // تعديل وحفظ منتج بالكامل
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

  // حفظ تفاصيل المتجر بالكامل ومزامنتها مع الخادم في جدول store_settings
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
                    <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
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
                          <span>تعديل</span>
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
                  {[
                    { id: 'identity', label: 'الشعار والهوية', icon: Globe },
                    { id: 'hero', label: 'البانر الترحيبي والفرعي', icon: ImageIcon },
                    { id: 'about', label: 'قصة الماركة (من نحن)', icon: Clock },
                    { id: 'pillars', label: 'ركائز الفخامة (لماذا نحن)', icon: AlertCircle },
                    { id: 'testimonials', label: 'آراء العميلات والتقييمات', icon: CheckCircle },
                    { id: 'policies', label: 'السياسات وتذييل الصفحة', icon: SettingsIcon },
                  ].map((sec) => {
                    const Icon = sec.icon;
                    const isSecActive = activeSettingsSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSettingsSection(sec.id as any)}
                        className={`w-full flex items-center space-x-3 space-x-reverse p-3.5 rounded-xl text-xs transition-all ${
                          isSecActive ? 'bg-zinc-900 text-amber-500 font-semibold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/50'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 lg:p-8 shadow-2xl">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    
                    {activeSettingsSection === 'identity' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light text-zinc-100">هوية المتجر الفاخرة والألوان</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل الاسم والوصوف الرئيسية للماركة والألوان</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">اسم المتجر الأساسي</label>
                            <input type="text" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">سلوجن / العنوان الفرعي للماركة</label>
                            <input type="text" value={settings.site_subtitle} onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">الحرف الرمزي للشعار</label>
                            <input type="text" maxLength={1} value={settings.logo_letter} onChange={(e) => setSettings({ ...settings, logo_letter: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-center font-bold" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-xs text-zinc-400 block mb-1.5">شعار المتجر (الشعار الحالي: {settings.logo_url ? 'مرفوع' : 'لا يوجد'})</label>
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2.5 px-4 rounded-xl text-xs border border-zinc-800 transition-all flex items-center space-x-2 space-x-reverse">
                                <Upload size={14} />
                                <span>رفع شعار من جهازك</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await handleUploadToStorage(file, 'logo');
                                      setSettings({ ...settings, logo_url: url });
                                      showToast('تم رفع الشعار بنجاح، احفظ التغييرات لحفظها نهائياً', 'success');
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">اللون الأساسي (Primary)</label>
                            <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">اللون الثانوي / الذهبي</label>
                            <input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'hero' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light text-zinc-100">الشاشة الترحيبية (Hero Banner)</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل البانر الترويجي لمتجر SAFOS والرفع من جهازك</p>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">العنوان الرئيسي العريض</label>
                          <textarea value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="w-full h-20 bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">صورة البانر الرئيسي</label>
                            <label className="cursor-pointer w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-3 rounded-xl text-xs border border-zinc-800 flex items-center justify-center space-x-2 space-x-reverse">
                              <Upload size={14} />
                              <span>رفع صورة البانر من جهازك</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleUploadToStorage(file, 'hero');
                                    setSettings({ ...settings, hero_image_url: url });
                                    showToast('تم رفع صورة البانر بنجاح', 'success');
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">شريط الإعلانات المتحرك فالموقع</label>
                            <input type="text" value={settings.announcement_text} onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-amber-500 font-medium" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">الوصف التفصيلي (Hero Description)</label>
                          <textarea value={settings.hero_description} onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })} className="w-full h-20 bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'about' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light text-zinc-100">قصة الماركة (Brand Story)</h4>
                          <p className="text-xs text-zinc-500 mt-1">قصة الحرفة اليدوية لكتان الكانفاس بورشة SAFOS</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">عنوان قصة ورشتنا الفنية</label>
                            <input type="text" value={settings.about_title} onChange={(e) => setSettings({ ...settings, about_title: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">صورة ورشة التطريز اليدوي</label>
                            <label className="cursor-pointer w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-3 rounded-xl text-xs border border-zinc-800 flex items-center justify-center space-x-2 space-x-reverse">
                              <Upload size={14} />
                              <span>رفع صورة الورشة من جهازك</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleUploadToStorage(file, 'about');
                                    setSettings({ ...settings, about_image: url });
                                    showToast('تم رفع صورة قصة الماركة بنجاح', 'success');
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">قصة ورشتنا الفنية بالتفصيل</label>
                          <textarea value={settings.about_text} onChange={(e) => setSettings({ ...settings, about_text: e.target.value })} className="w-full h-32 bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === 'pillars' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light text-zinc-100">ركائز ومميزات الفخامة الثلاث</h4>
                          <p className="text-xs text-zinc-500 mt-1">تخصيص العناوين والوصف للمميزات الثلاثة لـ الكانفاس المتقن</p>
                        </div>
                        {[1, 2, 3].map((num) => (
                          <div key={num} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-900 pb-4">
                            <div className="md:col-span-1">
                              <label className="text-xs text-zinc-400 block mb-1.5">عنوان الركيزة {num}</label>
                              <input type="text" value={settings[`p${num}_title`]} onChange={(e) => setSettings({ ...settings, [`p${num}_title`]: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs text-zinc-400 block mb-1.5">وصف الركيزة {num}</label>
                              <input type="text" value={settings[`p${num}_desc`]} onChange={(e) => setSettings({ ...settings, [`p${num}_desc`]: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSettingsSection === 'testimonials' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light text-zinc-100">آراء وتقييمات العميلات الحقيقية</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل مراجعات عينات الزبناء الوفيات للمتجر لجلب المصداقية</p>
                        </div>
                        {[1, 2].map((num) => (
                          <div key={num} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-900 pb-4">
                            <div className="md:col-span-1">
                              <label className="text-xs text-zinc-400 block mb-1.5">اسم العميل {num}</label>
                              <input type="text" value={settings[`t${num}_name`]} onChange={(e) => setSettings({ ...settings, [`t${num}_name`]: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs text-zinc-400 block mb-1.5">مراجعة العميل {num}</label>
                              <input type="text" value={settings[`t${num}_text`]} onChange={(e) => setSettings({ ...settings, [`t${num}_text`]: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                            </div>
                            <div className="md:col-span-1">
                              <label className="text-xs text-zinc-400 block mb-1.5">التقييم (النجوم)</label>
                              <select value={settings[`t${num}_rating`]} onChange={(e) => setSettings({ ...settings, [`t${num}_rating`]: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm">
                                <option value="5">5 نجوم</option>
                                <option value="4">4 نجوم</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSettingsSection === 'policies' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light text-zinc-100">السياسات وتذييل الصفحة</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل سياسات الشحن وسياسة الاسترجاع وحقوق الملكية للمتجر</p>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">سياسة الشحن والتوصيل المجاني للمدن المغربية</label>
                          <textarea value={settings.shipping_policy} onChange={(e) => setSettings({ ...settings, shipping_policy: e.target.value })} className="w-full h-24 bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">سياسة الاستبدال والاسترجاع (7 أيام)</label>
                          <textarea value={settings.refund_policy} onChange={(e) => setSettings({ ...settings, refund_policy: e.target.value })} className="w-full h-24 bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">حقوق الملكية وتذييل الصفحة (Copyright)</label>
                          <input type="text" value={settings.copyright_text} onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })} className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm" />
                        </div>
                      </div>
                    )}

                    <div className="border-t border-zinc-900 pt-6 mt-6 flex justify-end">
                      <button type="submit" disabled={actionLoading === 'settings'} className="bg-[#D4AF37] hover:bg-amber-500 text-black font-semibold py-3 px-8 rounded-xl flex items-center space-x-2 space-x-reverse transition-all">
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
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">إضافة حقيبة كانفاس جديدة للتشكيلة</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اسم الحقيبة بالعربية</label>
                  <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm" placeholder="مثال: حقيبة صفاء الكانفاس" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الاسم بالإنجليزي (EN)</label>
                  <input type="text" required value={newProduct.name_en} onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono" placeholder="Safaa Canvas Bag" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر الموحد (درهم) - سعر فاخر موحد</label>
                  <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">المخزون المتوفر</label>
                  <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الصنف (Category)</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-300">
                    <option value="classic">Classic Tote</option>
                    <option value="mini">Mini Tote</option>
                    <option value="travel">Travel Canvas</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الألوان المتوفرة</label>
                  <input type="text" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" placeholder="بيج × أسود" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التاغ الترويجي</label>
                  <input type="text" value={newProduct.tag} onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" placeholder="جديد، الأكثر مبيعاً" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رفع الصورة الرئيسية من جهازك</label>
                  <label className="cursor-pointer w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadToStorage(file, 'products');
                          setNewProduct({ ...newProduct, image_url: url });
                          showToast('تم رفع الصورة بنجاح', 'success');
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">روابط الصور الإضافية للمعرض (مصفوفة روابط)</label>
                  <label className="cursor-pointer w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل صورة إضافية من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadToStorage(file, 'products_gallery');
                          setNewProduct((prev: any) => ({
                            ...prev,
                            additional_images: [...prev.additional_images, url]
                          }));
                          showToast('تمت إضافة صورة إضافية للمعرض', 'success');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">رابط الفيديو الترويجي (يوتيوب أو فيديو مباشر)</label>
                <input type="text" value={newProduct.video_url} onChange={(e) => setNewProduct({ ...newProduct, video_url: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs font-mono" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">وصف الحقيبة وخصائص ثوب الكانفاس</label>
                <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full h-16 bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">مقاسات الحقيبة الدقيقة (مثال: Medium: 36cm x 27.5cm)</label>
                <input type="text" value={newProduct.materials_dimensions} onChange={(e) => setNewProduct({ ...newProduct, materials_dimensions: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">دليل تنظيف والعناية بالحقيبة</label>
                <textarea value={newProduct.care_guide} onChange={(e) => setNewProduct({ ...newProduct, care_guide: e.target.value })} className="w-full h-16 bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
              </div>
              <div className="border-t border-zinc-900 pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="bg-zinc-900 text-zinc-300 py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === 'add-product'} className="bg-[#D4AF37] text-black py-2.5 px-6 rounded-xl text-xs font-bold">إضافة التشكيلة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ ب. نافذة تعديل تفاصيل المنتج بالكامل (Edit Product Modal) ------------------ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">تعديل مواصفات الحقيبة</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اسم الحقيبة بالعربية</label>
                  <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الاسم بالإنجليزي (EN)</label>
                  <input type="text" value={editingProduct.name_en} onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر الموحد (درهم)</label>
                  <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">المخزون المتوفر</label>
                  <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الصنف</label>
                  <select value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-300">
                    <option value="classic">Classic Tote</option>
                    <option value="mini">Mini Tote</option>
                    <option value="travel">Travel Canvas</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الألوان</label>
                  <input type="text" value={editingProduct.color || ''} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التاغ</label>
                  <input type="text" value={editingProduct.tag || ''} onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رفع صورة رئيسية جديدة</label>
                  <label className="cursor-pointer w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadToStorage(file, 'products');
                          setEditingProduct({ ...editingProduct, image_url: url });
                          showToast('تم تغيير الصورة الرئيسية', 'success');
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رفع صور إضافية للمعرض</label>
                  <label className="cursor-pointer w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl text-xs border border-zinc-850 flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل صورة إضافية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadToStorage(file, 'products_gallery');
                          setEditingProduct((prev: any) => ({
                            ...prev,
                            additional_images: [...(prev.additional_images || []), url]
                          }));
                          showToast('تمت إضافة صورة للمعرض', 'success');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">رابط الفيديو الترويجي</label>
                <input type="text" value={editingProduct.video_url || ''} onChange={(e) => setEditingProduct({ ...editingProduct, video_url: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs font-mono" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">الوصف التفصيلي لثوب الكانفاس</label>
                <textarea value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full h-16 bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">أبعاد الحقيبة الدقيقة (Dimensions)</label>
                <input type="text" value={editingProduct.materials_dimensions || ''} onChange={(e) => setEditingProduct({ ...editingProduct, materials_dimensions: e.target.value })} className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">طرق تنظيف الكانفاس والتطريز</label>
                <textarea value={editingProduct.care_guide || ''} onChange={(e) => setEditingProduct({ ...editingProduct, care_guide: e.target.value })} className="w-full h-16 bg-black border border-zinc-900 p-2.5 rounded-xl text-xs" />
              </div>
              <div className="border-t border-zinc-900 pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setEditingProduct(null)} className="bg-zinc-900 text-zinc-300 py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === `save-prod-${editingProduct.id}`} className="bg-[#D4AF37] text-black py-2.5 px-6 rounded-xl text-xs font-bold">حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ ج. نافذة تفاصيل ومعالجة الطلبات المنبثقة والجاهزة للطباعة ------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:absolute print:inset-0 print:bg-white print:p-0">
          <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl print:border-0 print:bg-white print:text-black print:shadow-none">
            
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
                <h1 className="text-3xl font-bold tracking-[0.2em] text-black">{settings.site_name}</h1>
                <p className="text-xs uppercase tracking-widest text-gray-500">{settings.site_subtitle}</p>
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
                <button onClick={() => handleShareOnWhatsApp(selectedOrder)} className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Send size={14} />
                  <span>تأكيد وشحن عبر واتساب</span>
                </button>
                <button onClick={handlePrintInvoice} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 space-x-reverse border border-zinc-800">
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
