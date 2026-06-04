import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ============ TYPES ============ */

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
  brandLogo: string;
  brandLogoImage?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
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
  tiktok: string;
  currency: string;
  currencySymbol: string;
  announcementText: string;
  shippingText: string;
  footerDescription: string;
  metaDescription: string;
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

interface StoreContextType {
  products: Product[];
  collections: Collection[];
  testimonials: Testimonial[];
  craftSteps: CraftStep[];
  storeInfo: StoreInfo;
  orders: Order[];
  updateProduct: (id: number, data: Partial<Product>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  deleteProduct: (id: number) => void;
  updateCollection: (index: number, data: Partial<Collection>) => void;
  updateTestimonial: (index: number, data: Partial<Testimonial>) => void;
  updateCraftStep: (index: number, data: Partial<CraftStep>) => void;
  updateStoreInfo: (data: Partial<StoreInfo>) => void;
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  resetAll: () => void;
}

/* ============ DEFAULT DATA ============ */

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
  brandLogo: "S",
  brandLogoImage: "",
  brandColors: { primary: "#1a1410", secondary: "#b8935a", accent: "#d4b483" },
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
  tiktok: "safos.bags",
  currency: "MAD",
  currencySymbol: "د.م",
  announcementText: "✦ شحن مجاني داخل المغرب للطلبات فوق 500 د.م ✦ كل حقيبة قطعة فريدة لا تتكرر ✦ صناعة 100% يدوية ✦ خصم 10% على أول طلب بكود SAFOS10",
  shippingText: "شحن مجاني للطلبات فوق 500 د.م • توصيل خلال 2-4 أيام عمل",
  footerDescription: "علامة مغربية تصنع حقائب فريدة بفن التطريز اليدوي على الكنفا بخيوط الرافيا الفاخرة.",
  metaDescription: "SAFOS - براند مغربي فاخر للحقائب النسائية المصنوعة يدوياً بتقنية التطريز على الكنفا بخيوط الرافيا.",
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "SAF-001",
    date: "2026-01-15",
    customerName: "أمينة بنعلي",
    customerPhone: "0612345678",
    customerCity: "الرباط",
    customerAddress: "شارع محمد الخامس، حي الرياض",
    items: [{ productId: 1, productName: "حقيبة صفاء", productImage: "/products/bag-beige-navy.jpg", color: "بيج × أزرق كحلي", price: 850, qty: 1 }],
    total: 850,
    status: "delivered",
    notes: "",
  },
  {
    id: "SAF-002",
    date: "2026-01-20",
    customerName: "سلمى الإدريسي",
    customerPhone: "0698765432",
    customerCity: "الدار البيضاء",
    customerAddress: "حي الكورنيش",
    items: [
      { productId: 3, productName: "حقيبة فرحة", productImage: "/products/bag-pastel.jpg", color: "ألوان الباستيل", price: 950, qty: 1 },
      { productId: 4, productName: "حقيبة مريم", productImage: "/products/bag-lavender.jpg", color: "بنفسجي لافندر", price: 880, qty: 1 },
    ],
    total: 1830,
    status: "shipped",
    notes: "تغليف هدية من فضلك",
  },
  {
    id: "SAF-003",
    date: "2026-01-22",
    customerName: "ليلى التازي",
    customerPhone: "0655443322",
    customerCity: "مراكش",
    customerAddress: "حي منارة",
    items: [{ productId: 5, productName: "حقيبة نجاة", productImage: "/products/bag-red-white.jpg", color: "أحمر × أبيض", price: 780, qty: 2 }],
    total: 1560,
    status: "processing",
    notes: "",
  },
  {
    id: "SAF-004",
    date: "2026-01-24",
    customerName: "فاطمة الزهراء",
    customerPhone: "0677889900",
    customerCity: "فاس",
    customerAddress: "المدينة القديمة",
    items: [{ productId: 2, productName: "حقيبة لينا", productImage: "/products/bag-black-white.jpg", color: "أسود × أبيض × بيج", price: 720, qty: 1 }],
    total: 720,
    status: "confirmed",
    notes: "",
  },
  {
    id: "SAF-005",
    date: "2026-01-25",
    customerName: "رجاء المرابط",
    customerPhone: "0633221100",
    customerCity: "طنجة",
    customerAddress: "حي المدينة",
    items: [{ productId: 6, productName: "حقيبة رجاء", productImage: "/products/bag-sage-pink.jpg", color: "أخضر سيج × وردي", price: 820, qty: 1 }],
    total: 820,
    status: "pending",
    notes: "اتصلوا قبل الشحن",
  },
];

const STORAGE_KEY = "safos_store_data";
const DATA_VERSION = "5.0";

/* ============ CONTEXT ============ */

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [collections, setCollections] = useState<Collection[]>(DEFAULT_COLLECTIONS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [craftSteps, setCraftSteps] = useState<CraftStep[]>(DEFAULT_CRAFT_STEPS);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(DEFAULT_STORE_INFO);
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.version !== DATA_VERSION) { localStorage.removeItem(STORAGE_KEY); return; }
        if (data.products) setProducts(data.products);
        if (data.collections) setCollections(data.collections);
        if (data.testimonials) setTestimonials(data.testimonials);
        if (data.craftSteps) setCraftSteps(data.craftSteps);
        if (data.storeInfo) setStoreInfo({ ...DEFAULT_STORE_INFO, ...data.storeInfo });
        if (data.orders) setOrders(data.orders);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DATA_VERSION, products, collections, testimonials, craftSteps, storeInfo, orders }));
    } catch (e) { console.error(e); }
  }, [products, collections, testimonials, craftSteps, storeInfo, orders]);

  const updateProduct = (id: number, data: Partial<Product>) => setProducts(p => p.map(x => x.id === id ? { ...x, ...data } : x));
  const addProduct = (product: Omit<Product, "id">) => setProducts(p => [...p, { ...product, id: Math.max(0, ...p.map(x => x.id)) + 1 }]);
  const deleteProduct = (id: number) => setProducts(p => p.filter(x => x.id !== id));
  const updateCollection = (index: number, data: Partial<Collection>) => setCollections(c => c.map((x, i) => i === index ? { ...x, ...data } : x));
  const updateTestimonial = (index: number, data: Partial<Testimonial>) => setTestimonials(t => t.map((x, i) => i === index ? { ...x, ...data } : x));
  const updateCraftStep = (index: number, data: Partial<CraftStep>) => setCraftSteps(s => s.map((x, i) => i === index ? { ...x, ...data } : x));
  const updateStoreInfo = (data: Partial<StoreInfo>) => setStoreInfo(s => ({ ...s, ...data }));

  const addOrder = (order: Omit<Order, "id" | "date" | "status">): Order => {
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id: `SAF-${String(orders.length + 1).padStart(3, "0")}`,
      date: now.toISOString().split("T")[0],
      status: "pending",
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  const deleteOrder = (id: string) => setOrders(o => o.filter(x => x.id !== id));

  const resetAll = () => {
    if (confirm("هل أنتِ متأكدة من إعادة تعيين كل البيانات؟")) {
      setProducts(DEFAULT_PRODUCTS); setCollections(DEFAULT_COLLECTIONS);
      setTestimonials(DEFAULT_TESTIMONIALS); setCraftSteps(DEFAULT_CRAFT_STEPS);
      setStoreInfo(DEFAULT_STORE_INFO); setOrders(DEFAULT_ORDERS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <StoreContext.Provider value={{ products, collections, testimonials, craftSteps, storeInfo, orders, updateProduct, addProduct, deleteProduct, updateCollection, updateTestimonial, updateCraftStep, updateStoreInfo, addOrder, updateOrderStatus, deleteOrder, resetAll }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
