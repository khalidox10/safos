import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  getProducts,
  getCollections,
  getTestimonials,
  getCraftSteps,
  getOrders,
  createOrder,
  updateOrderStatus as updateOrderStatusApi,
  saveStoreSettings,
} from "../lib/supabaseService";

export interface Product {
  id: string;
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
  brandColors: { primary: string; secondary: string; accent: string };
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
  productId: string;
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
  loading: boolean;
  products: Product[];
  collections: Collection[];
  testimonials: Testimonial[];
  craftSteps: CraftStep[];
  storeInfo: StoreInfo;
  orders: Order[];
  refreshAll: () => Promise<void>;
  setProductsLocal: React.Dispatch<React.SetStateAction<Product[]>>;
  setStoreInfoLocal: React.Dispatch<React.SetStateAction<StoreInfo>>;
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  saveBrandSettings: (data: Partial<StoreInfo>) => Promise<void>;
}

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
  storyDescription: "بدأت SAFOS من شغفٍ بفن التطريز اليدوي على الكنفا، وحلمٍ بتقديم حقائب تجمع بين الحرفية الأصيلة والتصميم العصري.",
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

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [craftSteps, setCraftSteps] = useState<CraftStep[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(DEFAULT_STORE_INFO);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [p, c, t, craft, ord] = await Promise.all([
        getProducts(),
        getCollections(),
        getTestimonials(),
        getCraftSteps(),
        getOrders(),
      ]);
      setProducts(p);
      setCollections(c.length ? c : []);
      setTestimonials(t.length ? t : []);
      setCraftSteps(craft.length ? craft : []);
      setOrders(ord);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const addOrder = async (order: Omit<Order, "id" | "date" | "status">) => {
    const created = await createOrder(order);
    if (created) setOrders((prev) => [created, ...prev]);
    return created;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatusApi(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const saveBrandSettings = async (data: Partial<StoreInfo>) => {
    const next = { ...storeInfo, ...data };
    setStoreInfo(next);
    await saveStoreSettings("brand_full", next);
  };

  const value = useMemo(() => ({
    loading,
    products,
    collections,
    testimonials,
    craftSteps,
    storeInfo,
    orders,
    refreshAll,
    setProductsLocal: setProducts,
    setStoreInfoLocal: setStoreInfo,
    addOrder,
    updateOrderStatus,
    saveBrandSettings,
  }), [loading, products, collections, testimonials, craftSteps, storeInfo, orders]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
