import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ar" | "fr" | "en";

export const LANGS: { code: Lang; label: string; nativeLabel: string; flag: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", label: "Arabic",  nativeLabel: "العربية",  flag: "🇲🇦", dir: "rtl" },
  { code: "fr", label: "French",  nativeLabel: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", nativeLabel: "English",  flag: "🇬🇧", dir: "ltr" },
];

/* ─── All translatable UI strings ─── */
export const T = {
  /* Navbar */
  nav_home:        { ar: "الرئيسية",      fr: "Accueil",      en: "Home" },
  nav_collections: { ar: "المجموعات",     fr: "Collections",  en: "Collections" },
  nav_shop:        { ar: "المتجر",         fr: "Boutique",     en: "Shop" },
  nav_story:       { ar: "قصتنا",          fr: "Notre histoire", en: "Our Story" },
  nav_craft:       { ar: "الحرفية",        fr: "Savoir-faire", en: "Craft" },
  nav_contact:     { ar: "تواصلي",        fr: "Contact",      en: "Contact" },
  nav_admin:       { ar: "لوحة التحكم",   fr: "Admin",        en: "Admin Panel" },
  nav_search:      { ar: "ابحثي عن حقيبة...", fr: "Rechercher un sac...", en: "Search a bag..." },

  /* Hero */
  hero_cta_shop:   { ar: "تسوّقي الآن",   fr: "Acheter maintenant", en: "Shop Now" },
  hero_cta_story:  { ar: "قصتنا",          fr: "Notre histoire",     en: "Our Story" },
  hero_stat1:      { ar: "قطعة مُنجزة",   fr: "Pièces réalisées",   en: "Pieces made" },
  hero_stat2:      { ar: "يدوية",          fr: "Fait main",          en: "Handmade" },
  hero_stat3:      { ar: "نقشة حصرية",    fr: "Motifs exclusifs",   en: "Exclusive patterns" },
  hero_badge:      { ar: "حرفية أصيلة",  fr: "Artisanat authentique", en: "Authentic craft" },
  hero_premium_tag: { ar: "تطريز يدوي فاخر", fr: "Broderie main de luxe", en: "Luxury hand embroidery" },

  /* Features */
  feat1_t: { ar: "تطريز يدوي 100%",     fr: "Broderie main 100%",    en: "100% Hand Embroidered" },
  feat1_d: { ar: "كل غرزة بيدٍ ماهرة", fr: "Chaque point à la main", en: "Every stitch by skilled hands" },
  feat2_t: { ar: "قطعة فريدة",          fr: "Pièce unique",          en: "Unique Piece" },
  feat2_d: { ar: "تصاميم حصرية لا تتكرر", fr: "Designs exclusifs",   en: "Exclusive designs" },
  feat3_t: { ar: "شحن لجميع المغرب",   fr: "Livraison Maroc",       en: "Morocco-wide shipping" },
  feat3_d: { ar: "2-4 أيام عمل",        fr: "2-4 jours ouvrables",   en: "2-4 business days" },
  feat4_t: { ar: "جودة مضمونة",         fr: "Qualité garantie",      en: "Guaranteed Quality" },
  feat4_d: { ar: "خيوط رافيا ثابتة الألوان", fr: "Raphia couleurs durables", en: "Color-fast raffia threads" },

  /* Collections */
  col_kicker:     { ar: "— مجموعاتنا",         fr: "— Nos collections",   en: "— Our Collections" },
  col_title_p1:   { ar: "اختاري",               fr: "Choisissez",          en: "Choose" },
  col_title_p2:   { ar: "قصتكِ",                fr: "votre histoire",      en: "your story" },
  col_view_all:   { ar: "عرض الكل",            fr: "Voir tout",           en: "View All" },
  col_pieces:     { ar: "قطعة",                 fr: "pièces",              en: "pieces" },
  col_discover:   { ar: "اكتشفي",              fr: "Découvrir",           en: "Discover" },

  /* Shop / Products */
  shop_kicker:    { ar: "— متجرنا",            fr: "— Notre boutique",    en: "— Our Shop" },
  shop_title_p1:  { ar: "قطعٌ",                 fr: "Pièces",              en: "Exceptional" },
  shop_title_p2:  { ar: "استثنائية",           fr: "exceptionnelles",     en: "pieces" },
  add_to_cart:    { ar: "أضيفي للسلة",        fr: "Ajouter au panier",   en: "Add to Cart" },
  out_of_stock:   { ar: "نفد المخزون",        fr: "Rupture de stock",    en: "Out of stock" },
  out_short:      { ar: "نفد",                  fr: "Rupture",             en: "Sold" },
  last_pieces:    { ar: "آخر",                  fr: "Dernier",             en: "Last" },
  product_details: { ar: "معلومات المنتج",     fr: "Détails du produit",  en: "Product Details" },
  click_for_details: { ar: "اضغطي لعرض التفاصيل", fr: "Cliquez pour les détails", en: "Click for details" },
  product_color:  { ar: "اللون",                fr: "Couleur",             en: "Color" },
  product_category: { ar: "الفئة",              fr: "Catégorie",           en: "Category" },
  product_stock:  { ar: "المخزون",              fr: "Stock",               en: "Stock" },
  product_price:  { ar: "السعر",                fr: "Prix",                en: "Price" },
  product_about:  { ar: "عن هذه القطعة",        fr: "À propos de cette pièce", en: "About this piece" },
  product_about_text: {
    ar: "قطعة فنية مطرّزة يدوياً على كنفا بلاستيكية بخيوط رافيا فاخرة، مزوّدة بإكسسوارات معدنية أنيقة وتفاصيل متقنة لتدوم طويلاً.",
    fr: "Une pièce brodée à la main sur canevas plastique avec des fils de raphia luxueux, des accessoires métalliques élégants et des finitions soignées.",
    en: "A hand-embroidered piece on plastic canvas with luxurious raffia threads, elegant metal hardware, and refined details made to last.",
  },
  product_care:   { ar: "العناية",              fr: "Entretien",           en: "Care" },
  product_care_text: {
    ar: "تُحفظ بعيداً عن الماء المباشر، وتُنظّف بقطعة قماش جافة وناعمة. يُفضّل تخزينها في كيس قماشي للحفاظ على الشكل.",
    fr: "Gardez-la à l'abri de l'eau directe et nettoyez avec un chiffon doux et sec. Rangez-la dans un pochon pour préserver sa forme.",
    en: "Keep away from direct water and clean with a soft dry cloth. Store in a dust bag to preserve its shape.",
  },
  in_stock:       { ar: "متوفر",                fr: "Disponible",          en: "In stock" },
  close:          { ar: "إغلاق",                fr: "Fermer",              en: "Close" },

  /* Categories */
  cat_all:        { ar: "الكل",                 fr: "Tout",                en: "All" },
  cat_chevron:    { ar: "شيفرون",              fr: "Chevron",             en: "Chevron" },
  cat_chain:      { ar: "بسلسلة",              fr: "À chaîne",            en: "Chain" },
  cat_classic:    { ar: "كلاسيك",              fr: "Classique",           en: "Classic" },
  cat_clutch:     { ar: "كلتش",                 fr: "Pochette",            en: "Clutch" },
  cat_crossbody:  { ar: "كروس",                fr: "Bandoulière",         en: "Crossbody" },
  cat_pastel:     { ar: "باستيل",              fr: "Pastel",              en: "Pastel" },

  /* Story */
  story_kicker:   { ar: "— قصتنا",             fr: "— Notre histoire",    en: "— Our Story" },
  story_f1_t: { ar: "أيدٍ ماهرة",             fr: "Mains expertes",      en: "Skilled hands" },
  story_f1_d: { ar: "حرفيات بخبرة في فن التطريز", fr: "Artisanes expérimentées en broderie", en: "Experienced embroidery artisans" },
  story_f2_t: { ar: "خيوط الرافيا",          fr: "Fils de raphia",      en: "Raffia threads" },
  story_f2_d: { ar: "أجود الخامات الطبيعية", fr: "Meilleurs matériaux naturels", en: "Finest natural materials" },
  story_f3_t: { ar: "تصاميم حصرية",          fr: "Designs exclusifs",   en: "Exclusive designs" },
  story_f3_d: { ar: "كل قطعة لها هوية فريدة", fr: "Chaque pièce est unique", en: "Each piece is unique" },
  story_f4_t: { ar: "خدمة دائمة",             fr: "Service à vie",       en: "Lifetime service" },
  story_f4_d: { ar: "إصلاح وصيانة مدى الحياة", fr: "Réparation et entretien à vie", en: "Lifetime repair and maintenance" },

  /* Craft */
  craft_kicker:   { ar: "— رحلة الصنع",       fr: "— Le processus",      en: "— Our Process" },
  craft_title_p1: { ar: "أربعُ مراحل،",        fr: "Quatre étapes,",      en: "Four steps," },
  craft_title_p2: { ar: "قطعةٌ فريدة",        fr: "une pièce unique",    en: "one unique piece" },

  /* Technique */
  tech_kicker:    { ar: "— تقنيتنا",           fr: "— Notre technique",   en: "— Our Technique" },
  tech_title_p1:  { ar: "فنُّ",                 fr: "L'art de",            en: "The art of" },
  tech_title_p2:  { ar: "التطريز",             fr: "la broderie",         en: "embroidery" },
  tech_title_p3:  { ar: "على الكنفا",          fr: "sur canevas",         en: "on canvas" },
  tech_desc: {
    ar: "تقنية فريدة تجمع بين دقة الهندسة وجمال النسيج — خيوط الرافيا الفاخرة تُطرَّز يدوياً على شبكة كنفا بلاستيكية لتُولد قطعة فنية تدوم لسنوات.",
    fr: "Une technique unique qui allie la précision géométrique et la beauté du tissage — des fils de raphia luxueux brodés à la main sur un canevas plastique pour créer une œuvre d'art durable.",
    en: "A unique technique combining geometric precision and weaving beauty — luxurious raffia threads hand-embroidered on a plastic canvas to create a lasting work of art.",
  },
  tech_card1_t: { ar: "الكنفا البلاستيكية", fr: "Le canevas plastique", en: "Plastic Canvas" },
  tech_card1_d: { ar: "شبكة متينة بفتحات منتظمة تشكّل القاعدة الصلبة للحقيبة وتحافظ على شكلها.", fr: "Un maillage solide qui forme la base rigide du sac et préserve sa forme.", en: "A sturdy mesh forming the rigid base of the bag, preserving its shape." },
  tech_card2_t: { ar: "خيوط الرافيا", fr: "Fils de raphia", en: "Raffia Threads" },
  tech_card2_d: { ar: "خيوط طبيعية فاخرة بألوان نابضة وثابتة، تمنح الحقيبة ملمساً ناعماً ومظهراً راقياً.", fr: "Fils naturels luxueux aux couleurs vives et durables, offrant douceur et élégance.", en: "Luxurious natural threads with vibrant lasting colors, giving softness and elegance." },
  tech_card3_t: { ar: "نقشة الشيفرون", fr: "Motif Chevron", en: "Chevron Pattern" },
  tech_card3_d: { ar: "نقشة هندسية كلاسيكية تُطرَّز بدقة، حيث تتلاقى الخطوط لتشكّل أمواجاً متناغمة.", fr: "Motif géométrique classique brodé avec précision, où les lignes se rencontrent en vagues harmonieuses.", en: "Classic geometric pattern embroidered with precision, where lines meet in harmonious waves." },
  tech_s1: { ar: "غرزة لكل حقيبة",   fr: "Points par sac",       en: "Stitches per bag" },
  tech_s2: { ar: "ساعة عمل يدوي",  fr: "Heures de travail",    en: "Hours of work" },
  tech_s3: { ar: "مراحل دقيقة",     fr: "Étapes précises",       en: "Precise steps" },
  tech_s4: { ar: "صناعة مغربية",    fr: "Made in Morocco",      en: "Made in Morocco" },

  /* Testimonials */
  test_kicker:    { ar: "— آراء عميلاتنا",   fr: "— Avis clientes",     en: "— Customer Reviews" },
  test_title_p1:  { ar: "كلماتٌ",              fr: "Mots",                en: "Words" },
  test_title_p2:  { ar: "من القلب",           fr: "du cœur",             en: "from the heart" },

  /* Instagram */
  ig_kicker:      { ar: "— تابعينا",          fr: "— Suivez-nous",       en: "— Follow Us" },

  /* Newsletter */
  nl_title_p1:    { ar: "انضمّي إلى عالم",  fr: "Rejoignez l'univers", en: "Join the world of" },
  nl_desc:        { ar: "اشتركي في نشرتنا للحصول على العروض الحصرية والمجموعات الجديدة قبل الجميع.", fr: "Abonnez-vous à notre newsletter pour des offres exclusives et les nouvelles collections en avant-première.", en: "Subscribe to get exclusive offers and new collections before anyone else." },
  nl_placeholder: { ar: "بريدكِ الإلكتروني", fr: "Votre email",         en: "Your email" },
  nl_subscribe:   { ar: "اشتركي",              fr: "S'abonner",           en: "Subscribe" },
  nl_thanks:      { ar: "شكراً! سنكون على تواصل ✨", fr: "Merci! À très vite ✨", en: "Thanks! We'll be in touch ✨" },

  /* Footer */
  foot_shop:        { ar: "المتجر",            fr: "Boutique",            en: "Shop" },
  foot_service:     { ar: "خدمة العملاء",    fr: "Service client",      en: "Customer Service" },
  foot_contact:     { ar: "تواصلي معنا",     fr: "Contactez-nous",      en: "Contact Us" },
  foot_brand_desc:  { ar: "علامة مغربية تصنع حقائب فريدة بفن التطريز اليدوي على الكنفا بخيوط الرافيا الفاخرة.", fr: "Marque marocaine de sacs uniques en broderie main sur canevas avec fils de raphia luxueux.", en: "Moroccan brand of unique bags with hand embroidery on canvas using luxurious raffia threads." },
  foot_payment:     { ar: "طرق الدفع",        fr: "Moyens de paiement",  en: "Payment methods" },
  foot_rights:      { ar: "جميع الحقوق محفوظة. صُنع بحب في", fr: "Tous droits réservés. Fait avec amour à", en: "All rights reserved. Made with love in" },
  foot_privacy:     { ar: "سياسة الخصوصية",  fr: "Politique de confidentialité", en: "Privacy Policy" },
  foot_terms:       { ar: "الشروط والأحكام", fr: "Conditions générales", en: "Terms & Conditions" },
  foot_all_products:{ ar: "جميع المنتجات",   fr: "Tous les produits",   en: "All products" },
  foot_chevron_col: { ar: "مجموعة الشيفرون", fr: "Collection Chevron",  en: "Chevron Collection" },
  foot_pastel_col:  { ar: "الباستيل",          fr: "Pastel",              en: "Pastel" },
  foot_offers:      { ar: "العروض الخاصة",   fr: "Offres spéciales",    en: "Special Offers" },
  foot_new:         { ar: "المجموعات الجديدة", fr: "Nouveautés",        en: "New Arrivals" },
  foot_contact_us:  { ar: "تواصلي معنا",     fr: "Nous contacter",      en: "Contact us" },
  foot_shipping:    { ar: "الشحن والتوصيل",  fr: "Livraison",           en: "Shipping" },
  foot_returns:     { ar: "الاستبدال والإرجاع", fr: "Retours & Échanges", en: "Returns & Exchanges" },
  foot_faq:         { ar: "الأسئلة الشائعة", fr: "FAQ",                 en: "FAQ" },

  /* Cart */
  cart_title:       { ar: "السلّة",            fr: "Panier",              en: "Cart" },
  cart_empty:       { ar: "سلّتكِ فارغة",     fr: "Votre panier est vide", en: "Your cart is empty" },
  cart_continue:    { ar: "تابعي التسوّق",    fr: "Continuer vos achats", en: "Continue Shopping" },
  cart_total:       { ar: "المجموع",           fr: "Total",               en: "Total" },
  cart_checkout:    { ar: "إتمام الطلب",      fr: "Passer commande",     en: "Checkout" },
  cart_shipping_note: { ar: "الشحن يُحسب عند التأكيد", fr: "Frais de port calculés à la confirmation", en: "Shipping calculated at confirmation" },

  /* Wishlist */
  wish_title:       { ar: "المفضلة",           fr: "Favoris",             en: "Wishlist" },
  wish_empty:       { ar: "لا توجد منتجات في المفضلة", fr: "Aucun favori pour le moment", en: "No favorites yet" },

  /* Order Modal */
  order_title:      { ar: "تأكيد الطلب",      fr: "Confirmer la commande", en: "Confirm Order" },
  order_summary:    { ar: "ملخص طلبكِ",       fr: "Récapitulatif",       en: "Order Summary" },
  order_name:       { ar: "الاسم الكامل",     fr: "Nom complet",         en: "Full Name" },
  order_phone:      { ar: "رقم الهاتف",       fr: "Téléphone",           en: "Phone Number" },
  order_city:       { ar: "المدينة",            fr: "Ville",               en: "City" },
  order_address:    { ar: "العنوان",            fr: "Adresse",             en: "Address" },
  order_notes:      { ar: "ملاحظات (اختياري)", fr: "Notes (optionnel)",   en: "Notes (optional)" },
  order_notes_ph:   { ar: "تغليف هدية، لون مفضل، وقت التوصيل...", fr: "Emballage cadeau, couleur préférée, horaire de livraison...", en: "Gift wrap, preferred color, delivery time..." },
  order_name_ph:    { ar: "اسمكِ الكامل",     fr: "Votre nom complet",   en: "Your full name" },
  order_city_ph:    { ar: "الدار البيضاء",    fr: "Casablanca",          en: "Casablanca" },
  order_address_ph: { ar: "الحي والشارع",     fr: "Quartier et rue",     en: "Neighborhood and street" },
  order_cod:        { ar: "الدفع عند الاستلام — ستتلقين مكالمة تأكيد خلال 24 ساعة", fr: "Paiement à la livraison — appel de confirmation sous 24h", en: "Cash on delivery — confirmation call within 24h" },
  order_submit:     { ar: "تأكيد الطلب",      fr: "Confirmer",           en: "Confirm Order" },
  order_submitting: { ar: "جاري التأكيد...",  fr: "Confirmation...",     en: "Confirming..." },
  order_required_name:  { ar: "الاسم مطلوب",  fr: "Le nom est requis",   en: "Name is required" },
  order_required_phone: { ar: "الهاتف مطلوب", fr: "Téléphone requis",    en: "Phone is required" },
  order_invalid_phone:  { ar: "رقم غير صحيح", fr: "Numéro invalide",     en: "Invalid number" },
  order_required_city:  { ar: "المدينة مطلوبة", fr: "Ville requise",     en: "City is required" },
  order_required_address: { ar: "العنوان مطلوب", fr: "Adresse requise",  en: "Address is required" },

  /* Order Success */
  success_title:    { ar: "تم تأكيد طلبكِ! 🎉", fr: "Commande confirmée ! 🎉", en: "Order Confirmed! 🎉" },
  success_order_id: { ar: "رقم طلبكِ:",        fr: "N° de commande :",    en: "Order number:" },
  success_note:     { ar: "ستتلقين مكالمة تأكيد خلال 24 ساعة من رقمنا", fr: "Vous recevrez un appel de confirmation sous 24h depuis", en: "You'll receive a confirmation call within 24h from" },
  success_whatsapp: { ar: "تواصلي معنا",       fr: "Nous contacter",      en: "Contact Us" },
  success_continue: { ar: "متابعة التسوّق",   fr: "Continuer",           en: "Continue Shopping" },

  /* Toast */
  toast_added:      { ar: "تمت إضافة",        fr: "Ajouté :",            en: "Added:" },
  toast_wish_add:   { ar: "تمت الإضافة للمفضلة", fr: "Ajouté aux favoris", en: "Added to wishlist" },
  toast_wish_rem:   { ar: "تمت الإزالة من المفضلة", fr: "Retiré des favoris", en: "Removed from wishlist" },

  /* Common */
  language:         { ar: "اللغة",             fr: "Langue",              en: "Language" },
  remove:           { ar: "إزالة",             fr: "Supprimer",           en: "Remove" },
};

export type TKey = keyof typeof T;

/* ─── Context ─── */
interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "safos_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar";
    const saved = localStorage.getItem(STORAGE_KEY) as Lang;
    return saved && LANGS.find(l => l.code === saved) ? saved : "ar";
  });

  const dir = LANGS.find(l => l.code === lang)?.dir || "rtl";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: TKey) => T[key]?.[lang] || T[key]?.ar || String(key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
