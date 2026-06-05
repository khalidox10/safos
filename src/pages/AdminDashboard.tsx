import React, { useState, useEffect } from 'react';
// استيراد عميل سوبابيس الجاهز والموحد من مشروعك لتفادي مشاكل تهيئة العميل المتكررة
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
    id: null,
    hero_text: '',
    logo_url: '',
    contact_phone: '',
    contact_email: '',
    primary_color: '#000000',
    secondary_color: '#D4AF37'
  });

  // حالات البحث والتصفية
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // النافذة المنبثقة للتفاصيل (Modal)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // الإشعارات (Toasts)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // حماية المسار والتحقق من تسجيل الدخول بطريقة آمنة تمنع الانهيار
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
        setConnectionError(err.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات. تأكد من صحة الروابط في Vercel.');
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // جلب جميع البيانات من Supabase
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

      // 3. جلب الإعدادات
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      if (settingsData) setSettings(settingsData);

    } catch (err: any) {
      showToast(err.message || 'فشل تحميل البيانات من السحابة', 'error');
    } finally {
      setLoading(false);
    }
  };

  // دالة إظهار الإشعارات المؤقتة
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  // تحديث حالة الطلب فورا في قاعدة البيانات
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

  // تحديث حالة الدفع فورا في قاعدة البيانات
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

  // حذف طلب (خاص بالمسؤول فقط)
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

  // تحديث سريع لسعر أو مخزون المنتج
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

  // حفظ إعدادات الموقع بالكامل (تم تعديلها لتفادي تعارض الـ UUID الفارغ)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('settings');
    try {
      let error;
      const settingsToSave = { ...settings };
      
      if (settingsToSave.id) {
        ({ error } = await supabase
          .from('site_settings')
          .update(settingsToSave)
          .eq('id', settingsToSave.id));
      } else {
        // حذف الـ id تماماً إذا كان فارغاً لتقوم قاعدة البيانات بتوليد UUID تلقائي
        delete settingsToSave.id;
        ({ error } = await supabase
          .from('site_settings')
          .insert([settingsToSave]));
      }
      if (error) throw error;
      showToast('تم حفظ الإعدادات بنجاح في قاعدة البيانات', 'success');
      fetchData(); // لإعادة التحميل والمزامنة
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // حساب الإحصائيات الحيوية (Live Metrics)
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.payment_status === 'paid')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;
  const lowStockProducts = products.filter(p => p.stock < 3);

  // تصفية الطلبات بناءً على البحث والفلترة
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number?.toLowerCase() || '').includes(orderSearch.toLowerCase()) ||
      (order.customer_name?.toLowerCase() || '').includes(orderSearch.toLowerCase()) ||
      (order.phone || '').includes(orderSearch);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // إذا تم رصد خطأ اتصال بالخادم، اعرض تنبيهاً ذكياً بدلاً من انهيار الشاشة كاملة
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
      
      {/* الإشعارات العائمة (Toasts) */}
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

      {/* الشاشات الصغيرة: زر الهامبرغر للقائمة الجانبية */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-40 bg-zinc-900/80 border border-zinc-800 p-2 rounded-lg text-amber-500 backdrop-blur-md"
      >
        <Menu size={24} />
      </button>

      {/* القائمة الجانبية الفاخرة (Luxury Minimalist Sidebar) */}
      <aside className={`fixed inset-y-0 right-0 z-30 w-64 bg-black border-l border-zinc-900 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:static lg:translate-x-0'
      }`}>
        <div>
          {/* الشعار والهوية الفاخرة */}
          <div className="p-8 border-b border-zinc-900 text-center">
            <h1 className="text-2xl font-bold tracking-[0.3em] text-[#D4AF37]">SAFOS</h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Luxury Handmade bags</p>
          </div>

          {/* أزرار التنقل */}
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

        {/* زر تسجيل الخروج ونسخة النظام */}
        <div className="p-4 border-t border-zinc-900 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all duration-200 text-sm"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
          <div className="text-[10px] text-zinc-600 text-center">SAFOS OS v2.1 • 2026</div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto">
        
        {/* العناوين والتحديث */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div>
            <h2 className="text-2xl font-light tracking-wide text-zinc-100 uppercase">
              {activeTab === 'dashboard' && 'لوحة التحكم والمؤشرات'}
              {activeTab === 'orders' && 'سجل وإدارة المبيعات'}
              {activeTab === 'products' && 'إدارة المنتجات والمخزون'}
              {activeTab === 'settings' && 'إعدادات الموقع وتخصيص المظهر'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">تحديث البيانات فوري ومباشر من خوادم السحابة</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 rounded-xl transition-all duration-300"
            title="تحديث فوري للبيانات"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
        </div>

        {/* واجهة التحميل الذكية (Loading Skeletons) */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-zinc-950/50 border border-zinc-900 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-zinc-950/50 border border-zinc-900 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* ------------------ 1. تبويب الإحصائيات العامة ------------------ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                
                {/* شبكة مؤشرات الأداء الحيوية (KPIs Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* الأرباح الفعالة */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">إجمالي الأرباح المدفوعة</span>
                      <div className="p-2 bg-amber-500/10 text-[#D4AF37] rounded-xl"><DollarSign size={18} /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-light text-zinc-100">{totalRevenue.toLocaleString()}</span>
                      <span className="text-xs text-amber-500 font-semibold mr-1">درهم</span>
                    </div>
                  </div>

                  {/* الطلبات المعلقة */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">الطلبات المعلقة</span>
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Clock size={18} /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-light text-zinc-100">{pendingOrdersCount}</span>
                      <span className="text-xs text-zinc-500 mr-2">طلبات بانتظار التأكيد</span>
                    </div>
                  </div>

                  {/* المنتجات منخفضة المخزون */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-red-500/20 transition-all duration-300 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">نقص المخزون</span>
                      <div className="p-2 bg-red-500/10 text-red-400 rounded-xl"><AlertCircle size={18} /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-light text-red-400">{lowStockProducts.length}</span>
                      <span className="text-xs text-zinc-500 mr-2">منتجات مخزونها &lt; 3</span>
                    </div>
                  </div>

                  {/* إجمالي المنتجات */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">مجموع التشكيلة</span>
                      <div className="p-2 bg-zinc-900 text-zinc-300 rounded-xl"><ShoppingBag size={18} /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-light text-zinc-100">{products.length}</span>
                      <span className="text-xs text-zinc-500 mr-2">حقيبة يد فاخرة معروضة</span>
                    </div>
                  </div>

                </div>

                {/* رسم بياني فاخر مخصص يعتمد على SVG ومصمم للعلامات التجارية الفاخرة */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 lg:p-8 rounded-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                      <h3 className="text-lg font-light text-zinc-200">تحليل المبيعات والنشاط المالي</h3>
                      <p className="text-xs text-zinc-500">رسم بياني تفاعلي لتغير الأرباح المكتسبة بناءً على الشحنات المسلمة والمدفوعة</p>
                    </div>
                  </div>

                  {/* مظهر رسم بياني فاخر */}
                  <div className="h-64 w-full relative mt-8 flex items-end justify-between px-4 pb-4 border-b border-l border-zinc-800">
                    <div className="absolute left-2 top-0 text-[10px] text-zinc-600">القيمة المالية (درهم)</div>
                    
                    {/* عمود 1 */}
                    <div className="flex flex-col items-center w-full group">
                      <span className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">35k</span>
                      <div className="w-12 bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 h-24 rounded-t-lg transition-all duration-500" />
                      <span className="text-[10px] text-zinc-500 mt-2">يناير</span>
                    </div>
                    {/* عمود 2 */}
                    <div className="flex flex-col items-center w-full group">
                      <span className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">48k</span>
                      <div className="w-12 bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 h-36 rounded-t-lg transition-all duration-500" />
                      <span className="text-[10px] text-zinc-500 mt-2">فبراير</span>
                    </div>
                    {/* عمود 3 */}
                    <div className="flex flex-col items-center w-full group">
                      <span className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">62k</span>
                      <div className="w-12 bg-gradient-to-t from-amber-500/5 to-amber-500/20 border border-amber-500/30 hover:border-amber-500 h-48 rounded-t-lg transition-all duration-500" />
                      <span className="text-[10px] text-amber-500 mt-2 font-medium">مارس (الحالي)</span>
                    </div>
                    {/* عمود 4 */}
                    <div className="flex flex-col items-center w-full group">
                      <span className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">12k</span>
                      <div className="w-12 bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 h-12 rounded-t-lg transition-all duration-500" />
                      <span className="text-[10px] text-zinc-500 mt-2">أبريل</span>
                    </div>
                  </div>
                </div>

                {/* قائمة الطلبات السريعة المعلقة */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-light text-zinc-200">الطلبات العاجلة التي تحتاج معالجة</h3>
                      <p className="text-xs text-zinc-500">طلبات جديدة معلقة تحتاج للتأكيد أو الشحن الفوري</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center space-x-1 space-x-reverse"
                    >
                      <span>كل الطلبات</span>
                      <ChevronRight size={14} className="transform rotate-180" />
                    </button>
                  </div>

                  {orders.filter(o => o.status === 'pending').length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">ممتاز! لا يوجد أي طلبات معلقة حالياً.</div>
                  ) : (
                    <div className="space-y-3">
                      {orders.filter(o => o.status === 'pending').slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-[#0F0F0F] border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all">
                          <div>
                            <span className="text-xs font-mono text-zinc-500">{order.order_number}</span>
                            <h4 className="text-sm font-medium text-zinc-200 mt-1">{order.customer_name}</h4>
                            <p className="text-xs text-zinc-500 mt-0.5">{order.city} • {order.phone}</p>
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-light text-[#D4AF37] block">{Number(order.total).toLocaleString()} درهم</span>
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="text-xs text-zinc-400 hover:text-zinc-100 mt-1.5 underline"
                            >
                              عرض المعالجة
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ------------------ 2. تبويب إدارة الطلبات الكاملة ------------------ */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* شريط البحث وفلاتر التصفية المتطورة */}
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* البحث بـ الهاتف، الاسم، أو رقم الطلب */}
                  <div className="relative w-full md:w-96">
                    <Search className="absolute right-3.5 top-3 text-zinc-500" size={18} />
                    <input
                      type="text"
                      placeholder="البحث بالاسم، رقم الطلب، أو الهاتف..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pr-11 pl-4 py-2.5 bg-black border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 text-sm transition-all"
                    />
                    {orderSearch && (
                      <button onClick={() => setOrderSearch('')} className="absolute left-3 top-3.5 text-zinc-500 hover:text-zinc-300">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* أدوات التصفية الفاخرة */}
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    
                    {/* تصفية بحالة الشحن */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Filter size={14} className="text-zinc-500" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black border border-zinc-900 text-zinc-300 py-2 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500/40 cursor-pointer"
                      >
                        <option value="all">كل حالات الشحن</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="cancelled">ملغى</option>
                      </select>
                    </div>

                    {/* تصفية بحالة الدفع */}
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="bg-black border border-zinc-900 text-zinc-300 py-2 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500/40 cursor-pointer"
                    >
                      <option value="all">كل حالات الدفع</option>
                      <option value="paid">مدفوع</option>
                      <option value="unpaid">غير مدفوع</option>
                      <option value="refunded">مسترجع</option>
                    </select>

                  </div>

                </div>

                {/* جدول المبيعات الفاخر والذكي */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">لم يتم العثور على أي طلبات تطابق معايير البحث والفلترة.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-sm text-zinc-300">
                        <thead className="bg-[#0D0D0D] text-zinc-500 text-[10px] uppercase tracking-wider border-b border-zinc-900">
                          <tr>
                            <th className="py-4 px-6 font-medium">رقم الطلب</th>
                            <th className="py-4 px-6 font-medium">العميل</th>
                            <th className="py-4 px-6 font-medium">الهاتف والمدينة</th>
                            <th className="py-4 px-6 font-medium text-left">قيمة الطلب</th>
                            <th className="py-4 px-6 font-medium text-center">حالة الشحن</th>
                            <th className="py-4 px-6 font-medium text-center">حالة الدفع</th>
                            <th className="py-4 px-6 font-medium text-center">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors">
                              
                              {/* رقم الطلب */}
                              <td className="py-4 px-6">
                                <span className="font-mono text-xs text-amber-500 font-semibold">{order.order_number}</span>
                                <span className="block text-[10px] text-zinc-600 mt-1">
                                  {new Date(order.created_at).toLocaleDateString('ar-MA')}
                                </span>
                              </td>

                              {/* اسم العميل */}
                              <td className="py-4 px-6 font-medium text-zinc-100">{order.customer_name}</td>

                              {/* الهاتف والمدينة */}
                              <td className="py-4 px-6">
                                <span className="block text-xs font-mono">{order.phone}</span>
                                <span className="text-[10px] text-zinc-500 block mt-0.5">{order.city}</span>
                              </td>

                              {/* القيمة الإجمالية */}
                              <td className="py-4 px-6 text-left font-light text-zinc-100">
                                {Number(order.total).toLocaleString()} درهم
                              </td>

                              {/* تعديل حالة الشحن المباشر (Inline status edit) */}
                              <td className="py-4 px-6 text-center">
                                <select
                                  value={order.status}
                                  disabled={actionLoading === `order-status-${order.id}`}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className={`text-xs py-1.5 px-3 rounded-lg bg-black border cursor-pointer focus:outline-none ${
                                    order.status === 'delivered' ? 'text-emerald-400 border-emerald-500/20' :
                                    order.status === 'cancelled' ? 'text-red-400 border-red-500/20' :
                                    order.status === 'shipped' ? 'text-blue-400 border-blue-500/20' :
                                    order.status === 'confirmed' ? 'text-indigo-400 border-indigo-500/20' :
                                    'text-amber-500 border-amber-500/20'
                                  }`}
                                >
                                  <option value="pending">قيد الانتظار</option>
                                  <option value="confirmed">مؤكد</option>
                                  <option value="shipped">تم الشحن</option>
                                  <option value="delivered">تم التوصيل</option>
                                  <option value="cancelled">ملغى</option>
                                </select>
                              </td>

                              {/* تعديل حالة الدفع (Inline payment status edit) */}
                              <td className="py-4 px-6 text-center">
                                <select
                                  value={order.payment_status}
                                  disabled={actionLoading === `payment-${order.id}`}
                                  onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                                  className={`text-xs py-1.5 px-3 rounded-lg bg-black border cursor-pointer focus:outline-none ${
                                    order.payment_status === 'paid' ? 'text-emerald-400 border-emerald-500/20' :
                                    order.payment_status === 'refunded' ? 'text-zinc-500 border-zinc-800' :
                                    'text-red-400 border-red-500/20'
                                  }`}
                                >
                                  <option value="unpaid">غير مدفوع</option>
                                  <option value="paid">مدفوع</option>
                                  <option value="refunded">مسترجع</option>
                                </select>
                              </td>

                              {/* أزرار الإجراءات */}
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg"
                                    title="تفاصيل الطلب"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    disabled={actionLoading === `delete-order-${order.id}`}
                                    className="p-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-lg"
                                    title="حذف الطلب"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ------------------ 3. تبويب المنتجات والمخزون ------------------ */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* شبكة المنتجات المعروضة */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
                      
                      <div>
                        {/* صورة المنتج الفاخرة */}
                        <div className="w-full h-48 bg-zinc-900 rounded-xl overflow-hidden mb-4 relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">لا توجد صورة للمنتج</div>
                          )}
                          
                          {/* تنبيه انخفاض المخزون الفاخر */}
                          {product.stock < 3 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                              <AlertCircle size={10} />
                              <span>مخزون منخفض جداً ({product.stock})</span>
                            </div>
                          )}
                        </div>

                        {/* معلومات المنتج */}
                        <h4 className="text-base font-light text-zinc-200 mb-1">{product.name}</h4>
                        <p className="text-xs text-zinc-500 mb-4">كود المنتج الفريد: #{product.id.substring(0, 8)}</p>
                      </div>

                      {/* تعديل السعر والكمية بشكل سريع وفوري (Quick edit) */}
                      <div className="border-t border-zinc-900 pt-4 mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-zinc-500 block mb-1">السعر (درهم)</label>
                            <input
                              type="number"
                              value={product.price}
                              disabled={actionLoading === `prod-${product.id}`}
                              onChange={(e) => handleQuickUpdateProduct(product.id, { price: Number(e.target.value) })}
                              className="w-full bg-black border border-zinc-900 py-1.5 px-3 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500/40"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 block mb-1">المخزون المتوفر</label>
                            <input
                              type="number"
                              value={product.stock}
                              disabled={actionLoading === `prod-${product.id}`}
                              onChange={(e) => handleQuickUpdateProduct(product.id, { stock: Number(e.target.value) })}
                              className="w-full bg-black border border-zinc-900 py-1.5 px-3 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500/40"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ------------------ 4. تبويب إعدادات المتجر ------------------ */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 lg:p-8 shadow-2xl">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* ترويسة النموذج */}
                  <div>
                    <h3 className="text-lg font-light text-zinc-200">التحكم في محتوى المتجر</h3>
                    <p className="text-xs text-zinc-500">قم بتعديل النصوص الرئيسية، معلومات التواصل، والمظهر الأساسي للموقع مباشرة</p>
                  </div>

                  <div className="space-y-4">
                    {/* نص الشاشة الرئيسية (Hero Text) */}
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5 font-medium">النص الإعلاني الرئيسي (Hero Text)</label>
                      <textarea
                        value={settings.hero_text}
                        onChange={(e) => setSettings({ ...settings, hero_text: e.target.value })}
                        className="w-full h-24 bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40 transition-all"
                        placeholder="مثال: تشكيلة حصرية من الحقائب الجلدية المصنوعة يدوياً بكل حب وفخر مغربي..."
                      />
                    </div>

                    {/* رابط لوجو الموقع */}
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5 font-medium">رابط لوجو الموقع (Logo URL)</label>
                      <input
                        type="text"
                        value={settings.logo_url}
                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40 transition-all"
                        placeholder="رابط مباشر لصورة اللوجو..."
                      />
                    </div>

                    {/* رقم الهاتف والإيميل */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5 font-medium">رقم الهاتف للتواصل</label>
                        <input
                          type="text"
                          value={settings.contact_phone}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40 transition-all"
                          placeholder="+212 600-000000"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5 font-medium">البريد الإلكتروني للعلامة</label>
                        <input
                          type="email"
                          value={settings.contact_email}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                          className="w-full bg-black border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40 transition-all"
                          placeholder="contact@safos.online"
                        />
                      </div>
                    </div>

                    {/* الألوان الأساسية */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5 font-medium">اللون الأساسي (Primary Color)</label>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="color"
                            value={settings.primary_color}
                            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                            className="w-10 h-10 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-zinc-400">{settings.primary_color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1.5 font-medium">اللون الثانوي / الذهبي (Secondary Color)</label>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="color"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                            className="w-10 h-10 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-zinc-400">{settings.secondary_color}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* زر حفظ الإعدادات الفاخر */}
                  <div className="border-t border-zinc-900 pt-6 mt-6">
                    <button
                      type="submit"
                      disabled={actionLoading === 'settings'}
                      className="w-full md:w-auto bg-[#D4AF37] hover:bg-amber-500 text-black font-semibold py-3 px-8 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      <span>{actionLoading === 'settings' ? 'جاري الحفظ في الخادم...' : 'حفظ التعديلات الحية'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}
          </>
        )}

      </main>

      {/* ------------------ نافذة تفاصيل ومعالجة الطلبات المنبثقة (Order Details Modal) ------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            
            {/* رأس النافذة المنبثقة */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-[#0F0F0F]">
              <div>
                <span className="text-xs text-amber-500 font-mono font-bold">{selectedOrder.order_number}</span>
                <h3 className="text-base font-light text-zinc-200 mt-0.5">تفاصيل ومعالجة الطلب للعميل</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* محتوى التفاصيل الفاخر */}
            <div className="p-6 space-y-6">
              
              {/* بيانات العميل */}
              <div className="bg-[#0D0D0D] border border-zinc-900 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">اسم العميل بالكامل</h4>
                  <p className="text-sm font-medium text-zinc-100">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">تاريخ ووقت الطلب</h4>
                  <p className="text-sm font-mono text-zinc-300">
                    {new Date(selectedOrder.created_at).toLocaleString('ar-MA')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">الهاتف المحمول للتواصل</h4>
                  <p className="text-sm font-mono text-zinc-300 flex items-center space-x-2 space-x-reverse">
                    <Phone size={12} className="text-amber-500" />
                    <span>{selectedOrder.phone}</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">المدينة وعنوان التوصيل</h4>
                  <p className="text-sm text-zinc-300 flex items-center space-x-2 space-x-reverse">
                    <MapPin size={12} className="text-amber-500" />
                    <span>{selectedOrder.city}</span>
                  </p>
                </div>
              </div>

              {/* قائمة الحقائب والمنتجات المطلوبة (من الحقل JSONB الفعلي) */}
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-3">الحقائب الفاخرة المطلوبة:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-[#0F0F0F] border border-zinc-900 rounded-xl">
                        <div>
                          <span className="text-sm font-light text-zinc-200">{item.product_name}</span>
                          <span className="text-xs text-zinc-500 block mt-0.5">الكمية: {item.quantity} حقيبة</span>
                        </div>
                        <span className="text-sm text-[#D4AF37] font-light">
                          {(Number(item.price) * Number(item.quantity)).toLocaleString()} درهم
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-zinc-500">لا تتوفر تفاصيل إلكترونية للمنتجات (JSONB فارغ)</div>
                  )}
                </div>
              </div>

              {/* تفاصيل المجموع النهائي */}
              <div className="border-t border-zinc-900 pt-4 flex justify-between items-center">
                <span className="text-sm text-zinc-400">القيمة الإجمالية الصافية للطلب:</span>
                <span className="text-xl font-light text-[#D4AF37]">{Number(selectedOrder.total).toLocaleString()} درهم</span>
              </div>

              {/* حقل تحديث الملاحظات الإدارية */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">ملاحظات إدارية خاصة بهذا الطلب</label>
                <textarea
                  placeholder="مثال: يفضل الاتصال به في الفترة المسائية فقط لتسليم الشحنة..."
                  value={selectedOrder.notes || ''}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSelectedOrder((prev: any) => ({ ...prev, notes: val }));
                    await supabase.from('orders').update({ notes: val }).eq('id', selectedOrder.id);
                  }}
                  className="w-full h-16 bg-[#0B0B0B] border border-zinc-900 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500/40"
                />
              </div>

            </div>

            {/* تذييل النافذة المنبثقة للتحكم السريع */}
            <div className="p-6 bg-[#0F0F0F] border-t border-zinc-900 flex flex-wrap gap-3 items-center justify-between">
              
              {/* تغيير حالة الطلب من داخل المودال */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-xs text-zinc-500">حالة الشحن:</span>
                <select
                  value={selectedOrder.status}
                  disabled={actionLoading === `order-status-${selectedOrder.id}`}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="bg-black border border-zinc-850 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-zinc-300 cursor-pointer"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>

              {/* أزرار الإجراء السريع */}
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  disabled={actionLoading === `delete-order-${selectedOrder.id}`}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  حذف الطلب نهائياً
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 py-2 px-5 rounded-xl text-xs transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
