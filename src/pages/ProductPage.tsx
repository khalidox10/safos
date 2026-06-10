import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { 
  Star, Heart, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, X, 
  Phone, MapPin, User, CheckCircle, AlertCircle, ShoppingBag, Globe, Play 
} from 'lucide-react';

const translations = {
  ar: {
    thankYou: "تم تسجيل طلبكِ بنجاح، سنتواصل معكِ قريباً لتأكيد طلبيتك",
    orderSuccess: "شكراً لثقتكم بـ SAFOS",
    atc: "إضافة إلى السلة",
    buyNow: "اضغطي هنا لتأكيد الطلب السريع",
    dimensions: "مقاسات الحقيبة الدقيقة",
    care: "دليل العناية بالحقيبة والغسيل",
    description: "الوصف والتفاصيل",
    color: "الألوان المتوفرة",
    quantity: "الكمية",
    checkoutTitle: "إدخال معلومات الشحن (الدفع عند الاستلام)",
    fullName: "الاسم الكامل *",
    phone: "رقم الهاتف المغربي (10 أرقام) *",
    city: "المدينة وعنوان الشحن *",
    address: "العنوان بالتفصيل *",
    notes: "ملاحظات إضافية (اختياري)",
    phoneError: "يرجى التأكد من رقم الهاتف، يجب أن يتكون من 10 أرقام.",
    fieldsError: "الرجاء ملء جميع الحقول المطلوبة.",
    secTitle: "لماذا تختارين SAFOS؟",
    freeShipping: "شحن مجاني وسريع",
    warranty: "جودة يدوية مضمونة",
    reviewsTitle: "آراء وتجارب العميلات الفعليات",
    total: "المجموع"
  },
  fr: { /* ... نفس الترجمات السابقة ... */ },
  en: { /* ... نفس الترجمات السابقة ... */ }
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, settings, loading: storeLoading } = useStore();

  const [product, setProduct] = useState<any | null>(null);
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQty] = useState<number>(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [openAccordion, setOpenAccordion] = useState<'desc' | 'dims' | 'care' | null>('desc');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('safos-lang');
    if (savedLang) setLang(savedLang as any);
  }, []);

  useEffect(() => {
    if (products.length > 0 && id) {
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setActiveImage(found.image_url);
        fetchProductReviews(found.id);
      }
    }
  }, [products, id]);

  const fetchProductReviews = async (productId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).eq('is_approved', true);
    setReviews(data || []);
  };

  const scrollToCheckoutForm = () => {
    const element = document.getElementById('checkout-form');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name || !phone || !city || !address) {
      setErrorMessage(translations[lang].fieldsError);
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage(translations[lang].phoneError);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: name, customer_phone: cleanPhone, customer_city: city,
        customer_address: address, total: product.price * quantity,
        status: 'pending', items: [{ product_name: product.name, price: product.price, qty: quantity }],
        notes: notes
      }]);
      if (error) throw error;
      alert(translations[lang].thankYou);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (storeLoading || !product) return <div className="min-h-screen bg-[#070707]" />;
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-6 border-b border-neutral-900 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-[#D4AF37] cursor-pointer" onClick={() => navigate('/')}>SAFOS</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* العمود الأيسر: الصور */}
        <div>
          <img src={activeImage} alt={product.name} className="w-full aspect-[4/5] object-cover rounded-3xl border border-neutral-900" />
        </div>

        {/* العمود الأيمن: تفاصيل المنتج + النموذج الذهبي الجديد */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-2xl text-[#D4AF37]">{product.price.toLocaleString()} درهم</p>

          {/* النموذج الذهبي الجديد */}
          <div className="bg-[#0F0F0F] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <h3 className="text-lg font-bold text-white">{t.checkoutTitle}</h3>
            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <input type="text" placeholder={t.fullName} onChange={(e) => setName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              <input type="tel" placeholder={t.phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              <input type="text" placeholder={t.city} onChange={(e) => setCity(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              <input type="text" placeholder={t.address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#D4AF37] hover:bg-[#C5A028] text-black py-4 rounded-xl text-md font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95"
              >
                {isSubmitting ? 'جاري الإرسال...' : t.buyNow}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* الأكورديون والمراجعات كما كانت */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-neutral-900">
        <button onClick={() => setOpenAccordion('desc')} className="w-full flex justify-between p-4 bg-neutral-900 rounded-lg">
          {t.description} <span>{openAccordion === 'desc' ? '-' : '+'}</span>
        </button>
        {openAccordion === 'desc' && <p className="p-4 text-gray-400">{product.description}</p>}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <h3 className="text-xl font-bold mb-6">{t.reviewsTitle}</h3>
        {reviews.map((rev) => (
          <div key={rev.id} className="p-4 bg-neutral-900 rounded-xl mb-2">
            <p className="text-sm">{rev.comment}</p>
            <span className="text-[#D4AF37] font-bold text-xs">{rev.customer_name}</span>
          </div>
        ))}
      </section>
    </div>
  );
};
if (storeLoading || !product) return <div className="min-h-screen bg-[#070707]" />;
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-6 border-b border-neutral-900 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-[#D4AF37] cursor-pointer" onClick={() => navigate('/')}>SAFOS</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* العمود الأيسر: الصور */}
        <div>
          <img src={activeImage} alt={product.name} className="w-full aspect-[4/5] object-cover rounded-3xl border border-neutral-900" />
        </div>

        {/* العمود الأيمن: تفاصيل المنتج + النموذج الذهبي الجديد */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-2xl text-[#D4AF37]">{product.price.toLocaleString()} درهم</p>

          {/* النموذج الذهبي الجديد */}
          <div className="bg-[#0F0F0F] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <h3 className="text-lg font-bold text-white">{t.checkoutTitle}</h3>
            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <input type="text" placeholder={t.fullName} onChange={(e) => setName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              <input type="tel" placeholder={t.phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              <input type="text" placeholder={t.city} onChange={(e) => setCity(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              <input type="text" placeholder={t.address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" />
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#D4AF37] hover:bg-[#C5A028] text-black py-4 rounded-xl text-md font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95"
              >
                {isSubmitting ? 'جاري الإرسال...' : t.buyNow}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* الأكورديون والمراجعات كما كانت */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-neutral-900">
        <button onClick={() => setOpenAccordion('desc')} className="w-full flex justify-between p-4 bg-neutral-900 rounded-lg">
          {t.description} <span>{openAccordion === 'desc' ? '-' : '+'}</span>
        </button>
        {openAccordion === 'desc' && <p className="p-4 text-gray-400">{product.description}</p>}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <h3 className="text-xl font-bold mb-6">{t.reviewsTitle}</h3>
        {reviews.map((rev) => (
          <div key={rev.id} className="p-4 bg-neutral-900 rounded-xl mb-2">
            <p className="text-sm">{rev.comment}</p>
            <span className="text-[#D4AF37] font-bold text-xs">{rev.customer_name}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
