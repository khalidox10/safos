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
    buyNow: "إتمام عملية الشراء",
    dimensions: "مقاسات الحقيبة الدقيقة",
    care: "دليل العناية بالحقيبة والغسيل",
    description: "الوصف والتفاصيل",
    color: "الألوان المتوفرة",
    quantity: "الكمية",
    checkoutTitle: "إتمام عملية الشراء (الدفع عند الاستلام)",
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [openAccordion, setOpenAccordion] = useState<'desc' | 'dims' | 'care' | null>('desc');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('safos-lang');
    if (savedLang === 'ar' || savedLang === 'fr' || savedLang === 'en') setLang(savedLang as any);
  }, []);

  const handleLangChange = (newLang: 'ar' | 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('safos-lang', newLang);
  };

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

  const toggleAccordion = (section: 'desc' | 'dims' | 'care') => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name || !phone || !city || !address) {
      setErrorMessage(translations[lang].fieldsError);
      return;
    }
    setIsSubmitting(true);
    try {
      const orderNumber = `SAF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('orders').insert([{
        order_number: orderNumber, customer_name: name, customer_phone: phone, 
        customer_city: city, customer_address: address, total: product.price * quantity,
        status: 'pending', items: [{ product_name: product.name, price: product.price, qty: quantity }],
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

  if (storeLoading || !product) return <div className="min-h-screen bg-black" />;
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200">
      <header className="p-6 border-b border-neutral-900 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-xl font-bold cursor-pointer text-[#D4AF37]" onClick={() => navigate('/')}>SAFOS</h1>
        <div className="flex gap-2">
          <button onClick={() => handleLangChange('ar')}>AR</button>
          <button onClick={() => handleLangChange('fr')}>FR</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img src={activeImage} alt={product.name} className="w-full aspect-[4/5] object-cover rounded-3xl" />
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-2xl text-[#D4AF37]">{product.price.toLocaleString()} درهم</p>

          {/* Checkout Form */}
          <div className="bg-[#0F0F0F] border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">معلومات التوصيل</h3>
            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <input type="text" placeholder="الاسم الكامل" onChange={(e) => setName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-all" />
              <input type="text" placeholder="رقم الهاتف" onChange={(e) => setPhone(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-all" />
              <input type="text" placeholder="المدينة" onChange={(e) => setCity(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-all" />
              <input type="text" placeholder="العنوان بالتفصيل" onChange={(e) => setAddress(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-all" />
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-[#D4AF37] hover:bg-[#C5A028] text-black py-4 rounded-xl text-md font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-95"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إتمام عملية الشراء'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
