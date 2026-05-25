import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, Product, Order, OrderStatus } from "../context/StoreContext";
import {
  X, LayoutDashboard, Package, FolderOpen, MessageSquareQuote,
  Scissors, Store, Save, Trash2, Plus, RotateCcw, LogOut, Lock,
  Check, ShoppingCart, Eye, ChevronDown, TrendingUp, Clock, CheckCircle,
  XCircle, Truck, AlertCircle, Search, Filter, Upload, ExternalLink,
  Undo2,
} from "lucide-react";

type Tab = "dashboard" | "orders" | "store" | "products" | "collections" | "testimonials" | "craft";

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending:    { label: "في الانتظار",   color: "bg-yellow-100 text-yellow-800 border-yellow-200",   icon: Clock },
  confirmed:  { label: "مؤكد",          color: "bg-blue-100 text-blue-800 border-blue-200",          icon: CheckCircle },
  processing: { label: "قيد التحضير",   color: "bg-purple-100 text-purple-800 border-purple-200",   icon: AlertCircle },
  shipped:    { label: "تم الشحن",      color: "bg-indigo-100 text-indigo-800 border-indigo-200",    icon: Truck },
  delivered:  { label: "تم التوصيل",   color: "bg-green-100 text-green-800 border-green-200",       icon: CheckCircle },
  cancelled:  { label: "ملغي",          color: "bg-red-100 text-red-800 border-red-200",             icon: XCircle },
};

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [saved, setSaved] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123" || password === "safos2026") {
      setAuthed(true); setAuthError("");
    } else {
      setAuthError("كلمة المرور غير صحيحة");
    }
  };

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  if (!authed) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#1a1410]/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#faf6ef] max-w-md w-full p-10 shadow-2xl rounded-xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-xs tracking-[0.3em] text-[#b8935a] uppercase mb-2">Admin Panel</div>
              <h2 className="font-display text-3xl text-[#1a1410]">SAFOS | الدخول</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition"><X size={22} /></button>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs tracking-wider text-[#5c4330] mb-2 block">كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b8935a]" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pr-11 pl-4 py-3.5 border border-[#b8935a]/30 bg-transparent focus:outline-none focus:border-[#b8935a] text-sm" placeholder="أدخلي كلمة المرور" autoFocus />
              </div>
            </div>
            {authError && <div className="text-sm text-red-600 bg-red-50 p-3 border border-red-200">{authError}</div>}
            <button type="submit" className="w-full bg-[#1a1410] text-[#faf6ef] py-3.5 text-xs tracking-[0.25em] uppercase hover:bg-[#b8935a] transition-colors">دخول إلى اللوحة</button>
            <p className="text-xs text-center text-[#5c4330] pt-4 border-t border-[#b8935a]/20">
              كلمة المرور التجريبية: <code className="bg-[#e8dcc4] px-2 py-0.5 rounded">admin123</code>
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard",    label: "الرئيسية",        icon: LayoutDashboard },
    { id: "orders",       label: "الطلبيات",         icon: ShoppingCart, badge: store.orders.filter(o => o.status === "pending").length },
    { id: "store",        label: "معلومات المتجر",  icon: Store },
    { id: "products",     label: "المنتجات",         icon: Package },
    { id: "collections",  label: "المجموعات",        icon: FolderOpen },
    { id: "testimonials", label: "آراء العملاء",    icon: MessageSquareQuote },
    { id: "craft",        label: "مراحل الصنع",     icon: Scissors },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1410] text-[#faf6ef] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#b8935a]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#b8935a] flex items-center justify-center shrink-0">
              <span className="font-display text-[#b8935a] text-sm font-bold">S</span>
            </div>
            <div>
              <div className="font-display text-lg tracking-[0.2em] text-[#faf6ef]">SAFOS</div>
              <div className="text-[9px] tracking-[0.2em] text-[#b8935a] uppercase">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded ${activeTab === tab.id ? "bg-[#b8935a] text-[#1a1410] font-semibold" : "text-[#d4b483] hover:bg-white/5"}`}>
              <tab.icon size={16} />
              <span className="flex-1 text-right">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#b8935a]/20 space-y-1">
          <button onClick={store.resetAll} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#d4b483] hover:bg-white/5 transition rounded">
            <RotateCcw size={14} /> إعادة تعيين الكل
          </button>
          <button onClick={onClose} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#d4b483] hover:bg-white/5 transition rounded">
            <LogOut size={14} /> خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#f5f0e8]">
        {/* Top bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-[#b8935a]/15 px-6 lg:px-8 py-4 flex flex-col lg:flex-row justify-between gap-4 lg:items-center z-10 shadow-sm">
          <div>
            <h1 className="font-display text-xl text-[#1a1410]">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-xs text-[#5c4330] mt-0.5">
              أنتِ الآن تعدّلين <span className="font-semibold text-[#b8935a]">نسخة Draft الخاصة</span> — لن يرى الزبناء التغييرات حتى تضغطي Publish.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-sm border border-green-200 rounded">
                  <Check size={14} /> تم حفظ المسودة
                </motion.div>
              )}
            </AnimatePresence>

            {store.hasUnpublishedChanges && (
              <span className="text-[11px] px-3 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-medium">
                لديك تغييرات غير منشورة
              </span>
            )}

            <button
              onClick={() => window.open(store.previewLink, "_blank")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#b8935a]/30 rounded-lg text-sm hover:bg-[#b8935a]/10 transition"
            >
              <Eye size={15} /> Preview
            </button>
            <button
              onClick={() => { store.discardDraft(); showSaved(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-50 transition"
            >
              <Undo2 size={15} /> Reset Draft
            </button>
            <button
              onClick={() => { store.publishDraft(); showSaved(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1410] text-[#faf6ef] rounded-lg text-sm hover:bg-[#b8935a] transition"
            >
              <Upload size={15} /> Publish
            </button>
            <button
              onClick={() => window.open(store.publicLink, "_blank")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#b8935a]/30 rounded-lg text-sm hover:bg-[#b8935a]/10 transition"
            >
              <ExternalLink size={15} /> Public Site
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-[#b8935a]/10 transition rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === "dashboard"    && <DashboardTab store={store} setTab={setActiveTab} />}
          {activeTab === "orders"       && <OrdersTab store={store} onSaved={showSaved} />}
          {activeTab === "store"        && <StoreTab store={store} onSaved={showSaved} />}
          {activeTab === "products"     && <ProductsTab store={store} onSaved={showSaved} />}
          {activeTab === "collections"  && <CollectionsTab store={store} onSaved={showSaved} />}
          {activeTab === "testimonials" && <TestimonialsTab store={store} onSaved={showSaved} />}
          {activeTab === "craft"        && <CraftTab store={store} onSaved={showSaved} />}
        </div>
      </main>
    </div>
  );
}

/* ============ SHARED UI ============ */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs tracking-wider text-[#5c4330] mb-1.5 block font-medium">{label}</label>
    {children}
  </div>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={"w-full px-3.5 py-2.5 border border-[#b8935a]/25 bg-white focus:outline-none focus:border-[#b8935a] text-sm rounded " + (props.className || "")} />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 bg-white focus:outline-none focus:border-[#b8935a] text-sm rounded min-h-[90px]" />
);
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-[#b8935a]/15 rounded-xl p-6 shadow-sm">
    <h3 className="font-display text-lg text-[#1a1410] mb-5 pb-3 border-b border-[#b8935a]/10">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

/* ============ DASHBOARD TAB ============ */
function DashboardTab({ store, setTab }: { store: any; setTab: (t: Tab) => void }) {
  const totalRevenue = store.orders.filter((o: Order) => o.status === "delivered").reduce((s: number, o: Order) => s + o.total, 0);
  const pending = store.orders.filter((o: Order) => o.status === "pending").length;
  const processing = store.orders.filter((o: Order) => ["confirmed", "processing", "shipped"].includes(o.status)).length;

  const stats = [
    { label: "إجمالي الطلبيات", value: store.orders.length, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", action: () => setTab("orders") },
    { label: "في الانتظار", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", action: () => setTab("orders") },
    { label: "قيد المعالجة", value: processing, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", action: () => setTab("orders") },
    { label: "الإيرادات المحصّلة", value: `${totalRevenue.toLocaleString()} ${store.storeInfo.currencySymbol}`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", action: () => setTab("orders") },
  ];

  const recentOrders = store.orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1410] text-[#faf6ef] p-7 rounded-xl">
        <h2 className="font-display text-2xl mb-1">أهلاً بكِ في SAFOS ✨</h2>
        <p className="text-[#d4b483]/80 text-sm">إدارة متجرك من مكان واحد — المنتجات، الطلبيات، والمعلومات.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#b8935a]/15 p-5">
          <div className="text-xs text-[#5c4330] mb-2">الرابط العام للزبناء</div>
          <div className="text-sm font-medium text-[#1a1410] break-all">{store.publicLink}</div>
          <button onClick={() => window.open(store.publicLink, "_blank")} className="mt-3 text-xs text-[#b8935a] hover:underline">
            فتح الرابط العام
          </button>
        </div>
        <div className="bg-white rounded-xl border border-[#b8935a]/15 p-5">
          <div className="text-xs text-[#5c4330] mb-2">رابط المعاينة الخاصة</div>
          <div className="text-sm font-medium text-[#1a1410] break-all">{store.previewLink}</div>
          <button onClick={() => window.open(store.previewLink, "_blank")} className="mt-3 text-xs text-[#b8935a] hover:underline">
            فتح Preview
          </button>
        </div>
        <div className="bg-white rounded-xl border border-[#b8935a]/15 p-5">
          <div className="text-xs text-[#5c4330] mb-2">رابط التحرير الخاص</div>
          <div className="text-sm font-medium text-[#1a1410] break-all">{store.editorLink}</div>
          <button onClick={() => window.open(store.editorLink, "_blank")} className="mt-3 text-xs text-[#b8935a] hover:underline">
            فتح لوحة التحرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={s.action}
            className="bg-white border border-[#b8935a]/15 rounded-xl p-5 text-right hover:shadow-md transition-shadow group cursor-pointer">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`font-display text-2xl ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-[#5c4330]">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-[#b8935a]/15 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-[#b8935a]/10">
          <h3 className="font-display text-lg text-[#1a1410]">آخر الطلبيات</h3>
          <button onClick={() => setTab("orders")} className="text-xs text-[#b8935a] hover:underline">عرض الكل ←</button>
        </div>
        <div className="divide-y divide-[#b8935a]/10">
          {recentOrders.map((order: Order) => {
            const st = ORDER_STATUS_MAP[order.status];
            return (
              <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#faf6ef]/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#b8935a]/10 flex items-center justify-center text-xs font-bold text-[#b8935a]">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#1a1410]">{order.customerName}</div>
                    <div className="text-xs text-[#5c4330]">{order.id} · {order.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm text-[#b8935a]">{order.total.toLocaleString()} {store.storeInfo.currencySymbol}</span>
                  <span className={`text-[10px] px-2.5 py-1 border rounded-full font-medium ${st.color}`}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm text-[#5c4330]">
        <div className="bg-white rounded-xl p-5 border border-[#b8935a]/15">
          <div className="font-semibold text-[#1a1410] mb-2">📦 المخزون</div>
          {store.products.map((p: Product) => (
            <div key={p.id} className="flex justify-between py-1 border-b border-[#b8935a]/5 last:border-0">
              <span className="truncate">{p.name}</span>
              <span className={p.stock <= 2 ? "text-red-600 font-bold" : "text-green-700"}>{p.stock} قطعة</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#b8935a]/15">
          <div className="font-semibold text-[#1a1410] mb-2">💡 نصائح سريعة</div>
          <ul className="space-y-2">
            <li>• حدّثي حالة الطلبيات يومياً</li>
            <li>• اكتبي ملاحظات على الطلبات الخاصة</li>
            <li>• تنبّهي للمخزون المنخفض (أحمر)</li>
            <li>• أضيفي صور حقيقية لمنتجاتك</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#b8935a]/15">
          <div className="font-semibold text-[#1a1410] mb-2">📞 معلوماتك</div>
          <div className="space-y-1">
            <div>📱 {store.storeInfo.phone}</div>
            <div>✉️ {store.storeInfo.email}</div>
            <div>📍 {store.storeInfo.address}</div>
            <div>📸 @{store.storeInfo.instagram}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ ORDERS TAB ============ */
function OrdersTab({ store, onSaved }: { store: any; onSaved: () => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = store.orders.filter((o: Order) => {
    const matchSearch = o.customerName.includes(search) || o.id.includes(search) || o.customerCity.includes(search) || o.customerPhone.includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id: string, status: OrderStatus) => {
    store.updateOrderStatus(id, status);
    if (selected?.id === id) setSelected({ ...selected, status });
    onSaved();
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#b8935a]/15 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8935a]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم العميل، رقم الطلب، المدينة..."
            className="w-full pr-9 pl-3 py-2.5 border border-[#b8935a]/25 bg-white focus:outline-none focus:border-[#b8935a] text-sm rounded" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8935a]" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="pr-9 pl-4 py-2.5 border border-[#b8935a]/25 bg-white focus:outline-none focus:border-[#b8935a] text-sm rounded appearance-none cursor-pointer">
            <option value="all">كل الحالات</option>
            {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4330] pointer-events-none" />
        </div>
        <span className="text-xs text-[#5c4330] bg-[#f0e8d8] px-3 py-1.5 rounded-full">{filtered.length} طلب</span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => {
          const count = store.orders.filter((o: Order) => o.status === k).length;
          return (
            <button key={k} onClick={() => setFilterStatus(filterStatus === k ? "all" : k)}
              className={`p-3 rounded-xl border text-center transition-all ${filterStatus === k ? "ring-2 ring-[#b8935a]" : ""} ${v.color}`}>
              <div className="font-display text-xl">{count}</div>
              <div className="text-[10px] mt-0.5">{v.label}</div>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-[#5c4330] border border-[#b8935a]/15">
            <ShoppingCart size={40} className="mx-auto mb-3 text-[#b8935a]/40" />
            لا توجد طلبيات مطابقة
          </div>
        ) : filtered.map((order: Order) => {
          const st = ORDER_STATUS_MAP[order.status];
          return (
            <motion.div key={order.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-[#b8935a]/15 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b8935a] to-[#d4b483] flex items-center justify-center text-white font-bold">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[#1a1410]">{order.customerName}</div>
                    <div className="text-xs text-[#5c4330]">{order.id} · {order.date} · {order.customerCity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display text-lg text-[#b8935a]">{order.total.toLocaleString()} {store.storeInfo.currencySymbol}</span>
                  <span className={`text-xs px-3 py-1.5 border rounded-full font-medium ${st.color}`}>{st.label}</span>
                  <button onClick={() => setSelected(selected?.id === order.id ? null : order)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[#b8935a]/30 rounded-full hover:bg-[#b8935a]/10 transition">
                    <Eye size={12} /> التفاصيل
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {selected?.id === order.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="border-t border-[#b8935a]/10 p-5 bg-[#faf6ef]/60">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-[#1a1410] text-sm">📦 المنتجات</h4>
                          {order.items.map((item, i) => (
                            <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-[#b8935a]/10">
                              <img src={item.productImage} alt={item.productName} className="w-14 h-16 object-cover rounded" />
                              <div className="flex-1">
                                <div className="font-medium text-sm text-[#1a1410]">{item.productName}</div>
                                <div className="text-xs text-[#5c4330]">{item.color}</div>
                                <div className="text-xs text-[#5c4330]">الكمية: {item.qty}</div>
                                <div className="text-sm text-[#b8935a] font-display">{(item.price * item.qty).toLocaleString()} {store.storeInfo.currencySymbol}</div>
                              </div>
                            </div>
                          ))}
                          {order.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                              📝 {order.notes}
                            </div>
                          )}
                        </div>
                        {/* Right */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-[#1a1410] text-sm mb-2">📍 معلومات العميلة</h4>
                            <div className="bg-white p-4 rounded-lg border border-[#b8935a]/10 space-y-2 text-sm">
                              <div><span className="text-[#5c4330]">الاسم: </span>{order.customerName}</div>
                              <div><span className="text-[#5c4330]">الهاتف: </span>
                                <a href={`tel:${order.customerPhone}`} className="text-[#b8935a] hover:underline">{order.customerPhone}</a>
                              </div>
                              <div><span className="text-[#5c4330]">المدينة: </span>{order.customerCity}</div>
                              <div><span className="text-[#5c4330]">العنوان: </span>{order.customerAddress}</div>
                              <div><span className="text-[#5c4330]">المجموع: </span><strong className="text-[#b8935a]">{order.total.toLocaleString()} {store.storeInfo.currencySymbol}</strong></div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1a1410] text-sm mb-2">🔄 تغيير الحالة</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
                                <button key={k} onClick={() => handleStatusChange(order.id, k as OrderStatus)}
                                  className={`text-xs py-2.5 px-3 border rounded-lg transition-all font-medium flex items-center gap-1.5 justify-center ${order.status === k ? `${v.color} ring-2 ring-offset-1 ring-[#b8935a]` : `${v.color} opacity-60 hover:opacity-100`}`}>
                                  <v.icon size={12} /> {v.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={`https://wa.me/${order.customerPhone.replace(/^0/, "212")}`} target="_blank" rel="noreferrer"
                              className="flex-1 text-center text-xs py-2.5 bg-[#25D366] text-white rounded-lg hover:bg-[#1da851] transition">
                              📱 واتساب
                            </a>
                            <a href={`tel:${order.customerPhone}`}
                              className="flex-1 text-center text-xs py-2.5 bg-[#1a1410] text-white rounded-lg hover:bg-[#b8935a] transition">
                              📞 اتصال
                            </a>
                            <button onClick={() => { if (confirm("حذف الطلب؟")) { store.deleteOrder(order.id); setSelected(null); onSaved(); } }}
                              className="text-xs py-2.5 px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ STORE TAB ============ */
function StoreTab({ store, onSaved }: { store: any; onSaved: () => void }) {
  const [form, setForm] = useState(store.storeInfo);
  const save = () => { store.updateStoreInfo(form); onSaved(); };
  const u = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl space-y-5">
      <Section title="🏪 هوية البراند">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="اسم البراند"><Input value={form.brandName} onChange={e => u("brandName", e.target.value)} /></Field>
          <Field label="الشعار الفرعي"><Input value={form.brandSub} onChange={e => u("brandSub", e.target.value)} /></Field>
        </div>
      </Section>
      <Section title="🎯 قسم البطل (Hero)">
        <Field label="العنوان (استخدمي \\n للسطر الجديد)"><Textarea value={form.heroTitle} onChange={e => u("heroTitle", e.target.value)} /></Field>
        <Field label="النص الفرعي"><Input value={form.heroSubtitle} onChange={e => u("heroSubtitle", e.target.value)} /></Field>
        <Field label="الوصف"><Textarea value={form.heroDescription} onChange={e => u("heroDescription", e.target.value)} /></Field>
        <Field label="رابط الصورة الرئيسية">
          <Input value={form.heroImage} onChange={e => u("heroImage", e.target.value)} />
          {form.heroImage && <img src={form.heroImage} alt="" className="mt-2 h-36 object-cover rounded" />}
        </Field>
      </Section>
      <Section title="📖 قصتنا">
        <Field label="العنوان"><Textarea value={form.storyTitle} onChange={e => u("storyTitle", e.target.value)} /></Field>
        <Field label="الوصف"><Textarea value={form.storyDescription} onChange={e => u("storyDescription", e.target.value)} /></Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="سنة التأسيس"><Input value={form.storyYear} onChange={e => u("storyYear", e.target.value)} /></Field>
          <Field label="المدينة"><Input value={form.storyCity} onChange={e => u("storyCity", e.target.value)} /></Field>
        </div>
      </Section>
      <Section title="💰 العملة">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="رمز العملة (مثل: د.م أو ر.س)"><Input value={form.currencySymbol} onChange={e => u("currencySymbol", e.target.value)} /></Field>
          <Field label="كود العملة (MAD / SAR)"><Input value={form.currency} onChange={e => u("currency", e.target.value)} /></Field>
        </div>
        <Field label="نص الشريط العلوي"><Textarea value={form.announcementText} onChange={e => u("announcementText", e.target.value)} /></Field>
      </Section>
      <Section title="📞 التواصل">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="الهاتف / واتساب"><Input value={form.phone} onChange={e => u("phone", e.target.value)} /></Field>
          <Field label="رقم واتساب (بدون +)"><Input value={form.whatsapp} onChange={e => u("whatsapp", e.target.value)} placeholder="212612345678" /></Field>
          <Field label="البريد الإلكتروني"><Input value={form.email} onChange={e => u("email", e.target.value)} /></Field>
          <Field label="انستغرام (بدون @)"><Input value={form.instagram} onChange={e => u("instagram", e.target.value)} /></Field>
        </div>
        <Field label="العنوان الكامل"><Textarea value={form.address} onChange={e => u("address", e.target.value)} /></Field>
      </Section>
      <div className="flex justify-end">
        <button onClick={save} className="inline-flex items-center gap-2 px-7 py-3 bg-[#1a1410] text-[#faf6ef] text-xs tracking-[0.2em] uppercase hover:bg-[#b8935a] transition rounded">
          <Save size={14} /> حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

/* ============ PRODUCTS TAB ============ */
function ProductsTab({ store, onSaved }: { store: any; onSaved: () => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const blankProduct: Product = { id: 0, name: "", nameEn: "", price: 0, oldPrice: null, image: "", color: "", tag: null, category: "chevron", stock: 1 };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[#5c4330]">{store.products.length} منتج</p>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b8935a] text-white text-xs tracking-wider rounded hover:bg-[#1a1410] transition">
          <Plus size={14} /> إضافة منتج
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.products.map((p: Product) => (
          <div key={p.id} className="bg-white rounded-xl border border-[#b8935a]/15 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
              {p.tag && <span className="absolute top-3 right-3 bg-[#1a1410] text-[#faf6ef] text-[10px] px-2.5 py-1 rounded">{p.tag}</span>}
              <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded font-bold ${p.stock <= 2 ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>{p.stock} قطعة</span>
            </div>
            <div className="p-4">
              <div className="text-[10px] tracking-widest text-[#b8935a] uppercase">{p.nameEn}</div>
              <div className="font-display text-lg text-[#1a1410]">{p.name}</div>
              <div className="text-xs text-[#5c4330] mb-3">{p.color}</div>
              <div className="flex items-center justify-between">
                <span className="font-display text-[#b8935a]">{p.price.toLocaleString()} {store.storeInfo.currencySymbol}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} className="text-xs px-3 py-1.5 border border-[#b8935a]/30 hover:bg-[#b8935a]/10 rounded transition">تعديل</button>
                  <button onClick={() => { if (confirm(`حذف "${p.name}"؟`)) { store.deleteProduct(p.id); onSaved(); } }}
                    className="text-xs p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(editing || showAdd) && (
        <ProductModal
          product={editing || blankProduct} isNew={!editing}
          currencySymbol={store.storeInfo.currencySymbol}
          onClose={() => { setEditing(null); setShowAdd(false); }}
          onSave={(p) => {
            if (editing) { store.updateProduct(p.id, p); }
            else { const { id, ...rest } = p; store.addProduct(rest); }
            setEditing(null); setShowAdd(false); onSaved();
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, isNew, currencySymbol }: { product: Product; onClose: () => void; onSave: (p: Product) => void; isNew?: boolean; currencySymbol: string }) {
  const [form, setForm] = useState(product);
  const u = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#faf6ef] max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-[#faf6ef] p-5 border-b border-[#b8935a]/20 flex justify-between items-center rounded-t-xl">
          <h3 className="font-display text-xl">{isNew ? "إضافة منتج جديد" : `تعديل: ${form.name}`}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-black/5 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الاسم بالعربي *"><Input value={form.name} onChange={e => u("name", e.target.value)} placeholder="حقيبة صفاء" /></Field>
            <Field label="الاسم بالإنجليزي"><Input value={form.nameEn} onChange={e => u("nameEn", e.target.value)} placeholder="Safaa Bag" /></Field>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label={`السعر (${currencySymbol}) *`}><Input type="number" value={form.price} onChange={e => u("price", Number(e.target.value))} /></Field>
            <Field label="السعر القديم (اختياري)"><Input type="number" value={form.oldPrice ?? ""} onChange={e => u("oldPrice", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="المخزون"><Input type="number" min={0} value={form.stock} onChange={e => u("stock", Number(e.target.value))} /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الفئة">
              <select value={form.category} onChange={e => u("category", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 bg-white focus:outline-none focus:border-[#b8935a] text-sm rounded">
                {[["chevron","شيفرون"],["clutch","كلتش"],["chain","بسلسلة"],["crossbody","كروس"],["classic","كلاسيك"],["pastel","باستيل"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="اللون"><Input value={form.color} onChange={e => u("color", e.target.value)} placeholder="بيج × أزرق" /></Field>
          </div>
          <Field label="الوسم (Tag)"><Input value={form.tag ?? ""} onChange={e => u("tag", e.target.value || null)} placeholder="جديد / الأكثر مبيعاً / محدود" /></Field>
          <Field label="رابط الصورة *"><Input value={form.image} onChange={e => u("image", e.target.value)} placeholder="https://... أو /products/bag.jpg" /></Field>
          {form.image && <img src={form.image} alt="" className="h-36 object-cover rounded-lg" />}
          <div className="flex gap-3 pt-3 border-t border-[#b8935a]/20 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 border border-[#1a1410] text-xs tracking-wider rounded hover:bg-[#1a1410] hover:text-[#faf6ef] transition">إلغاء</button>
            <button onClick={() => onSave(form)} className="px-5 py-2.5 bg-[#1a1410] text-[#faf6ef] text-xs tracking-wider rounded hover:bg-[#b8935a] transition inline-flex items-center gap-2">
              <Save size={13} /> {isNew ? "إضافة" : "حفظ"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============ COLLECTIONS TAB ============ */
function CollectionsTab({ store, onSaved }: { store: any; onSaved: () => void }) {
  return (
    <div className="space-y-4 max-w-3xl">
      {store.collections.map((c: any, i: number) => (
        <Section key={i} title={`المجموعة ${i + 1}: ${c.title}`}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="العنوان بالعربي"><Input value={c.title} onChange={e => { store.updateCollection(i, { title: e.target.value }); onSaved(); }} /></Field>
            <Field label="العنوان بالإنجليزي"><Input value={c.sub} onChange={e => { store.updateCollection(i, { sub: e.target.value }); onSaved(); }} /></Field>
            <Field label="عدد القطع"><Input type="number" value={c.count} onChange={e => { store.updateCollection(i, { count: Number(e.target.value) }); onSaved(); }} /></Field>
          </div>
          <Field label="رابط الصورة"><Input value={c.img} onChange={e => { store.updateCollection(i, { img: e.target.value }); onSaved(); }} /></Field>
          {c.img && <img src={c.img} alt="" className="h-36 object-cover rounded-lg" />}
        </Section>
      ))}
    </div>
  );
}

/* ============ TESTIMONIALS TAB ============ */
function TestimonialsTab({ store, onSaved }: { store: any; onSaved: () => void }) {
  return (
    <div className="space-y-4 max-w-3xl">
      {store.testimonials.map((t: any, i: number) => (
        <Section key={i} title={`شهادة ${i + 1}: ${t.name}`}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الاسم"><Input value={t.name} onChange={e => { store.updateTestimonial(i, { name: e.target.value }); onSaved(); }} /></Field>
            <Field label="المدينة / الدور"><Input value={t.role} onChange={e => { store.updateTestimonial(i, { role: e.target.value }); onSaved(); }} /></Field>
            <Field label="الحرف الأول (Avatar)"><Input value={t.avatar} maxLength={1} onChange={e => { store.updateTestimonial(i, { avatar: e.target.value }); onSaved(); }} /></Field>
            <Field label="التقييم (1-5)"><Input type="number" min={1} max={5} value={t.rating} onChange={e => { store.updateTestimonial(i, { rating: Number(e.target.value) }); onSaved(); }} /></Field>
          </div>
          <Field label="النص"><Textarea value={t.text} onChange={e => { store.updateTestimonial(i, { text: e.target.value }); onSaved(); }} /></Field>
        </Section>
      ))}
    </div>
  );
}

/* ============ CRAFT TAB ============ */
function CraftTab({ store, onSaved }: { store: any; onSaved: () => void }) {
  return (
    <div className="space-y-4 max-w-3xl">
      {store.craftSteps.map((s: any, i: number) => (
        <Section key={i} title={`المرحلة ${i + 1}: ${s.title}`}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الرقم"><Input value={s.num} onChange={e => { store.updateCraftStep(i, { num: e.target.value }); onSaved(); }} /></Field>
            <Field label="العنوان"><Input value={s.title} onChange={e => { store.updateCraftStep(i, { title: e.target.value }); onSaved(); }} /></Field>
          </div>
          <Field label="الوصف"><Textarea value={s.desc} onChange={e => { store.updateCraftStep(i, { desc: e.target.value }); onSaved(); }} /></Field>
          <Field label="رابط الصورة"><Input value={s.img} onChange={e => { store.updateCraftStep(i, { img: e.target.value }); onSaved(); }} /></Field>
          {s.img && <img src={s.img} alt="" className="h-36 object-cover rounded-lg" />}
        </Section>
      ))}
    </div>
  );
}
