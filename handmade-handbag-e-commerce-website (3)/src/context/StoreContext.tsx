import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface Product {
  id: number;
  name: string;
  nameEn: string;
  price: number;
  oldPrice: number | null;
  image: string;
  color: string;
  tag: string | null;
  category: string;
  stock: number;
}

export interface Collection {
  title: string;
  sub: string;
  img: string;
  count: number;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface CraftStep {
  num: string;
  title: string;
  desc: string;
  img: string;
}

export interface StoreInfo {
  brandName: string;
  brandSub: string;
  logoUrl: string;
  logoText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  storyTitle: string;
  storyDescription: string;
  storyYear: string;
  storyCity: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  currency: string;
  currencySymbol: string;
  announcementText: string;
  showCollections: boolean;
  showStory: boolean;
  showCraft: boolean;
  showTechnique: boolean;
  showTestimonials: boolean;
  showInstagram: boolean;
  showNewsletter: boolean;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  color: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  notes: string;
}

export interface StoreData {
  products: Product[];
  collections: Collection[];
  testimonials: Testimonial[];
  craftSteps: CraftStep[];
  storeInfo: StoreInfo;
}

export type SiteMode = "public" | "preview" | "editor";

interface StoreContextType {
  products: Product[];
  collections: Collection[];
  testimonials: Testimonial[];
  craftSteps: CraftStep[];
  storeInfo: StoreInfo;
  orders: Order[];
  adminPassword: string;
  mode: SiteMode;
  isPreview: boolean;
  isEditor: boolean;
  hasUnpublishedChanges: boolean;
  publicLink: string;
  previewLink: string;
  editorLink: string;
  publishedData: StoreData;
  draftData: StoreData;
  updateProduct: (id: number, data: Partial<Product>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  deleteProduct: (id: number) => void;
  updateCollection: (index: number, data: Partial<Collection>) => void;
  updateTestimonial: (index: number, data: Partial<Testimonial>) => void;
  updateCraftStep: (index: number, data: Partial<CraftStep>) => void;
  updateStoreInfo: (data: Partial<StoreInfo>) => void;
  updateAdminPassword: (password: string) => void;
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  publishDraft: () => void;
  discardDraft: () => void;
  resetAll: () => void;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "حقيبة صفاء", nameEn: "Safaa Chevron", price: 850, oldPrice: 1000, image: "/products/bag-beige-navy.jpg", color: "بيج × أزرق كحلي", tag: "الأكثر مبيعاً", category: "chevron", stock: 5 },
  { id: 2, name: "حقيبة لينا", nameEn: "Lina Monochrome", price: 720, oldPrice: null, image: "/products/bag-black-white.jpg", color: "أسود × أبيض × بيج", tag: "جديد", category: "clutch", stock: 3 },
  { id: 3, name: "حقيبة فرحة", nameEn: "Farha Pastel", price: 950, oldPrice: 1150, image: "/products/bag-pastel.jpg", color: "ألوان الباستيل", tag: "حصري", category: "chain", stock: 2 },
  { id: 4, name: "حقيبة مريم", nameEn: "Mariam Lavender", price: 880, oldPrice: null, image: "/products/bag-lavender.jpg", color: "بنفسجي لافندر", tag: "محدود", category: "chain", stock: 4 },
  { id: 5, name: "حقيبة نجاة", nameEn: "Najat Red", price: 780, oldPrice: 900, image: "/products/bag-red-white.jpg", color: "أحمر × أبيض", tag: "تخفيض", category: "chevron", stock: 6 },
  { id: 6, name: "حقيبة رجاء", nameEn: "Raja Sage", price: 820, oldPrice: null, image: "/products/bag-sage-pink.jpg", color: "أخضر سيج × وردي", tag: "جديد", category: "crossbody", stock: 3 },
  { id: 7, name: "حقيبة بهيجة", nameEn: "Bahija Classic", price: 690, oldPrice: null, image: "/products/bag-beige-solid.jpg", color: "بيج ذهبي", tag: null, category: "classic", stock: 8 },
];

const DEFAULT_COLLECTIONS: Collection[] = [
  { title: "مجموعة الشيفرون", sub: "CHEVRON COLLECTION", img: "/products/bag-beige-navy.jpg", count: 12 },
  { title: "ألوان الباستيل", sub: "PASTEL EDITION", img: "/products/bag-pastel.jpg", count: 8 },
  { title: "اللمسة الكلاسيكية", sub: "CLASSIC TOUCH", img: "/products/bag-beige-solid.jpg", count: 10 },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "أمينة بنعلي", role: "الرباط", text: "حقيبة الشيفرون الخاصة بي تخطف الأنظار! حرفية التطريز اليدوي واضحة في كل غرزة، والألوان رائعة وثابتة. safos غيّرت نظرتي للحقائب المغربية.", rating: 5, avatar: "أ" },
  { name: "سلمى الإدريسي", role: "الدار البيضاء", text: "اقتنيت حقيبة الباستيل وكأنها لوحة فنية مطرّزة على كتفي. التفاصيل الذهبية وخيوط الرافيا الناعمة... كل من يراها يسألني من أين اشتريتها!", rating: 5, avatar: "س" },
  { name: "ليلى التازي", role: "مراكش", text: "تجربة شراء راقية من البداية للنهاية. التغليف فاخر، الحقيبة وصلتني خلال 3 أيام، وجودة التطريز تفوق التوقعات. سعر معقول لقطعة فنية فريدة.", rating: 5, avatar: "ل" },
];

const DEFAULT_CRAFT_STEPS: CraftStep[] = [
  { num: "01", title: "قَصُّ القالب", desc: "نبدأ بقصّ ألواح الكنفا البلاستيكية بدقة لتشكيل قطع الحقيبة: الواجهة، الظهر، الجوانب، والقاعدة، بأبعاد محسوبة بعناية.", img: "/craft/yarn-colors.jpg" },
  { num: "02", title: "اختيار الخيوط", desc: "ننتقي خيوط الرافيا الفاخرة بألوان متناسقة، فجودة الخيط وتدرّجاته اللونية هي سرّ جمال الحقيبة النهائي.", img: "/craft/yarn-colors.jpg" },
  { num: "03", title: "التطريز اليدوي", desc: "بإبرة كبيرة وأنامل ماهرة، نطرّز نقشات الشيفرون غرزةً بغرزة عبر شبكة الكنفا. تستغرق كل حقيبة من 20 إلى 30 ساعة.", img: "/craft/crochet-process.jpg" },
  { num: "04", title: "التجميع والتشطيب", desc: "نخيط القطع المطرّزة ببعضها، نركّب القفل المعدني الذهبي والسلاسل والشراشيب، ثم فحص نهائي دقيق قبل التغليف.", img: "/products/bag-beige-solid.jpg" },
];

const DEFAULT_STORE_INFO: StoreInfo = {
  brandName: "SAFOS",
  brandSub: "Embroidered Atelier",
  logoUrl: "",
  logoText: "S",
  heroTitle: "غرزةٌ\nتُطرَّز بيدٍ\nوتُروى بحب",
  heroSubtitle: "مجموعة التطريز اليدوي 2026",
  heroDescription: "في SAFOS، كل حقيبة هي لوحةٌ فنية تُطرَّز يدوياً على شبكة الكنفا بخيوط الرافيا الفاخرة. نقشات الشيفرون، الباستيل، والتفاصيل الذهبية... كل قطعة فريدة لا تتكرر.",
  heroImage: "/products/bag-beige-navy.jpg",
  storyTitle: "من غرزةٍ\nإلى تحفةٍ فنية",
  storyDescription: "بدأت SAFOS من شغفٍ بفن التطريز اليدوي على الكنفا، وحلمٍ بتقديم حقائب تجمع بين الحرفية الأصيلة والتصميم العصري. كل حقيبة تستغرق ما بين 20 و30 ساعة من العمل اليدوي الدقيق، حيث تُطرَّز كل غرزة بصبر وحب.",
  storyYear: "2019",
  storyCity: "الدار البيضاء",
  phone: "+212 6 12 34 56 78",
  whatsapp: "212612345678",
  email: "hello@safos.ma",
  address: "حي المعاريف، الدار البيضاء، المغرب",
  instagram: "safos.bags",
  facebook: "safos.bags",
  currency: "MAD",
  currencySymbol: "د.م",
  announcementText: "✦ شحن مجاني داخل المغرب للطلبات فوق 500 د.م ✦ كل حقيبة قطعة فريدة لا تتكرر ✦ صناعة 100% يدوية ✦ خصم 10% على أول طلب بكود SAFOS10",
  showCollections: true,
  showStory: true,
  showCraft: true,
  showTechnique: true,
  showTestimonials: true,
  showInstagram: true,
  showNewsletter: true,
};

const DEFAULT_DATA: StoreData = {
  products: DEFAULT_PRODUCTS,
  collections: DEFAULT_COLLECTIONS,
  testimonials: DEFAULT_TESTIMONIALS,
  craftSteps: DEFAULT_CRAFT_STEPS,
  storeInfo: DEFAULT_STORE_INFO,
};

const DEFAULT_ORDERS: Order[] = [
  { id: "SAF-001", date: "2026-01-15", customerName: "أمينة بنعلي", customerPhone: "0612345678", customerCity: "الرباط", customerAddress: "شارع محمد الخامس، حي الرياض", items: [{ productId: 1, productName: "حقيبة صفاء", productImage: "/products/bag-beige-navy.jpg", color: "بيج × أزرق كحلي", price: 850, qty: 1 }], total: 850, status: "delivered", notes: "" },
  { id: "SAF-002", date: "2026-01-20", customerName: "سلمى الإدريسي", customerPhone: "0698765432", customerCity: "الدار البيضاء", customerAddress: "حي الكورنيش", items: [{ productId: 3, productName: "حقيبة فرحة", productImage: "/products/bag-pastel.jpg", color: "ألوان الباستيل", price: 950, qty: 1 }, { productId: 4, productName: "حقيبة مريم", productImage: "/products/bag-lavender.jpg", color: "بنفسجي لافندر", price: 880, qty: 1 }], total: 1830, status: "shipped", notes: "تغليف هدية من فضلك" },
  { id: "SAF-003", date: "2026-01-22", customerName: "ليلى التازي", customerPhone: "0655443322", customerCity: "مراكش", customerAddress: "حي منارة", items: [{ productId: 5, productName: "حقيبة نجاة", productImage: "/products/bag-red-white.jpg", color: "أحمر × أبيض", price: 780, qty: 2 }], total: 1560, status: "processing", notes: "" },
];

const STORAGE_KEY = "safos_store_data";
const DATA_VERSION = "6.3";
const EDITOR_KEY = "safos-dashboard-2026";
const PREVIEW_KEY = "safos-preview-2026";
const DEFAULT_ADMIN_PASSWORD = "safos1007";

function getOrigin() {
  if (typeof window === "undefined") return "https://safos.online";
  return window.location.origin;
}

function getMode(): SiteMode {
  if (typeof window === "undefined") return "public";
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const key = params.get("key");
  if (mode === "editor" && key === EDITOR_KEY) return "editor";
  if (mode === "preview" && key === PREVIEW_KEY) return "preview";
  return "public";
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [publishedData, setPublishedData] = useState<StoreData>(DEFAULT_DATA);
  const [draftData, setDraftData] = useState<StoreData>(DEFAULT_DATA);
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);
  const [adminPassword, setAdminPassword] = useState<string>(DEFAULT_ADMIN_PASSWORD);
  const [mode] = useState<SiteMode>(getMode());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.version !== DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (data.publishedData) setPublishedData(data.publishedData);
      if (data.draftData) setDraftData(data.draftData);
      else if (data.publishedData) setDraftData(data.publishedData);
      if (data.orders) setOrders(data.orders);
      if (data.adminPassword) setAdminPassword(data.adminPassword);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DATA_VERSION, publishedData, draftData, orders, adminPassword }));
    } catch (e) {
      console.error(e);
    }
  }, [publishedData, draftData, orders, adminPassword]);

  const activeData = mode === "public" ? publishedData : draftData;
  const products = activeData.products;
  const collections = activeData.collections;
  const testimonials = activeData.testimonials;
  const craftSteps = activeData.craftSteps;
  const storeInfo = activeData.storeInfo;

  const setDraft = (updater: (prev: StoreData) => StoreData) => setDraftData((prev) => updater(prev));

  const updateProduct = (id: number, data: Partial<Product>) => setDraft((prev) => ({ ...prev, products: prev.products.map((p) => p.id === id ? { ...p, ...data } : p) }));
  const addProduct = (product: Omit<Product, "id">) => setDraft((prev) => ({ ...prev, products: [...prev.products, { ...product, id: Math.max(0, ...prev.products.map((p) => p.id)) + 1 }] }));
  const deleteProduct = (id: number) => setDraft((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  const updateCollection = (index: number, data: Partial<Collection>) => setDraft((prev) => ({ ...prev, collections: prev.collections.map((c, i) => i === index ? { ...c, ...data } : c) }));
  const updateTestimonial = (index: number, data: Partial<Testimonial>) => setDraft((prev) => ({ ...prev, testimonials: prev.testimonials.map((t, i) => i === index ? { ...t, ...data } : t) }));
  const updateCraftStep = (index: number, data: Partial<CraftStep>) => setDraft((prev) => ({ ...prev, craftSteps: prev.craftSteps.map((s, i) => i === index ? { ...s, ...data } : s) }));
  const updateStoreInfo = (data: Partial<StoreInfo>) => setDraft((prev) => ({ ...prev, storeInfo: { ...prev.storeInfo, ...data } }));
  const updateAdminPassword = (password: string) => setAdminPassword(password);

  const addOrder = (order: Omit<Order, "id" | "date" | "status">): Order => {
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id: `SAF-${String(orders.length + 1).padStart(3, "0")}`,
      date: now.toISOString().split("T")[0],
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  const deleteOrder = (id: string) => setOrders((prev) => prev.filter((o) => o.id !== id));
  const publishDraft = () => setPublishedData(JSON.parse(JSON.stringify(draftData)));
  const discardDraft = () => setDraftData(JSON.parse(JSON.stringify(publishedData)));

  const resetAll = () => {
    if (confirm("هل أنتِ متأكدة من إعادة تعيين جميع البيانات؟")) {
      setPublishedData(DEFAULT_DATA);
      setDraftData(DEFAULT_DATA);
      setOrders(DEFAULT_ORDERS);
      setAdminPassword(DEFAULT_ADMIN_PASSWORD);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const hasUnpublishedChanges = useMemo(() => JSON.stringify(draftData) !== JSON.stringify(publishedData), [draftData, publishedData]);
  const origin = getOrigin();
  const publicLink = `${origin}/`;
  const previewLink = `${origin}/?mode=preview&key=${PREVIEW_KEY}`;
  const editorLink = `${origin}/?mode=editor&key=${EDITOR_KEY}`;

  return (
    <StoreContext.Provider
      value={{
        products,
        collections,
        testimonials,
        craftSteps,
        storeInfo,
        orders,
        adminPassword,
        mode,
        isPreview: mode === "preview",
        isEditor: mode === "editor",
        hasUnpublishedChanges,
        publicLink,
        previewLink,
        editorLink,
        publishedData,
        draftData,
        updateProduct,
        addProduct,
        deleteProduct,
        updateCollection,
        updateTestimonial,
        updateCraftStep,
        updateStoreInfo,
        updateAdminPassword,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        publishDraft,
        discardDraft,
        resetAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
