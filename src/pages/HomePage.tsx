import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, ArrowLeft, Star, Heart, Phone, 
  MapPin, Globe, Shield, Truck, Sparkles, MessageCircle, ChevronRight
} from 'lucide-react';

const homeTranslations = {
  ar: {
    discover: "اكتشفي التشكيلة",
    story: "قصة براند SAFOS",
    pillars: "ركائز الفخامة والتطريز يدوياً",
    testimonials: "آراء العميلات والتقييمات",
    shopNow: "تسوقي الآن",
    viewProduct: "اكتشفي الحقيبة",
    freeShipping: "شحن مجاني وسريع",
    handmade: "صنع يدوي فاخر بمراكش"
  },
  fr: {
    discover: "Découvrir la collection",
    story: "L'histoire de notre atelier",
    pillars: "Nos piliers de luxe & broderie",
    testimonials: "Avis de nos clientes",
    shopNow: "Acheter maintenant",
    viewProduct: "Voir l'article",
    freeShipping: "Livraison rapide gratuite",
    handmade: "Fait main de luxe à Marrakech"
  },
  en: {
    discover: "Discover the Collection",
    story: "The Atelier Story",
    pillars: "Our Pillars of Luxury Craftsmanship",
    testimonials: "Customer Testimonials",
    shopNow: "Shop Now",
    viewProduct: "View Details",
    freeShipping: "Free Express Shipping",
    handmade: "Handcrafted Luxury in Marrakech"
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const { products, settings, loading } = useStore();
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const t = homeTranslations[lang];

  // تصفية ألوان الهوية الحية المدخلة من لوحة التحكم لتطبيقها حياً فالموقع
  const primaryTheme = settings.colors?.primary || '#0A0A0A';
  const secondaryTheme = settings.colors?.secondary || '#D4AF37';

  return (
    <div 
      style={{
        '--primary-theme': primaryTheme,
        '--secondary-theme': secondaryTheme
      } as React.CSSProperties}
      className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans antialiased selection:bg-amber-500/30"
    >
      
      {/* شريط الإعلانات الفوقاني (Announcement Bar) */}
      {settings.hero?.announcement_text && (
        <div className="text-center py-2.5 px-4 text-xs font-semibold tracking-wider transition-all" style={{ backgroundColor: 'var(--secondary-theme)', color: '#000000' }}>
          {lang === 'ar' ? settings.hero.announcement_ar : lang === 'fr' ? settings.hero.announcement_fr : settings.hero.announcement_en}
        </div>
      )}

      {/* الهيدر الفاخر */}
      <header className="p-6 border-b border-zinc-900/50 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-right">
          <h1 className="text-2xl font-bold tracking-[0.2em]" style={{ color: 'var(--secondary-theme)' }}>
            {lang === 'ar' ? settings.brand?.name_ar : lang === 'fr' ? settings.brand?.name_fr : settings.brand?.name_en}
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
            {lang === 'ar' ? settings.brand?.subtitle_ar : lang === 'fr' ? settings.brand?.subtitle_fr : settings.brand?.subtitle_en}
          </p>
        </div>

        {/* محدد اللغات */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900">
          <button onClick={() => handleLangChange('ar')} className={`py-1 px-3 text-[10px] rounded-lg transition-all ${lang === 'ar' ? 'text-black font-bold' : 'text-zinc-400'}`} style={{ backgroundColor: lang === 'ar' ? 'var(--secondary-theme)' : 'transparent' }}>العربية</button>
          <button onClick={() => handleLangChange('fr')} className={`py-1 px-3 text-[10px] rounded-lg transition-all ${lang === 'fr' ? 'text-black font-bold' : 'text-zinc-400'}`} style={{ backgroundColor: lang === 'fr' ? 'var(--secondary-theme)' : 'transparent' }}>FR</button>
          <button onClick={() => handleLangChange('en')} className={`flex-1 py-1 px-3 text-[10px] rounded-lg transition-all ${lang === 'en' ? 'text-black font-bold' : 'text-zinc-400'}`} style={{ backgroundColor: lang === 'en' ? 'var(--secondary-theme)' : 'transparent' }}>EN</button>
        </div>
      </header>

      {/* 1. البانر الترحيبي العريض الفاخر (Hero Section) */}
      <section className="relative overflow-hidden py-16 lg:py-24 max-w-7xl mx-auto px-6 border-b border-zinc-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-right">
            <span className="text-xs uppercase tracking-widest text-zinc-500" style={{ color: 'var(--secondary-theme)' }}>{lang === 'ar' ? 'صنع يدوي فاخر بمراكش' : 'Atelier Brodé de luxe'}</span>
            <h2 className="text-4xl lg:text-5xl font-light text-zinc-100 leading-tight whitespace-pre-line">
              {lang === 'ar' ? settings.hero?.title_ar : lang === 'fr' ? settings.hero?.title_fr : settings.hero?.title_en}
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-lg">
              {lang === 'ar' ? settings.hero?.description_ar : lang === 'fr' ? settings.hero?.description_fr : settings.hero?.description_en}
            </p>
            <div className="pt-4">
              <a 
                href="#products-catalog"
                className="inline-flex items-center space-x-2 space-x-reverse py-3.5 px-8 text-sm font-semibold text-black rounded-xl transition-all shadow-lg"
                style={{ backgroundColor: 'var(--secondary-theme)' }}
              >
                <span>{t.discover}</span>
                <ArrowLeft size={16} className="transform rotate-180" />
              </a>
            </div>
          </div>

          {/* صورة البانر الفاخرة المرفوعة من جهازك */}
          <div className="aspect-[4/5] bg-zinc-950 border border-zinc-900/60 rounded-3xl overflow-hidden relative shadow-2xl">
            {settings.hero?.image ? (
              <img src={settings.hero.image} alt="SAFOS Luxury Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-light">لا توجد صورة للبانر الرئيسي</div>
            )}
          </div>
        </div>
      </section>

      {/* 2. ركائز الفخامة الثلاث لشبك الكانفاس المطرز (Luxury Pillars) */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-b border-zinc-900/40">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h3 className="text-2xl font-light text-zinc-100">{t.pillars}</h3>
          <p className="text-xs text-zinc-500 mt-2">التزام تام بأدق معايير الجودة والحياكة اليدوية لتدوم الحقيبة لسنوات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center" style={{ color: 'var(--secondary-theme)' }}><Sparkles size={20} /></div>
            <h4 className="text-sm font-medium text-zinc-200">{lang === 'ar' ? settings.pillars?.p1_title_ar : lang === 'fr' ? settings.pillars?.p1_title_fr : settings.pillars?.p1_title_en}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">{lang === 'ar' ? settings.pillars?.p1_desc_ar : lang === 'fr' ? settings.pillars?.p1_desc_fr : settings.pillars?.p1_desc_en}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center" style={{ color: 'var(--secondary-theme)' }}><Shield size={20} /></div>
            <h4 className="text-sm font-medium text-zinc-200">{lang === 'ar' ? settings.pillars?.p2_title_ar : lang === 'fr' ? settings.pillars?.p2_title_fr : settings.pillars?.p2_title_en}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">{lang === 'ar' ? settings.pillars?.p2_desc_ar : lang === 'fr' ? settings.pillars?.p2_desc_fr : settings.pillars?.p2_desc_en}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center" style={{ color: 'var(--secondary-theme)' }}><Truck size={20} /></div>
            <h4 className="text-sm font-medium text-zinc-200">{lang === 'ar' ? settings.pillars?.p3_title_ar : lang === 'fr' ? settings.pillars?.p3_title_fr : settings.pillars?.p3_title_en}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">{lang === 'ar' ? settings.pillars?.p3_desc_ar : lang === 'fr' ? settings.pillars?.p3_desc_fr : settings.pillars?.p3_desc_en}</p>
          </div>
        </div>
      </section>

      {/* 3. كتالوج المنتجات وحقائب الكانفاس (Products Catalog) */}
      <section id="products-catalog" className="py-16 max-w-7xl mx-auto px-6 border-b border-zinc-900/40">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h3 className="text-2xl font-light text-zinc-100">{lang === 'ar' ? 'حقائب الكانفاس الفاخرة' : 'Sacs en canevas de luxe'}</h3>
          <p className="text-xs text-zinc-500 mt-2">اختاري الحجم واللون المناسب لإطلالتكِ الملكية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-zinc-950 border border-zinc-900/60 rounded-3xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-800 transition-all cursor-pointer group shadow-lg"
            >
              <div>
                <div className="w-full aspect-square bg-[#0F0F0F] rounded-2xl overflow-hidden mb-4 relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-light">لا توجد صورة</div>
                  )}
                  {product.tag && (
                    <span className="absolute top-3.5 right-3.5 bg-black text-[#D4AF37] text-[10px] font-bold py-1 px-3 rounded-full uppercase" style={{ color: 'var(--secondary-theme)' }}>
                      {product.tag}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-light text-zinc-100">
                  {lang === 'ar' ? product.name : lang === 'fr' ? product.name_fr : product.name_en}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">{product.color}</p>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-900">
                <span className="text-sm font-semibold" style={{ color: 'var(--secondary-theme)' }}>{product.price.toLocaleString()} {lang === 'ar' ? settings.contact?.currency_symbol : settings.contact?.currency}</span>
                <span className="text-xs text-zinc-400 group-hover:text-white flex items-center space-x-1 space-x-reverse transition-all">
                  <span>{t.viewProduct}</span>
                  <ChevronRight size={14} className="transform rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. قصة الماركة الفنية والورشة (Brand Story) */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-b border-zinc-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
            {settings.about?.image ? (
              <img src={settings.about.image} alt="SAFOS Atelier Workshop" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-light">لا توجد صورة للورشة</div>
            )}
          </div>

          <div className="space-y-6 text-right">
            <span className="text-xs uppercase tracking-widest text-zinc-500" style={{ color: 'var(--secondary-theme)' }}>{settings.brand?.subtitle_ar}</span>
            <h3 className="text-3xl font-light text-zinc-100">
              {lang === 'ar' ? settings.about?.title_ar : lang === 'fr' ? settings.about?.title_fr : settings.about?.title_en}
            </h3>
            <p className="text-sm text-zinc-400 font-light leading-relaxed whitespace-pre-line">
              {lang === 'ar' ? settings.about?.text_ar : lang === 'fr' ? settings.about?.text_fr : settings.about?.text_en}
            </p>
          </div>
        </div>
      </section>

      {/* 5. آراء وتقييمات العميلات والتقييمات الحقيقية (Testimonials) */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-b border-zinc-900/40">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h3 className="text-2xl font-light text-zinc-100">{t.testimonials}</h3>
          <p className="text-xs text-zinc-500 mt-2">تجارب واقعية لزبائننا الوفيات بكل فخر ومصداقية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0A0A0A] border border-zinc-900 p-6 rounded-2xl space-y-4">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              {lang === 'ar' ? settings.testimonials?.t1_text_ar : lang === 'fr' ? settings.testimonials?.t1_text_fr : settings.testimonials?.t1_text_en}
            </p>
            <h4 className="text-xs font-semibold text-zinc-200">{lang === 'ar' ? settings.testimonials?.t1_name_ar : lang === 'fr' ? settings.testimonials?.t1_name_fr : settings.testimonials?.t1_name_en}</h4>
          </div>

          <div className="bg-[#0A0A0A] border border-zinc-900 p-6 rounded-2xl space-y-4">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              {lang === 'ar' ? settings.testimonials?.t2_text_ar : lang === 'fr' ? settings.testimonials?.t2_text_fr : settings.testimonials?.t2_text_en}
            </p>
            <h4 className="text-xs font-semibold text-zinc-200">{lang === 'ar' ? settings.testimonials?.t2_name_ar : lang === 'fr' ? settings.testimonials?.t2_name_fr : settings.testimonials?.t2_name_en}</h4>
          </div>
        </div>
      </section>

      {/* تذييل الصفحة الفاخر */}
      <footer className="py-12 px-6 border-t border-zinc-900 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-right text-xs text-zinc-500">
        <div className="space-y-3">
          <h5 className="font-semibold text-zinc-300">عن SAFOS</h5>
          <p className="font-light leading-relaxed">{lang === 'ar' ? settings.about?.text_ar?.substring(0, 100) : settings.about?.text_fr?.substring(0, 100)}...</p>
        </div>
        <div className="space-y-3">
          <h5 className="font-semibold text-zinc-300">سياسات المتجر</h5>
          <p className="font-light leading-relaxed">{lang === 'ar' ? settings.policies?.shipping_ar : settings.policies?.shipping_fr}</p>
        </div>
        <div className="space-y-3">
          <h5 className="font-semibold text-zinc-300">حقوق الملكية</h5>
          <p className="font-light">{settings.policies?.copyright}</p>
        </div>
      </footer>

      {/* أيقونات التواصل الاجتماعي العائمة والتفاعلية في الزاوية */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col space-y-3">
        {settings.contact?.whatsapp && (
          <a 
            href={`https://api.whatsapp.com/send?phone=${settings.contact.whatsapp.replace(/\s+/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105"
            title="تواصل معنا عبر واتساب"
          >
            <MessageCircle size={24} />
          </a>
        )}
        {settings.contact?.instagram && (
          <a 
            href={`https://instagram.com/${settings.contact.instagram}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105"
            title="تابعنا على إنستغرام"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        )}
      </div>

    </div>
  );
}
