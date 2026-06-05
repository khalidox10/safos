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
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  // حالات التنقل والواجهة
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // حالة رصد أخطاء الربط مع سوبابيس لمنع الصفحة البيضاء
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // البيانات من قاعدة البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    site_name: 'SAFOS',
    site_subtitle: 'Embroidered Atelier',
    hero_title: '',
    hero_subtitle: '',
    phone: '',
    email: '',
    primary_color: '#1a1410',
    secondary_color: '#b8935a'
  });

  // حالات البحث والتصفية
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // النافذة المنبثقة للتفاصيل (Modal)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // الإشعارات (Toasts)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // حماية المسار والتحقق من تسجيل الدخول
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

  // جلب جميع البيانات من قاعدة البيانات الجديدة
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
          hero_title: hero.title || '',
          hero_subtitle: hero.subtitle || '',
          phone: contact.phone || '',
          email: contact.email || '',
          primary_color: colors.primary || '#1a1410',
          secondary_color: colors.secondary || '#b8935a'
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(`order-status-${orderId}`);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
      showToast('تم تحديث حالة الطلب بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setActionLoading(`payment-${orderId}`);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, payment_status: newPaymentStatus }));
      }
      showToast('تم تحديث حالة الدفع بنجاح', 'success');
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
      setSelectedOrder(null);
      showToast('تم حذف الطلب بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickUpdateProduct = async (productId: string, fields: { price?: number; stock?: number }) => {
    setActionLoading(`prod-${productId}`);
    try {
      const { error } = await supabase
        .from('products')
        .update(fields)
        .eq('id', productId);
      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...fields } : p));
      showToast('تم تحديث المنتج بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // حفظ الإعدادات بالكامل في جدول store_settings المتوافق مع الهيكل الجديد
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('settings');
    try {
      await supabase.from('store_settings').upsert({
        key: 'brand',
        value: { name: settings.site_name, subtitle: settings.site_subtitle }
      });
      await supabase.from('store_settings').upsert({
        key: 'colors',
        value: { primary: settings.primary_color, secondary: settings.secondary_color }
      });
      await supabase.from('store_settings').upsert({
        key: 'contact',
        value: { phone: settings.phone, email: settings.email }
      });
      await supabase.from('store_settings').upsert({
        key: 'hero',
        value: { title: settings.hero_title, subtitle: settings.hero_subtitle }
      });

      showToast('تم حفظ إعدادات المتجر بنجاح', 'success');
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
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;
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
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              إعادة محاولة الاتصال
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex font-sans antialiased selection:bg-amber-500/30">
      
      {/* الإشعارات العائمة */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 space-x-reverse border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-zinc-900/90 border-emerald-500/30 text-emerald-400' 
            : 'bg-zinc-900/90 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* زر الهامبرغر للقائمة الجانبية */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-40 bg-zinc-900/80 border border-zinc-800 p-2 rounded-lg text-amber-500 backdrop-blur-md"
      >
        <Menu size={24} />
      </button>

      {/* القائمة الجانبية */}
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
              { id: 'settings', label: 'إعدادات المتجر', icon: SettingsIcon },
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
                    isActive 
                      ? 'bg-gradient-to-l from-amber-500/10 to-amber-500/0 text-[#D4AF37] border-r-2 border-[#D4AF37] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.03)]' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950'
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
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all duration-200 text-sm"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
          <div className="text-[10px] text-zinc-600 text-center">{settings.site_name} OS v2.5 • 2026</div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div>
            <h2 className="text-2xl font-light tracking-wide text-zinc-100 uppercase">
              {activeTab === 'dashboard' && 'لوحة التحكم والمؤشرات'}
              {activeTab === 'orders' && 'سجل وإدارة المبيعات'}
              {activeTab === 'products' && 'إدارة المنتجات والمخزون'}
              {activeTab === 'settings' && 'إعدادات الموقع وتخصيص المظهر'}
            </h2>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 rounded-xl transition-all duration-300"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-zinc-950/50 border border-zinc-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
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
                  <h3 className="text-lg font-light text-zinc-200">تحليل النشاط المالي</h3>
                  <div className="h-48 w-full relative mt-8 flex items-end justify-between border-b border-zinc-800">
                    <div className="w-12 bg-zinc-900 h-24 rounded-t-lg" />
                    <div className="w-12 bg-zinc-900 h-36 rounded-t-lg" />
                    <div className="w-12 bg-gradient-to-t from-amber-500/5 to-amber-500/20 border border-amber-500/30 h-44 rounded-t-lg" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
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
                            <button onClick={() => setSelectedOrder(order)} className="p-1 bg-zinc-900 text-zinc-350 rounded">
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="w-full h-48 bg-zinc-900 rounded-xl overflow-hidden mb-4">
                        {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
                      </div>
                      <h4 className="text-base font-light text-zinc-200">{product.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleQuickUpdateProduct(product.id, { price: Number(e.target.value) })}
                        className="bg-black border border-zinc-900 py-1.5 px-3 rounded text-xs text-zinc-200"
                      />
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleQuickUpdateProduct(product.id, { stock: Number(e.target.value) })}
                        className="bg-black border border-zinc-900 py-1.5 px-3 rounded text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 lg:p-8">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm"
                    placeholder="اسم الموقع"
                  />
                  <input
                    type="text"
                    value={settings.site_subtitle}
                    onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })}
                    className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm"
                    placeholder="الوصف الفرعي للموقع"
                  />
                  <textarea
                    value={settings.hero_title}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    className="w-full h-24 bg-black border border-zinc-900 p-3 rounded-xl text-sm"
                    placeholder="العنوان الرئيسي في واجهة المتجر"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="bg-black border border-zinc-900 p-3 rounded-xl text-sm"
                      placeholder="الهاتف"
                    />
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="bg-black border border-zinc-900 p-3 rounded-xl text-sm"
                      placeholder="البريد الإلكتروني"
                    />
                  </div>
                  <button type="submit" className="bg-[#D4AF37] text-black font-semibold py-3 px-8 rounded-xl">
                    حفظ الإعدادات
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <span className="text-xs text-amber-500 font-mono font-bold">{selectedOrder.order_number}</span>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-100">اسم العميل: {selectedOrder.customer_name}</p>
              <p className="text-sm text-zinc-300">الهاتف: {selectedOrder.customer_phone}</p>
              <p className="text-sm text-zinc-300">المدينة: {selectedOrder.customer_city}</p>
              <p className="text-sm text-zinc-300">العنوان: {selectedOrder.customer_address}</p>
              <div className="border-t border-zinc-900 pt-4">
                <h5 className="text-xs text-zinc-400 mb-2">الحقائب المطلوبة:</h5>
                {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.productName} (x{item.qty})</span>
                    <span>{item.price} درهم</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
