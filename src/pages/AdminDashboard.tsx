import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadFile, BUCKETS } from '../lib/supabase';
import { logout } from '../lib/useAuth';
import {
  X, Package, Settings, Save, Trash2, Plus,
  LogOut, Lock, Check, AlertCircle, Image as ImageIcon
} from 'lucide-react';

type Tab = 'products' | 'settings' | 'password';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'products', label: '📦 المنتجات', icon: Package },
  { id: 'settings', label: '⚙️ إعدادات الموقع', icon: Settings },
  { id: 'password', label: '🔐 تغيير كلمة المرور', icon: Lock },
];

interface Product {
  id: string;
  name: string;
  name_en: string;
  price: number;
  old_price: number | null;
  image_url: string;
  color: string;
  tag: string | null;
  category: string;
  stock: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<any>({
    brand: { name: 'SAFOS', subtitle: 'Embroidered Atelier', logo_letter: 'S' },
    contact: { phone: '', email: '', address: '', instagram: '', facebook: '' }
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      showMessage('error', 'فشل تحميل المنتجات');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function loadSettings() {
    const { data, error } = await supabase.from('store_settings').select('*');
    if (!error && data) {
      const settingsObj: any = {};
      data.forEach((row: any) => {
        settingsObj[row.key] = row.value;
      });
      setSettings(settingsObj);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  // Product Functions
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    const { error } = editingProduct.id
      ? await supabase.from('products').update({
          name: editingProduct.name,
          name_en: editingProduct.name_en,
          price: editingProduct.price,
          old_price: editingProduct.old_price,
          image_url: editingProduct.image_url,
          color: editingProduct.color,
          tag: editingProduct.tag,
          category: editingProduct.category,
          stock: editingProduct.stock,
        }).eq('id', editingProduct.id)
      : await supabase.from('products').insert([{
          name: editingProduct.name,
          name_en: editingProduct.name_en,
          price: editingProduct.price,
          old_price: editingProduct.old_price,
          image_url: editingProduct.image_url,
          color: editingProduct.color,
          tag: editingProduct.tag,
          category: editingProduct.category,
          stock: editingProduct.stock,
        }]);

    if (error) {
      showMessage('error', 'فشل حفظ المنتج');
    } else {
      showMessage('success', 'تم حفظ المنتج بنجاح');
      setShowProductForm(false);
      setEditingProduct(null);
      loadProducts();
    }
    setLoading(false);
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      showMessage('error', 'فشل حذف المنتج');
    } else {
      showMessage('success', 'تم حذف المنتج');
      loadProducts();
    }
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'الرجاء اختيار ملف صورة');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'حجم الصورة يجب أن يكون أقل من 2MB');
      return;
    }

    setLoading(true);
    const fileName = `product-${Date.now()}-${file.name}`;
    const { url, error } = await uploadFile(BUCKETS.PRODUCT_IMAGES, file, fileName);

    if (error || !url) {
      showMessage('error', 'فشل رفع الصورة');
    } else {
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, image_url: url });
      }
      showMessage('success', 'تم رفع الصورة بنجاح');
    }
    setLoading(false);
  }

  // Settings Functions
  async function handleSaveSettings() {
    setLoading(true);
    
    // Save each setting key
    for (const key of Object.keys(settings)) {
      const { error } = await supabase.from('store_settings').upsert({
        key,
        value: settings[key],
        updated_at: new Date().toISOString()
      });
      if (error) {
        showMessage('error', `فشل حفظ ${key}`);
        setLoading(false);
        return;
      }
    }

    // Upload logo if selected
    if (logoFile) {
      const fileName = `logo-${Date.now()}-${logoFile.name}`;
      const { url, error } = await uploadFile(BUCKETS.LOGOS, logoFile, fileName);
      if (!error && url) {
        setSettings({ ...settings, brand: { ...settings.brand, logo_url: url } });
      }
    }

    showMessage('success', 'تم حفظ الإعدادات بنجاح');
    setLoading(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'الرجاء اختيار ملف صورة');
      return;
    }

    setLogoFile(file);
    showMessage('success', 'تم اختيار الشعار، اضغط حفظ لتطبيقه');
  }

  // Password Functions
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      showMessage('error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      // First sign in with current password to verify
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@safos.ma',
        password: currentPassword
      });

      if (signInError) throw signInError;

      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      showMessage('success', 'تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showMessage('error', err.message || 'فشل تغيير كلمة المرور');
    }
    setLoading(false);
  }



  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Top Bar */}
      <div className="bg-[#1a1410] text-[#faf6ef] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#b8935a] flex items-center justify-center">
            <span className="font-display text-[#b8935a] text-lg font-bold">S</span>
          </div>
          <div>
            <div className="font-display text-lg tracking-[0.2em]">SAFOS</div>
            <div className="text-[9px] tracking-[0.2em] text-[#b8935a] uppercase">Admin Panel</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-white/10 rounded-lg transition">
          <LogOut size={14} /> خروج
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-l border-[#b8935a]/10 min-h-screen">
          <nav className="p-4 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-[#b8935a] text-[#1a1410] font-semibold'
                    : 'text-[#5c4330] hover:bg-[#b8935a]/10'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl text-[#1a1410]">إدارة المنتجات</h2>
                <button
                  onClick={() => {
                    setEditingProduct({
                      id: '', name: '', name_en: '', price: 0, old_price: null,
                      image_url: '', color: '', tag: null, category: 'chevron', stock: 0
                    });
                    setShowProductForm(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#b8935a] text-white text-xs tracking-wider rounded-lg hover:bg-[#1a1410] transition"
                >
                  <Plus size={14} /> إضافة منتج
                </button>
              </div>

              {loading && <div className="text-center py-12 text-[#5c4330]">جاري التحميل...</div>}

              {!loading && products.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-[#b8935a]/10">
                  <Package size={48} className="mx-auto mb-4 text-[#b8935a]/40" />
                  <p className="text-[#5c4330]">لا توجد منتجات</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border border-[#b8935a]/10 overflow-hidden shadow-sm">
                    <div className="aspect-square bg-[#e8dcc4] relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#b8935a]/40">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      {product.tag && (
                        <span className="absolute top-3 right-3 bg-[#1a1410] text-[#faf6ef] text-[10px] px-2.5 py-1 rounded">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] tracking-widest text-[#b8935a] uppercase mb-1">{product.name_en}</div>
                      <div className="font-display text-lg text-[#1a1410] mb-1">{product.name}</div>
                      <div className="text-xs text-[#5c4330] mb-2">{product.color}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[#b8935a]">{product.price} د.م</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            className="text-xs px-3 py-1.5 border border-[#b8935a]/30 hover:bg-[#b8935a]/10 rounded transition"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Form Modal */}
              {showProductForm && editingProduct && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowProductForm(false)}>
                  <div className="bg-[#faf6ef] max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-[#faf6ef] p-5 border-b border-[#b8935a]/20 flex justify-between items-center">
                      <h3 className="font-display text-xl">{editingProduct.id ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
                      <button onClick={() => setShowProductForm(false)} className="w-9 h-9 flex items-center justify-center hover:bg-black/5 rounded-full">
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">الاسم بالعربية *</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">الاسم بالإنجليزي *</label>
                          <input
                            type="text"
                            value={editingProduct.name_en}
                            onChange={e => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">السعر (د.م) *</label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">السعر القديم</label>
                          <input
                            type="number"
                            value={editingProduct.old_price || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, old_price: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">المخزون</label>
                          <input
                            type="number"
                            value={editingProduct.stock}
                            onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">الفئة</label>
                          <select
                            value={editingProduct.category}
                            onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                          >
                            <option value="chevron">شيفرون</option>
                            <option value="clutch">كلتش</option>
                            <option value="chain">بسلسلة</option>
                            <option value="crossbody">كروس</option>
                            <option value="classic">كلاسيك</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#5c4330] mb-1.5 block">اللون</label>
                          <input
                            type="text"
                            value={editingProduct.color}
                            onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#5c4330] mb-1.5 block">الوسم (Tag)</label>
                        <input
                          type="text"
                          value={editingProduct.tag || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, tag: e.target.value || null })}
                          className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                          placeholder="جديد / الأكثر مبيعاً / محدود"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#5c4330] mb-1.5 block">صورة المنتج</label>
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProductImageUpload}
                              disabled={loading}
                              className="w-full px-4 py-2.5 border border-[#b8935a]/25 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#b8935a] file:text-[#faf6ef]"
                            />
                            {loading && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                <div className="w-5 h-5 border-2 border-[#b8935a]/30 border-t-[#b8935a] rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          {editingProduct.image_url && (
                            <div className="relative">
                              <img src={editingProduct.image_url} alt="Product" className="h-48 w-full object-cover rounded-lg border" />
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, image_url: '' })}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-[#b8935a]/20 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowProductForm(false)}
                          className="px-5 py-2.5 border border-[#1a1410] text-xs tracking-wider rounded-lg hover:bg-[#1a1410] hover:text-[#faf6ef] transition"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-5 py-2.5 bg-[#1a1410] text-[#faf6ef] text-xs tracking-wider rounded-lg hover:bg-[#b8935a] transition inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save size={13} /> {editingProduct.id ? 'حفظ التعديلات' : 'إضافة منتج'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl text-[#1a1410] mb-6">إعدادات الموقع</h2>
              
              <div className="bg-white rounded-xl border border-[#b8935a]/10 p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-[#1a1410] mb-4">معلومات البراند</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#5c4330] mb-1.5 block">اسم البراند</label>
                      <input
                        type="text"
                        value={settings.brand?.name || ''}
                        onChange={e => setSettings({ ...settings, brand: { ...settings.brand, name: e.target.value } })}
                        className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#5c4330] mb-1.5 block">الشعار الفرعي</label>
                      <input
                        type="text"
                        value={settings.brand?.subtitle || ''}
                        onChange={e => setSettings({ ...settings, brand: { ...settings.brand, subtitle: e.target.value } })}
                        className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1a1410] mb-4">رفع الشعار (Logo)</h3>
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 border-2 border-[#b8935a]/30 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                      {settings.brand?.logo_url ? (
                        <img src={settings.brand.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="text-4xl text-[#b8935a]/40">👜</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-4 py-2.5 border border-[#b8935a]/25 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#b8935a] file:text-[#faf6ef]"
                      />
                      {logoFile && (
                        <p className="text-xs text-[#5c4330] mt-2">
                          تم اختيار: {logoFile.name} - اضغط حفظ لتطبيقه
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1a1410] mb-4">معلومات التواصل</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#5c4330] mb-1.5 block">الهاتف</label>
                      <input
                        type="text"
                        value={settings.contact?.phone || ''}
                        onChange={e => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
                        className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#5c4330] mb-1.5 block">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={settings.contact?.email || ''}
                        onChange={e => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                        className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#5c4330] mb-1.5 block">العنوان</label>
                      <input
                        type="text"
                        value={settings.contact?.address || ''}
                        onChange={e => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })}
                        className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#5c4330] mb-1.5 block">انستغرام</label>
                      <input
                        type="text"
                        value={settings.contact?.instagram || ''}
                        onChange={e => setSettings({ ...settings, contact: { ...settings.contact, instagram: e.target.value } })}
                        className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                        placeholder="safos.bags"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#b8935a]/20">
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="px-6 py-3 bg-[#1a1410] text-[#faf6ef] text-xs tracking-wider rounded-lg hover:bg-[#b8935a] transition inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={13} /> حفظ الإعدادات
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="max-w-xl">
              <h2 className="font-display text-2xl text-[#1a1410] mb-6">تغيير كلمة المرور</h2>
              
              <div className="bg-white rounded-xl border border-[#b8935a]/10 p-6">
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="text-xs text-[#5c4330] mb-1.5 block">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5c4330] mb-1.5 block">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5c4330] mb-1.5 block">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#b8935a]/25 rounded-lg focus:outline-none focus:border-[#b8935a] text-sm"
                      required
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex gap-2 text-xs text-amber-800">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>ملاحظات مهمة:</strong>
                        <ul className="mt-1.5 space-y-1">
                          <li>• كلمة المرور يجب أن تكون 6 أحرف على الأقل</li>
                          <li>• احفظ كلمة المرور الجديدة في مكان آمن</li>
                          <li>• لا يمكن استرجاعها في حال نسيانها</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#b8935a]/20">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-[#1a1410] text-[#faf6ef] text-xs tracking-wider rounded-lg hover:bg-[#b8935a] transition inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <Lock size={13} /> تغيير كلمة المرور
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
