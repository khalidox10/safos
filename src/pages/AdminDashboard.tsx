import React, { useState, useEffect } from 'react';
// استيراد عميل سوبابيس الموحد من مشروعك
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
  Image as ImageIcon,
  Palette,
  Globe,
  Plus,
  Compass
} from 'lucide-react';

export default function AdminDashboard() {
  // حالات التنقل والواجهة
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings'>('dashboard');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'identity' | 'hero' | 'contact' | 'style'>('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // حالة رصد أخطاء الربط
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // البيانات من قاعدة البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // شحن نموذج التحكم الشامل (Brand Settings State)
  const [settings, setSettings] = useState<any>({
    // الهوية والشعار
    site_name: 'SAFOS',
    site_subtitle: 'Embroidered Atelier',
    logo_letter: 'S',
    logo_url: '',
    
    // البانر والشاشات الرئيسية
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image_url: '',
    announcement_text: '',
    
    // بيانات التواصل
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    
    // شبكات التواصل الاجتماعي
    instagram: '',
    facebook: '',
    tiktok: '',
    
    // الألوان والثيمات
    primary_color: '#1a1410',
    secondary_color: '#b8935a',
    accent_color: '#d4b483',
    currency: 'MAD',
    currency_symbol: 'د.م'
  });

  // حالات البحث والتصفية للطلبات
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // النافذة المنبثقة للطلب والمنتج
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // نموذج إضافة منتج جديد
  const [newProduct, setNewProduct] = useState({
    name: '',
    name_en: '',
    price: 0,
    old_price: 0,
    image_url: '',
    color: '',
    tag: '',
    category: 'chevron',
    stock: 5
  });

  // الإشعارات
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
        setConnectionError(err.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات.');
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
      // 1. جلب الطلبات
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // 2. جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // 3. جلب الإعدادات وفك تركيب الـ JSONB المتطابق مع قاعدة البيانات الجديدة
      const { data: settingsData, error: settingsError } = await supabase
        .from('store_settings')
        .select('*');
      if (settingsError) throw settingsError;

      if (settingsData) {
        const brand = settingsData.find(s => s.key === 'brand')?.value || {};
        const colors = settingsData.find(s => s.key === 'colors')?.value || {};
        const contact = settingsData.find(s => s.key === 'contact')?.value || {};
        const hero = settingsData.find(s => s.key === 'hero')?.value || {};

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
          
          primary_color: colors.primary || '#1a1410',
          secondary_color: colors.secondary || '#b8935a',
          accent_color: colors.accent || '#d4b483',
          currency: contact.currency || 'MAD',
          currency_symbol: contact.currency_symbol || 'د.م'
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
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
      showToast('تمت إضافة المنتج الفاخر بنجاح', 'success');
      setIsAddingProduct(false);
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
      showToast('تم حفظ تعديلات المنتج الفاخر', 'success');
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('هل تريد حذف هذا المنتج الفاخر نهائياً من العرض؟')) return;
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
          value: {
            name: settings.site_name,
            subtitle: settings.site_subtitle,
            logo_letter: settings.logo_letter,
            logo_url: settings.logo_url
          }
        },
        {
          key: 'colors',
          value: {
            primary: settings.primary_color,
            secondary: settings.secondary_color,
            accent: settings.accent_color
          }
        },
        {
          key: 'contact',
          value: {
            phone: settings.phone,
            whatsapp: settings.whatsapp,
            email: settings.email,
            address: settings.address,
            instagram: settings.instagram,
            facebook: settings.facebook,
            tiktok: settings.tiktok,
            currency: settings.currency,
            currency_symbol: settings.currency_symbol
          }
        },
        {
          key: 'hero',
          value: {
            title: settings.hero_title,
            subtitle: settings.hero_subtitle,
            description: settings.hero_description,
            image: settings.hero_image_url,
            announcement_text: settings.announcement_text
          }
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex font-sans antialiased selection:bg-amber-500/30">
      
      {/* الإشعارات العائمة */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 space-x-reverse border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' ? 'bg-zinc-900/90 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900/90 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* زر الهامبرغر */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed top-4 right-4 z-40 bg-zinc-900/80 border border-zinc-800 p-2 rounded-lg text-amber-500 backdrop-blur-md">
        <Menu size={24} />
      </button>

      {/* القائمة الجانبية الفاخرة */}
      <aside className={`fixed inset-y-0 right-0 z-30 w-64 bg-black border-l border-zinc-900 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:static lg:translate-x-0'
      }`}>
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
              { id: 'settings', label: 'هوية المتجر الفاخرة', icon: SettingsIcon },
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
                    isActive ? 'bg-gradient-to-l from-amber-500/10 to-amber-500/0 text-[#D4AF37] border-r-2 border-[#D4AF37] font-semibold' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon size={18} className={isActive ? 'text-[#D4AF37]' : 'text-zinc-400'} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-900 space-y-3">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all duration-200 text-sm">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div>
            <h2 className="text-2xl font-light text-zinc-100">
              {activeTab === 'dashboard' && 'الإحصائيات العامة'}
              {activeTab === 'orders' && 'سجل المبيعات والطلبات'}
              {activeTab === 'products' && 'إدارة المنتجات وتعديل الخصائص'}
              {activeTab === 'settings' && 'مركز تحكم الهوية والتصميم'}
            </h2>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-amber-500 rounded-xl">
            <RefreshCw size={18} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
        </div>

        {/* ------------------ 1. تبويب لوحة التحكم والإحصائيات ------------------ */}
        {activeTab === 'dashboard' && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                <span className="text-xs font-medium uppercase text-zinc-500">إجمالي الأرباح المدفوعة</span>
                <div className="mt-4">
                  <span className="text-3xl font-light text-zinc-100">{totalRevenue.toLocaleString()}</span>
                  <span className="text-xs text-amber-500 mr-1">درهم</span>
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                <span className="text-xs font-medium text-zinc-500">الطلبات المعلقة</span>
                <div className="mt-4">
                  <span className="text-3xl font-light text-zinc-100">{pendingOrdersCount}</span>
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                <span className="text-xs font-medium text-red-400">نقص المخزون</span>
                <div className="mt-4">
                  <span className="text-3xl font-light text-red-400">{lowStockProducts.length}</span>
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                <span className="text-xs font-medium text-zinc-500">مجموع التشكيلة</span>
                <div className="mt-4">
                  <span className="text-3xl font-light text-zinc-100">{products.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
              <h3 className="text-lg font-light text-zinc-200">تحليل الأداء المالي</h3>
              <div className="h-48 w-full relative mt-8 flex items-end justify-between border-b border-zinc-800">
                <div className="w-12 bg-zinc-900 h-24 rounded-t-lg" />
                <div className="w-12 bg-zinc-900 h-36 rounded-t-lg" />
                <div className="w-12 bg-gradient-to-t from-amber-500/5 to-amber-500/20 border border-amber-500/30 h-44 rounded-t-lg" />
              </div>
            </div>
          </div>
        )}

        {/* ------------------ 2. تبويب إدارة الطلبات ------------------ */}
        {activeTab === 'orders' && !loading && (
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                placeholder="البحث بالاسم، رقم الطلب، أو الهاتف..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full md:w-96 pr-4 pl-4 py-2.5 bg-black border border-zinc-900 rounded-xl text-zinc-200"
              />
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-sm text-zinc-300">
                <thead className="bg-[#0D0D0D] text-zinc-500 text-[10px] border-b border-zinc-900">
                  <tr>
                    <th className="py-4 px-6">رقم الطلب</th>
                    <th className="py-4 px-6">العميل</th>
                    <th className="py-4 px-6">الهاتف والمدينة</th>
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
                      <td className="py-4 px-6">
                        <span className="block text-xs">{order.customer_phone}</span>
                        <span className="text-[10px] text-zinc-500 block">{order.customer_city}</span>
                      </td>
                      <td className="py-4 px-6 text-left">{Number(order.total).toLocaleString()} درهم</td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs py-1 px-2 rounded bg-black border text-zinc-300"
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">ملغى</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center space-x-2 space-x-reverse">
                          <button onClick={() => setSelectedOrder(order)} className="p-1.5 bg-zinc-900 text-zinc-300 rounded hover:bg-zinc-800">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------ 3. تبويب إدارة السلع والمنتجات بالكامل ------------------ */}
        {activeTab === 'products' && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-light text-zinc-300">حقائب التشكيلة</h3>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-[#D4AF37] hover:bg-amber-500 text-black text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 space-x-reverse"
              >
                <Plus size={16} />
                <span>إضافة حقيبة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
                  <div>
                    <div className="w-full h-48 bg-zinc-900 rounded-xl overflow-hidden mb-4 relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">لا توجد صورة</div>
                      )}
                      {product.tag && (
                        <span className="absolute top-2.5 right-2.5 bg-[#D4AF37] text-black text-[9px] font-bold py-1 px-2.5 rounded-full uppercase">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-base font-light text-zinc-100">{product.name}</h4>
                      <span className="text-xs bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded-full">{product.category}</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mb-4">{product.name_en}</p>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-[#D4AF37]">{product.price} درهم</span>
                      {product.old_price && <span className="text-zinc-500 line-through text-xs">{product.old_price} درهم</span>}
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-4 flex gap-2">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 space-x-reverse"
                    >
                      <Edit3 size={14} />
                      <span>تعديل التفاصيل</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------ 4. تبويب مركز تحكم الهوية الفاخر الشامل ------------------ */}
        {activeTab === 'settings' && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* القائمة الفرعية للتنقل في الإعدادات */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-3 mb-4">عناصر التحكم بالمتجر</h3>
              {[
                { id: 'identity', label: 'الشعار والهوية', icon: Globe },
                { id: 'hero', label: 'شاشة البانر والواجهة', icon: ImageIcon },
                { id: 'contact', label: 'العناوين وتواصل الاجتماعي', icon: Phone },
                { id: 'style', label: 'الألوان والعملة', icon: Palette },
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

            {/* حقول الإدخال والتحكم التفصيلية */}
            <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 lg:p-8 shadow-2xl">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. إعدادات الشعار والهوية */}
                {activeSettingsSection === 'identity' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h4 className="text-base font-light text-zinc-100">هوية المتجر الفاخرة</h4>
                      <p className="text-xs text-zinc-500 mt-1">تعديل الاسم والوصوف الرئيسية الحيوية للماركة</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">اسم المتجر الأساسي</label>
                        <input
                          type="text"
                          value={settings.site_name}
                          onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">سلوجن / العنوان الفرعي للماركة</label>
                        <input
                          type="text"
                          value={settings.site_subtitle}
                          onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="text-xs text-zinc-400 block mb-1.5">الحرف الرمزي للشعار</label>
                        <input
                          type="text"
                          maxLength={1}
                          value={settings.logo_letter}
                          onChange={(e) => setSettings({ ...settings, logo_letter: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 text-center font-bold"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-xs text-zinc-400 block mb-1.5">رابط صورة اللوجو (لوجو بصيغة PNG أو SVG)</label>
                        <input
                          type="text"
                          value={settings.logo_url}
                          onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                          placeholder="رابط مباشر لصورة الشعار..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. إعدادات شاشة البانر الرئيسي والواجهة */}
                {activeSettingsSection === 'hero' && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-light text-zinc-100">الشاشة الترحيبية للزوار (Hero Banner)</h4>
                      <p className="text-xs text-zinc-500 mt-1">تعديل البانر الترويجي الكبير في الصفحة الرئيسية لمتجر SAFOS</p>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">العنوان العريض (Slogan) - يدعم السطور المتعددة</label>
                      <textarea
                        value={settings.hero_title}
                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                        className="w-full h-24 bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        placeholder="استعمل \n للنزول لسطر جديد"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">العنوان الفرعي للبانر</label>
                        <input
                          type="text"
                          value={settings.hero_subtitle}
                          onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">رابط صورة الخلفية الفاخرة للبانر</label>
                        <input
                          type="text"
                          value={settings.hero_image_url}
                          onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">الوصف التفصيلي (Hero Description)</label>
                      <textarea
                        value={settings.hero_description}
                        onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                        className="w-full h-20 bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">شريط الإعلانات المتحرك فالموقع (Announcement Bar Text)</label>
                      <input
                        type="text"
                        value={settings.announcement_text}
                        onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                        className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 text-amber-500 font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* 3. إعدادات بيانات التواصل والشبكات */}
                {activeSettingsSection === 'contact' && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-light text-zinc-100">بيانات التواصل والشبكات</h4>
                      <p className="text-xs text-zinc-500 mt-1">تعديل أرقام وعناوين متجر SAFOS لتلقي الاتصالات</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">رقم الهاتف الفعلي للتواصل</label>
                        <input
                          type="text"
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">رابط الواتساب المباشر (أو الرقم مع رمز الدولة)</label>
                        <input
                          type="text"
                          value={settings.whatsapp}
                          onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">البريد الإلكتروني للعلامة</label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">عنوان مشغل المتجر الفعلي (المدينة/الحي)</label>
                        <input
                          type="text"
                          value={settings.address}
                          onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">يوزر إنستغرام</label>
                        <input
                          type="text"
                          value={settings.instagram}
                          onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-xs text-zinc-200 font-mono"
                          placeholder="safos.bags"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">يوزر فيسبوك</label>
                        <input
                          type="text"
                          value={settings.facebook}
                          onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-xs text-zinc-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">يوزر تيك توك</label>
                        <input
                          type="text"
                          value={settings.tiktok}
                          onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-xs text-zinc-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. تعديل الألوان الرسمية والعملة لبراند SAFOS */}
                {activeSettingsSection === 'style' && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-light text-zinc-100">الألوان الرسمية الفاخرة والعملة</h4>
                      <p className="text-xs text-zinc-500 mt-1">تحديد الألوان الحية التي تظهر في الواجهة الرئيسية للموقع مباشرة</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">اللون الأساسي (Primary Color)</label>
                        <div className="flex items-center space-x-2 space-x-reverse bg-black border border-zinc-900 p-2.5 rounded-xl">
                          <input
                            type="color"
                            value={settings.primary_color}
                            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                            className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-zinc-400">{settings.primary_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">اللون الثانوي (Secondary Color)</label>
                        <div className="flex items-center space-x-2 space-x-reverse bg-black border border-zinc-900 p-2.5 rounded-xl">
                          <input
                            type="color"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                            className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-zinc-400">{settings.secondary_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">اللون المميز (Accent Color)</label>
                        <div className="flex items-center space-x-2 space-x-reverse bg-black border border-zinc-900 p-2.5 rounded-xl">
                          <input
                            type="color"
                            value={settings.accent_color}
                            onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                            className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-zinc-400">{settings.accent_color}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">رمز العملة (مثلاً: د.م)</label>
                        <input
                          type="text"
                          value={settings.currency_symbol}
                          onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5">كود العملة (مثلاً: MAD)</label>
                        <input
                          type="text"
                          value={settings.currency}
                          onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* زر الحفظ العائم والمشترك */}
                <div className="border-t border-zinc-900 pt-6 mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading === 'settings'}
                    className="bg-[#D4AF37] hover:bg-amber-500 text-black font-semibold py-3 px-8 rounded-xl flex items-center space-x-2 space-x-reverse transition-all disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{actionLoading === 'settings' ? 'جاري مزامنة التغييرات...' : 'مزامنة وحفظ التعديلات حياً'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>

      {/* ------------------ أ. نافذة إضافة منتج جديد بالكامل (Add Product Modal) ------------------ */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">إضافة حقيبة فاخرة جديدة للتشكيلة</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اسم الحقيبة (بالعربية)</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm"
                    placeholder="مثال: حقيبة صفاء"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الاسم بالإنجليزية (Name EN)</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name_en}
                    onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono"
                    placeholder="Safaa Chevron"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر الحالي (درهم المغربي)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر القديم قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={newProduct.old_price}
                    onChange={(e) => setNewProduct({ ...newProduct, old_price: Number(e.target.value) })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">صنف الحقيبة (Category)</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-300"
                  >
                    <option value="chevron">Chevron</option>
                    <option value="clutch">Clutch</option>
                    <option value="chain">Chain</option>
                    <option value="crossbody">Crossbody</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اللون والمزيج</label>
                  <input
                    type="text"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs"
                    placeholder="بيج × أزرق كحلي"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التاغ الترويجي</label>
                  <input
                    type="text"
                    value={newProduct.tag}
                    onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs"
                    placeholder="الأكثر مبيعاً، جديد..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">رابط صورة المنتج الفاخرة (Image URL)</label>
                <input
                  type="text"
                  required
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">المخزون المتوفر بالمشغل</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono"
                />
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
              <button onClick={() => setEditingProduct(null)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اسم المنتج</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الاسم بالإنجليزي (EN)</label>
                  <input
                    type="text"
                    value={editingProduct.name_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm text-zinc-200 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر (MAD)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر قبل الخصم (MAD)</label>
                  <input
                    type="number"
                    value={editingProduct.old_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, old_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono text-zinc-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الصنف (Category)</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-300"
                  >
                    <option value="chevron">Chevron</option>
                    <option value="clutch">Clutch</option>
                    <option value="chain">Chain</option>
                    <option value="crossbody">Crossbody</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اللون والمزيج</label>
                  <input
                    type="text"
                    value={editingProduct.color || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التاغ الترويجي</label>
                  <input
                    type="text"
                    value={editingProduct.tag || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">رابط صورة المنتج الفاخرة</label>
                <input
                  type="text"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">المخزون بالمشغل</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full bg-black border border-zinc-900 p-2.5 rounded-xl text-sm font-mono text-zinc-200"
                />
              </div>
              <div className="border-t border-zinc-900 pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setEditingProduct(null)} className="bg-zinc-900 text-zinc-300 py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === `save-prod-${editingProduct.id}`} className="bg-[#D4AF37] text-black py-2.5 px-6 rounded-xl text-xs font-bold">حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ ج. نافذة تفاصيل ومعالجة الطلبات المنبثقة ------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-[#0F0F0F]">
              <div>
                <span className="text-xs text-amber-500 font-mono font-bold">{selectedOrder.order_number}</span>
                <h3 className="text-base font-light text-zinc-200 mt-0.5">تفاصيل ومعالجة الطلب للعميل</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-[#0D0D0D] border border-zinc-900 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">اسم العميل بالكامل</h4>
                  <p className="text-sm font-medium text-zinc-100">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">تاريخ ووقت الطلب</h4>
                  <p className="text-sm font-mono text-zinc-300">{new Date(selectedOrder.created_at).toLocaleString('ar-MA')}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">الهاتف للتواصل</h4>
                  <p className="text-sm font-mono text-zinc-300 flex items-center space-x-2 space-x-reverse">
                    <Phone size={12} className="text-amber-500" />
                    <span>{selectedOrder.customer_phone}</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">العنوان والمدينة</h4>
                  <p className="text-sm text-zinc-300 flex items-center space-x-2 space-x-reverse">
                    <MapPin size={12} className="text-amber-500" />
                    <span>{selectedOrder.customer_city} • {selectedOrder.customer_address}</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-3">الحقائب الفاخرة المطلوبة:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-[#0F0F0F] border border-zinc-900 rounded-xl">
                      <div>
                        <span className="text-sm font-light text-zinc-200">{item.productName || item.product_name}</span>
                        <span className="text-xs text-zinc-500 block mt-0.5">الكمية: {item.qty || item.quantity} حقيبة</span>
                      </div>
                      <span className="text-sm text-[#D4AF37] font-light">{(Number(item.price) * Number(item.qty || item.quantity)).toLocaleString()} درهم</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex justify-between items-center">
                <span className="text-sm text-zinc-400">القيمة الإجمالية للطلب:</span>
                <span className="text-xl font-light text-[#D4AF37]">{Number(selectedOrder.total).toLocaleString()} درهم</span>
              </div>
            </div>
            <div className="p-6 bg-[#0F0F0F] border-t border-zinc-900 flex justify-between items-center">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-xs text-zinc-500">حالة الشحن:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="bg-black border border-zinc-850 text-xs py-1.5 px-3 rounded-xl text-zinc-300"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="bg-zinc-900 text-zinc-300 py-2 px-5 rounded-xl text-xs">إغلاق</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
