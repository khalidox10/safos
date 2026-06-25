import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics/facebook';
import { 
  Star, Heart, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, X, 
  Phone, MapPin, User, CheckCircle, AlertCircle, ShoppingBag, Globe, Play 
} from 'lucide-react';

const translations = {
  ar: {
    thankYou: "لقد تلقينا طلبك بنجاح، وسنتواصل معك قريباً لتأكيد طلبكم",
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
    phoneError: "يرجى التأكد من رقم الهاتف، يجب أن يتكون من 10 أرقام ويتبعه مقدمة مغربية (مثال: 0612345678).",
    fieldsError: "الرجاء ملء جميع الحقول المطلوبة.",
    secTitle: "لماذا تختارين SAFOS؟",
    freeShipping: "شحن مجاني وسريع",
    warranty: "جودة يدوية مضمونة",
    reviewsTitle: "آراء وتجارب العميلات الفعليات",
    total: "المجموع"
  },
  fr: {
    thankYou: "Votre commande a été enregistrée avec succès, nous vous contacterons bientôt pour confirmer votre commande.",
    orderSuccess: "Merci pour votre confiance en SAFOS",
    atc: "Ajouter au panier",
    buyNow: "Confirmer la commande rapide",
    dimensions: "Dimensions de l'article",
    care: "Guide d'entretien & Lavage",
    description: "Description & Détails",
    color: "Couleurs disponibles",
    quantity: "Quantité",
    checkoutTitle: "Informations de livraison (Paiement à la livraison)",
    fullName: "Nom complet *",
    phone: "Téléphone (10 chiffres) *",
    city: "Ville de livraison *",
    address: "Adresse complète *",
    notes: "Notes supplémentaires",
    phoneError: "Veuillez vérifier votre numéro de téléphone (10 chiffres. Ex: 0612345678).",
    fieldsError: "Veuillez remplir tous les champs obligatoires.",
    secTitle: "Pourquoi choisir SAFOS ?",
    freeShipping: "Livraison gratuite et rapide",
    warranty: "Qualité artisanale garantie",
    reviewsTitle: "Avis de nos clientes",
    total: "Total"
  },
  en: {
    thankYou: "Your order has been registered successfully, we will contact you soon to confirm your order.",
    orderSuccess: "Thank you for your trust in SAFOS",
    atc: "Add to Bag",
    buyNow: "Confirm Fast Order",
    dimensions: "Precise Dimensions",
    care: "Bag Care & Washing Guide",
    description: "Description & Details",
    color: "Available Colors",
    quantity: "Quantity",
    checkoutTitle: "Shipping Details (Cash on Delivery)",
    fullName: "Full Name *",
    phone: "Phone Number (10 digits) *",
    city: "City *",
    address: "Detailed Address *",
    notes: "Order Notes (Optional)",
    phoneError: "Please verify your phone number. It must contain 10 digits (Ex: 0612345678).",
    fieldsError: "Please fill in all required fields.",
    secTitle: "Why choose SAFOS?",
    freeShipping: "Free & Fast Shipping",
    warranty: "Guaranteed Handmade Quality",
    reviewsTitle: "Customer Reviews",
    total: "Total"
  }
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

  // جلب التقييمات الحية
  const [reviews, setReviews] = useState<any[]>([]);

  // حالات فتح الأكورديون
  const [openAccordion, setOpenAccordion] = useState<'desc' | 'dims' | 'care' | null>('desc');

  // نموذج الطلب
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // حالات نجاح الطلب والأخطاء
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // الكشف التلقائي عن اللغة من الهاتف/المتصفح
  useEffect(() => {
    const savedLang = localStorage.getItem('safos-lang');
    if (savedLang === 'ar' || savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang as any);
    } else {
      const userLang = navigator.language || (navigator as any).userLanguage || '';
      if (userLang.startsWith('ar')) {
        setLang('ar');
      } else if (userLang.startsWith('fr')) {
        setLang('fr');
      } else {
        setLang('en');
      }
    }
  }, []);

  const handleLangChange = (newLang: 'ar' | 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('safos-lang', newLang);
  };

  // 📥 جلب الخطوط حياً
  useEffect(() => {
    const titleFont = settings.colors?.title_font || 'Playfair Display';
    const bodyFont = settings.colors?.body_font || 'Montserrat';
    const linkId = 'safos-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(titleFont)}:wght@300;400;700&family=${encodeURIComponent(bodyFont)}:wght@300;400;500;700&display=swap`;
  }, [settings]);

 useEffect(() => {
  if (products.length > 0 && id) {
    const found = products.find(p => p.id === id);

    if (found) {
      setProduct(found);
      setActiveImage(found.image_url);
      fetchProductReviews(found.id);

      // 🔵 Meta Pixel - ViewContent
      track("ViewContent", {
        content_name: found.name,
        content_ids: [found.id],
        content_type: "product",
        value: found.price,
        currency: "MAD",
      });
    }
  }
}, [products, id]);

  const fetchProductReviews = async (productId: string) => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const toggleAccordion = (section: 'desc' | 'dims' | 'care') => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // 🟢 ميزة الهبوط الانسيابي والسلس للأسفل عند الضغط على "اطلبي الآن"
  const scrollToCheckoutForm = () => {
    const element = document.getElementById('checkout-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // معالجة وفحص رقم الهاتف بدقة بـ 10 أرقام مغربية قبل إرسال الطلب
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !phone || !city || !address) {
      setErrorMessage(translations[lang].fieldsError);
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10 || !['05', '06', '07'].includes(cleanPhone.substring(0, 2))) {
      setErrorMessage(translations[lang].phoneError);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `SAF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('orders').insert([{
        order_number: orderNumber,
        customer_name: name,
        customer_phone: cleanPhone,
        customer_city: city,
        customer_address: address,
        total: product.price * quantity,
        status: 'pending',
        payment_status: 'unpaid',
        items: [{
          id: product.id,
          product_name: product.name,
          price: product.price,
          qty: quantity
        }],
        notes: notes
      }]);

      if (error) throw error;
      setOrderSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (storeLoading || !product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const t = translations[lang];

  // تصفية وحساب الألوان والخطوط الحية
  const primaryTheme = settings.colors?.primary || '#0A0A0A';
  const secondaryTheme = settings.colors?.secondary || '#D4AF37';
  const titleColor = settings.colors?.title_color || '#FFFFFF';
  const textColor = settings.colors?.text_color || '#A1A1AA';
  const cardBgColor = settings.colors?.card_bg || '#0F0F0F';
  const accordionBgColor = settings.colors?.accordion_bg || '#0F0F0F';
  const imageBgColor = settings.colors?.image_bg || '#0F0F0F';
  const titleFont = settings.colors?.title_font || 'Playfair Display, sans-serif';
  const bodyFont = settings.colors?.body_font || 'Montserrat, sans-serif';

  return (
    <div 
      style={{
        '--primary-theme': primaryTheme,
        '--secondary-theme': secondaryTheme,
        '--title-color': titleColor,
        '--text-color': textColor,
        '--card-bg-theme': cardBgColor,
        '--accordion-bg-theme': accordionBgColor,
        '--image-bg-theme': imageBgColor,
        '--title-font': titleFont,
        '--body-font': bodyFont
      } as React.CSSProperties}
      className="min-h-screen antialiased selection:bg-amber-500/30"
      style={{ fontFamily: 'var(--body-font)', backgroundColor: 'var(--primary-theme)' }}
    >
      
      {/* هيدر مبسط يحتوي على أزرار تبديل اللغة واللوجو كصورة مجهزة بمشروعك */}
      <header className="p-6 border-b border-zinc-900 flex justify-between items-center max-w-7xl mx-auto">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          {settings.brand?.logo_url ? (
            <img src={settings.brand.logo_url} alt="SAFOS Logo" className="h-12 w-12 rounded-full object-cover border shadow-md" style={{ borderColor: 'var(--secondary-theme)' }} />
          ) : (
            <h1 className="text-xl font-bold tracking-[0.2em] cursor-pointer" style={{ color: 'var(--secondary-theme)', fontFamily: 'var(--title-font)' }} onClick={() => navigate('/')}>SAFOS</h1>
          )}
        </div>
        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
          <button onClick={() => handleLangChange('ar')} className={`py-1 px-3.5 text-xs rounded-lg transition-all ${lang === 'ar' ? 'text-black font-bold' : 'text-zinc-400'}`}>العربية</button>
          <button onClick={() => handleLangChange('fr')} className={`py-1 px-3.5 text-xs rounded-lg transition-all ${lang === 'fr' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400'}`}>FR</button>
          <button onClick={() => handleLangChange('en')} className={`py-1 px-3.5 text-xs rounded-lg transition-all ${lang === 'en' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400'}`}>EN</button>
        </div>
      </header>

      {/* المحتوى ثنائي الأعمدة لصفحة المنتج */}
      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* العمود الأيسر: معرض الصور والفيديو الفاخر */}
        <div className="space-y-4">
          <div className="w-full aspect-[4/5] border rounded-3xl overflow-hidden relative shadow-lg" style={{ backgroundColor: 'var(--image-bg-theme)', borderColor: 'border-zinc-900/60' }}>
            {isVideoPlaying && product.video_url ? (
              <iframe 
                src={product.video_url} 
                className="w-full h-full" 
                title={product.name} 
                allow="autoplay; encrypted-media" 
                allowFullScreen
              />
            ) : (
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            )}
            {/* زر تشغيل الفيديو الفاخر */}
            {product.video_url && !isVideoPlaying && product.show_video && (
              <button 
                onClick={() => setIsVideoPlaying(true)} 
                className="absolute inset-0 m-auto w-16 h-16 bg-black/60 hover:bg-[#D4AF37] text-white hover:text-black rounded-full flex items-center justify-center shadow-2xl transition-all"
              >
                <Play size={24} className="ml-1" />
              </button>
            )}
          </div>

          {/* المعرض الفرعي للصور المصغرة */}
          {product.show_gallery && (
            <div className="flex space-x-2 space-x-reverse overflow-x-auto py-2">
              <button 
                onClick={() => { setActiveImage(product.image_url); setIsVideoPlaying(false); }}
                className={`w-20 aspect-square rounded-xl overflow-hidden border bg-zinc-950 flex-shrink-0 transition-all ${activeImage === product.image_url && !isVideoPlaying ? 'border-[#D4AF37]' : 'border-zinc-900 hover:border-zinc-800'}`}
              >
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </button>
              {product.additional_images && Array.isArray(product.additional_images) && product.additional_images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => { setActiveImage(img); setIsVideoPlaying(false); }}
                  className={`w-20 aspect-square rounded-xl overflow-hidden border bg-zinc-950 flex-shrink-0 transition-all ${activeImage === img && !isVideoPlaying ? 'border-[#D4AF37]' : 'border-zinc-900 hover:border-zinc-800'}`}
                >
                  <img src={img} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* العمود الأيمن: تفاصيل المنتج وأزرار الطلب السريع والأكورديون */}
        <div className="space-y-6 text-right">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500">{settings.brand?.name_ar || 'SAFOS'} • {settings.brand?.subtitle_ar || 'Atelier'}</span>
            <h1 className="text-3xl font-light tracking-wide mt-1" style={{ fontFamily: 'var(--title-font)', color: 'var(--title-color)' }}>
              {lang === 'ar' ? product.name : lang === 'fr' ? product.name_fr : product.name_en}
            </h1>
            <div className="mt-3 text-2xl font-light" style={{ color: 'var(--secondary-theme, #D4AF37)' }}>
              {product.price.toLocaleString()} {lang === 'ar' ? settings.contact?.currency_symbol : settings.contact?.currency}
            </div>
          </div>

          {/* محدد الألوان */}
          <div className="border-t border-zinc-900 pt-6">
            {product.color && (
              <div>
                <span className="text-xs text-zinc-500 block mb-2">{t.color}:</span>
                <span className="text-xs bg-zinc-900 py-1.5 px-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium">{product.color}</span>
              </div>
            )}
          </div>

          {/* 🟢 زر الشراء المجهز بالانزلاق السلس والناعم للأسفل (Smooth Scroll) */}
          <div className="space-y-3 pt-4 border-t border-zinc-900">
            <button 
              onClick={scrollToCheckoutForm}
              className="w-full py-4 text-black font-semibold rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-all text-sm shadow-lg transform hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--secondary-theme, #D4AF37)' }}
            >
              <ShoppingBag size={18} />
              <span>{t.buyNow}</span>
            </button>
          </div>

          {/* الأكورديون المطوي والمقاد بالكامل من لوحة التحكم */}
          <div className="border-t border-zinc-900 pt-6 space-y-2">
            
            {/* 1. الوصف */}
            <div className="border-b border-zinc-900 pb-3">
              <button onClick={() => toggleAccordion('desc')} className="w-full flex justify-between items-center text-sm font-light text-zinc-300 hover:text-zinc-100">
                <span>{t.description}</span>
                <span className="text-zinc-500">{openAccordion === 'desc' ? '-' : '+'}</span>
              </button>
              {openAccordion === 'desc' && (
                <p className="mt-3 text-xs leading-relaxed font-light animate-fadeIn" style={{ color: 'var(--text-color)' }}>
                  {lang === 'ar' ? product.description : lang === 'fr' ? product.description_fr : product.description_en}
                </p>
              )}
            </div>

            {/* 2. المقاسات */}
            {product.show_dimensions && product.materials_dimensions && (
              <div className="border-b border-zinc-900 pb-3">
                <button onClick={() => toggleAccordion('dims')} className="w-full flex justify-between items-center text-sm font-light text-zinc-300 hover:text-zinc-100">
                  <span>{t.dimensions}</span>
                  <span className="text-zinc-500">{openAccordion === 'dims' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'dims' && (
                  <p className="mt-3 text-xs leading-relaxed font-light animate-fadeIn" style={{ color: 'var(--text-color)' }}>
                    {lang === 'ar' ? product.materials_dimensions : lang === 'fr' ? product.materials_dimensions_en : product.materials_dimensions_en}
                  </p>
                )}
              </div>
            )}

            {/* 3. دليل العناية بالحقيبة الكانفاس لتفادي البقع */}
            {product.show_care_guide && product.care_guide && (
              <div className="border-b border-zinc-900 pb-3">
                <button onClick={() => toggleAccordion('care')} className="w-full flex justify-between items-center text-sm font-light text-zinc-300 hover:text-zinc-100">
                  <span>{t.careGuide}</span>
                  <span className="text-zinc-500">{openAccordion === 'care' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'care' && (
                  <p className="mt-3 text-xs leading-relaxed font-light animate-fadeIn" style={{ color: 'var(--text-color)' }}>
                    {lang === 'ar' ? product.care_guide : lang === 'fr' ? product.care_guide_fr : product.care_guide_en}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* قسم إدخال معلومات الشحن والتحقق من رقم الهاتف بدقة لـ COD المغرب */}
      {/* 🛠️ تعديل: جعل خلفية الاستمارة والخانات بيضاء أنيقة تماماً وتوضيح النصوص لسهولة القراءة */}
      <section id="checkout-form" className="bg-zinc-950 border-t border-b border-zinc-900 py-12 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-zinc-200/80 shadow-2xl text-zinc-900 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-zinc-950">{t.checkoutTitle}</h3>
            <p className="text-xs text-zinc-600 mt-1">تعبئة البيانات تأخذ أقل من دقيقة، التوصيل مجاني لجميع المدن المغربية</p>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2 space-x-reverse animate-shake">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-700 font-semibold block mb-1.5">{t.fullName}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="لالة فاطمة العمراني" 
                  className="w-full bg-white text-zinc-900 border border-zinc-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-zinc-400" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-700 font-semibold block mb-1.5">{t.phone}</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                  placeholder="0612345678" 
                  className="w-full bg-white text-zinc-900 border border-zinc-300 p-3 rounded-xl text-sm font-mono focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-zinc-400" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-700 font-semibold block mb-1.5">{t.city}</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required
                  placeholder="الدار البيضاء، مراكش، طنجة..." 
                  className="w-full bg-white text-zinc-900 border border-zinc-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-zinc-400" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-700 font-semibold block mb-1.5">{t.address}</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required
                  placeholder="الحي، رقم الدار والشارع..." 
                  className="w-full bg-white text-zinc-900 border border-zinc-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-zinc-400" 
                />
              </div>
            </div>

            {/* ميزة تحديد الكمية وسعر المجموع بتصميم رمادي أنيق هادئ يتناسب مع الخلفية البيضاء */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border border-zinc-200 p-4 rounded-2xl bg-zinc-50">
              <div className="flex items-center space-x-4 space-x-reverse justify-end">
                <span className="text-xs text-zinc-500 font-semibold">{t.quantity}:</span>
                <div className="flex items-center bg-white border border-zinc-200 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setQty(Math.max(1, quantity - 1))} className="px-3.5 py-2 hover:bg-zinc-100 text-zinc-500 font-bold">-</button>
                  <span className="px-4 font-mono text-sm text-zinc-800 font-bold">{quantity}</span>
                  <button type="button" onClick={() => setQty(quantity + 1)} className="px-3.5 py-2 hover:bg-zinc-100 text-zinc-500 font-bold">+</button>
                </div>
              </div>
              <div className="text-left text-sm font-semibold" style={{ color: 'var(--secondary-theme, #D4AF37)' }}>
                <span>{t.total}: </span>
                <span className="font-mono font-bold text-lg">{(product.price * quantity).toLocaleString()}</span>
                <span> درهم</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-700 font-semibold block mb-1.5">{t.notes}</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="مثال: يفضل التوصيل بعد الساعة الرابعة مساءً..." 
                className="w-full h-20 bg-white text-zinc-900 border border-zinc-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-zinc-400" 
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-black font-semibold rounded-xl transition-all text-sm disabled:opacity-50 hover:opacity-90 active:scale-[0.99] shadow-md"
              style={{ backgroundColor: 'var(--secondary-theme, #D4AF37)' }}
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : t.buyNow}
            </button>

            {/* زر الطلب المباشر عبر الواتساب */}
            {settings.contact?.whatsapp && (
              <a 
                href={`https://api.whatsapp.com/send?phone=${settings.contact.whatsapp.replace(/\s+/g, '')}&text=${encodeURIComponent(`السلام عليكم فريق SAFOS، أريد طلب حقيبة الكانفاس الفاخرة *${product.name}* (الكمية: ${quantity}) المتوفرة بسعر ${product.price} درهم. أرجو التواصل معي لتأكيد تفاصيل الشحن والطلب.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 text-emerald-600 font-semibold rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-all text-sm border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100"
                style={{ backgroundColor: '' }}
              >
                <Phone size={16} />
                <span>{lang === 'ar' ? 'أو اطلبي مباشرة بنقرة واحدة عبر الواتساب' : lang === 'fr' ? 'Ou commander directement via WhatsApp' : 'Or order directly via WhatsApp'}</span>
              </a>
            )}

          </form>
        </div>
      </section>

      {/* قسم المراجعات الحية */}
      {reviews.length > 0 && (
        <section className="py-16 max-w-4xl mx-auto px-6 border-b border-zinc-900/40">
          <h3 className="text-lg font-light text-zinc-200 mb-8 text-center" style={{ fontFamily: 'var(--title-font)' }}>{t.reviewsTitle}</h3>
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--card-bg-theme)', borderColor: 'border-zinc-900/60' }}>
                <div className="flex items-center text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-xs font-light leading-relaxed" style={{ color: 'var(--text-color)' }}>{rev.comment}</p>
                <div className="flex justify-between items-center text-[10px] text-zinc-600">
                  <span className="font-semibold text-zinc-400">{rev.customer_name}</span>
                  <span>{new Date(rev.created_at).toLocaleDateString('ar-MA')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* فوتر بسيط وفاخر يحتوي على حقوق الملكية */}
      <footer className="py-8 px-6 text-center text-xs text-zinc-600 border-t border-zinc-900">
        <p>{settings.policies?.copyright || 'جميع الحقوق محفوظة لعلامة SAFOS الفاخرة © 2026'}</p>
      </footer>

      {/* 🟢 نافذة رسالة الشكر المنبثقة الراقية والكاملة (Modal) وبدون إظهار رقم الطلب */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-neutral-100 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* أيقونة علامة الصح بالذهبي الفاخر */}
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-[#D4AF37]" />
            </div>
            
            <h3 className="text-2xl font-bold text-neutral-950 mb-3" style={{ fontFamily: 'var(--body-font)' }}>
              {lang === 'ar' ? 'شكراً لكِ!' : lang === 'fr' ? 'Merci!' : 'Thank you!'}
            </h3>
            
            {/* رسالة الشكر المخصصة بالكامل وبدون رقم الطلب */}
            <p className="text-neutral-600 leading-relaxed text-sm mb-6" style={{ fontFamily: 'var(--body-font)' }}>
              {t.thankYou}
            </p>

            {/* زر العودة للتسوق اللي كيسد النافذة والاستمارة */}
            <button 
              onClick={() => {
                setOrderSuccess(false);
                setName('');
                setPhone('');
                setCity('');
                setAddress('');
                setNotes('');
              }}
              className="w-full py-3 rounded-xl font-bold text-black bg-[#D4AF37] hover:opacity-90 active:scale-[0.99] transition-all"
              style={{ fontFamily: 'var(--body-font)' }}
            >
              {lang === 'ar' ? 'العودة للتسوق' : lang === 'fr' ? 'Retour à la boutique' : 'Continue Shopping'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
