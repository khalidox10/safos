import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  LogOut, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Save, 
  Menu,
  RefreshCw,
  Download,
  Send,
  Printer,
  Upload,
  Globe,
  Plus,
  Palette,
  Image as ImageIcon,
  Lock,
  Star
} from "lucide-react";
import { useStore } from "../context/StoreContext";

const BUCKETS = { 
  LOGOS: "logos", 
  PRODUCT_IMAGES: "product-images" 
};

interface Category {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
}

interface Product {
  id: string;
  name: string;
  name_en: string;
  name_fr: string;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string;
  category: string;
  color: string;
  tag: string | null;
  description: string;
  description_en: string;
  description_fr: string;
  materials_dimensions: string;
  materials_dimensions_en: string;
  materials_dimensions_fr: string;
  care_guide: string;
  care_guide_en: string;
  care_guide_fr: string;
  additional_images: string[];
  video_url: string;
  show_video: boolean;
  show_gallery: boolean;
  show_care_guide: boolean;
  show_dimensions: boolean;
}

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { refreshData } = useStore();
  const { session, logout } = useAuth();

  // الواجهة والتنقل
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "settings" | "reviews" | "categories">("dashboard");
  const [activeSettingsSection, setActiveSettingsSection] = useState<"identity" | "hero" | "about" | "pillars" | "testimonials" | "policies" | "contact" | "templates" | "style" | "checkout" | "menu">("identity");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lang, setLang] = useState<"ar" | "fr" | "en">("ar");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [settings, setSettings] = useState<any>({
    site_name_ar: "SAFOS", site_name_fr: "SAFOS", site_name_en: "SAFOS",
    site_subtitle_ar: "ورشة التطريز", site_subtitle_fr: "Atelier Brodé", site_subtitle_en: "Embroidered Atelier",
    logo_letter: "S", logo_url: "",
    hero_title_ar: "", hero_title_fr: "", hero_title_en: "",
    hero_subtitle_ar: "", hero_subtitle_fr: "", hero_subtitle_en: "",
    hero_description_ar: "", hero_description_fr: "", hero_description_en: "",
    hero_image_url: "",
    announcement_text_ar: "", announcement_text_fr: "", announcement_text_en: "",
    phone: "", whatsapp: "", email: "", address: "",
    instagram: "", facebook: "", tiktok: "",
    primary_color: "#000000", secondary_color: "#D4AF37", accent_color: "#A37A3E",
    title_color: "#FFFFFF", text_color: "#A1A1AA",
    card_bg: "#0F0F0F", accordion_bg: "#0F0F0F", image_bg: "#0F0F0F",
    title_font: "Playfair Display", body_font: "Montserrat",
    currency: "MAD", currency_symbol: "د.م",
    about_title_ar: "", about_title_fr: "", about_title_en: "",
    about_text_ar: "", about_text_fr: "", about_text_en: "",
    about_image: "",
    p1_title_ar: "", p1_title_fr: "", p1_title_en: "", p1_desc_ar: "", p1_desc_fr: "", p1_desc_en: "",
    p2_title_ar: "", p2_title_fr: "", p2_title_en: "", p2_desc_ar: "", p2_desc_fr: "", p2_desc_en: "",
    p3_title_ar: "", p3_title_fr: "", p3_title_en: "", p3_desc_ar: "", p3_desc_fr: "", p3_desc_en: "",
    t1_name_ar: "", t1_name_fr: "", t1_name_en: "", t1_text_ar: "", t1_text_fr: "", t1_text_en: "", t1_rating: "5",
    t2_name_ar: "", t2_name_fr: "", t2_name_en: "", t2_text_ar: "", t2_text_fr: "", t2_text_en: "", t2_rating: "5",
    shipping_policy_ar: "", shipping_policy_fr: "", shipping_policy_en: "",
    refund_policy_ar: "", refund_policy_fr: "", refund_policy_en: "",
    copyright_text: "",
    cod_confirm_ar: "", cod_confirm_fr: "", cod_confirm_en: "",
    review_request_ar: "", review_request_fr: "", review_request_en: "",
    show_about_section: true, show_pillars_section: true, show_testimonials_section: true, show_announcement_bar: true,
    field_name_ar: "", field_name_fr: "", field_name_en: "", field_name_required: true, field_name_visible: true,
    field_phone_ar: "", field_phone_fr: "", field_phone_en: "", field_phone_required: true, field_phone_visible: true,
    field_city_ar: "", field_city_fr: "", field_city_en: "", field_city_required: true, field_city_visible: true,
    field_address_ar: "", field_address_fr: "", field_address_en: "", field_address_required: true, field_address_visible: true,
    field_notes_ar: "", field_notes_fr: "", field_notes_en: "", field_notes_required: false, field_notes_visible: true,
    menu_p1_ar: "", menu_p1_fr: "", menu_p1_en: "", menu_p1_visible: true,
    menu_p2_ar: "", menu_p2_fr: "", menu_p2_en: "", menu_p2_visible: true,
    menu_p3_ar: "", menu_p3_fr: "", menu_p3_en: "", menu_p3_visible: true,
    menu_p4_ar: "", menu_p4_fr: "", menu_p4_en: "", menu_p4_visible: true,
    menu_p5_ar: "", menu_p5_fr: "", menu_p5_en: "", menu_p5_visible: true
  });

  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const [newProduct, setNewProduct] = useState<any>({
    name: "", name_en: "", name_fr: "", price: 0, old_price: null, stock: 5, image_url: "", category: "",
    color: "", tag: "", description: "", description_en: "", description_fr: "",
    materials_dimensions: "", materials_dimensions_en: "", materials_dimensions_fr: "",
    care_guide: "", care_guide_en: "", care_guide_fr: "", additional_images: [], video_url: "",
    show_video: true, show_gallery: true, show_care_guide: true, show_dimensions: true
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name_ar: "", name_fr: "", name_en: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("safos-lang");
    if (savedLang === "ar" || savedLang === "fr" || savedLang === "en") {
      setLang(savedLang as any);
    }
  }, []);

  const handleLangChange = (newLang: "ar" | "fr" | "en") => {
    setLang(newLang);
    localStorage.setItem("safos-lang", newLang);
  };

  useEffect(() => {
    if (!session.isAuthenticated) {
      navigate("/admin/login");
    } else {
      fetchData();
    }
  }, [session, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setConnectionError(null);
    try {
      if (!supabase) {
        throw new Error("سوبابيس غير متصل.");
      }
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name_ar");
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      const { data: settingsData, error: settingsError } = await supabase
        .from("store_settings")
        .select("*");
      if (settingsError) throw settingsError;

      if (settingsData && settingsData.length > 0) {
        const brand = settingsData.find(s => s.key === "brand")?.value || {};
        const colors = settingsData.find(s => s.key === "colors")?.value || {};
        const contact = settingsData.find(s => s.key === "contact")?.value || {};
        const hero = settingsData.find(s => s.key === "hero")?.value || {};
        const about = settingsData.find(s => s.key === "about")?.value || {};
        const pillars = settingsData.find(s => s.key === "pillars")?.value || {};
        const testimonials = settingsData.find(s => s.key === "testimonials")?.value || {};
        const policies = settingsData.find(s => s.key === "policies")?.value || {};
        const templates = settingsData.find(s => s.key === "templates")?.value || {};
        const menuLinks = settingsData.find(s => s.key === "menu_links")?.value || {};
        const checkoutFields = settingsData.find(s => s.key === "checkout_fields")?.value || {};
        const visibility = settingsData.find(s => s.key === "visibility")?.value || {};

        setSettings({
          site_name_ar: brand.name_ar || "", site_name_fr: brand.name_fr || "", site_name_en: brand.name_en || "",
          site_subtitle_ar: brand.subtitle_ar || "", site_subtitle_fr: brand.subtitle_fr || "", site_subtitle_en: brand.subtitle_en || "",
          logo_letter: brand.logo_letter || "S", logo_url: brand.logo_url || "",
          hero_title_ar: hero.title_ar || "", hero_title_fr: hero.title_fr || "", hero_title_en: hero.title_en || "",
          hero_subtitle_ar: hero.subtitle_ar || "", hero_subtitle_fr: hero.subtitle_fr || "", hero_subtitle_en: hero.subtitle_en || "",
          hero_description_ar: hero.description_ar || "", hero_description_fr: hero.description_fr || "", hero_description_en: hero.description_en || "",
          hero_image_url: hero.image || "",
          announcement_text_ar: hero.announcement_ar || "", announcement_text_fr: hero.announcement_fr || "", announcement_text_en: hero.announcement_en || "",
          phone: contact.phone || "", whatsapp: contact.whatsapp || "", email: contact.email || "", address: contact.address || "",
          instagram: contact.instagram || "", facebook: contact.facebook || "", tiktok: contact.tiktok || "",
          primary_color: colors.primary || "#000000", secondary_color: colors.secondary || "#D4AF37", accent_color: colors.accent || "#A37A3E",
          title_color: colors.title_color || "#FFFFFF", text_color: colors.text_color || "#A1A1AA",
          card_bg: colors.card_bg || "#0F0F0F", accordion_bg: colors.accordion_bg || "#0F0F0F", image_bg: colors.image_bg || "#0F0F0F",
          title_font: colors.title_font || "Playfair Display", body_font: colors.body_font || "Montserrat",
          currency: contact.currency || "MAD", currency_symbol: contact.currency_symbol || "د.م",
          about_title_ar: about.title_ar || "", about_title_fr: about.title_fr || "", about_title_en: about.title_en || "",
          about_text_ar: about.text_ar || "", about_text_fr: about.text_fr || "", about_text_en: about.text_en || "",
          about_image: about.image || "",
          p1_title_ar: pillars.p1_title_ar || "", p1_title_fr: pillars.p1_title_fr || '', p1_title_en: pillars.p1_title_en || "", p1_desc_ar: pillars.p1_desc_ar || "", p1_desc_fr: pillars.p1_desc_fr || "", p1_desc_en: pillars.p1_desc_en || "",
          p2_title_ar: pillars.p2_title_ar || "", p2_title_fr: pillars.p2_title_fr || "", p2_title_en: pillars.p2_title_en || "", p2_desc_ar: pillars.p2_desc_ar || "", p2_desc_fr: pillars.p2_desc_fr || "", p2_desc_en: pillars.p2_desc_en || "",
          p3_title_ar: pillars.p3_title_ar || "", p3_title_fr: pillars.p3_title_fr || "", p3_title_en: pillars.p3_title_en || "", p3_desc_ar: pillars.p3_desc_ar || "", p3_desc_fr: pillars.p3_desc_fr || "", p3_desc_en: pillars.p3_desc_en || "",
          t1_name_ar: testimonials.t1_name_ar || "", t1_name_fr: testimonials.t1_name_fr || "", t1_name_en: testimonials.t1_name_en || "", t1_text_ar: testimonials.t1_text_ar || "", t1_text_fr: testimonials.t1_text_fr || "", t1_text_en: testimonials.t1_text_en || "", t1_rating: testimonials.t1_rating || "5",
          t2_name_ar: testimonials.t2_name_ar || "", t2_name_fr: testimonials.t2_name_fr || "", t2_name_en: testimonials.t2_name_en || "", t2_text_ar: testimonials.t2_text_ar || "", t2_text_fr: testimonials.t2_text_fr || "", t2_text_en: testimonials.t2_text_en || "", t2_rating: testimonials.t2_rating || "5",
          shipping_policy_ar: policies.shipping_ar || "", shipping_policy_fr: policies.shipping_fr || "", shipping_policy_en: policies.shipping_en || "",
          refund_policy_ar: policies.refund_ar || "", refund_policy_fr: policies.refund_fr || "", refund_policy_en: policies.refund_en || "",
          copyright_text: policies.copyright || "",
          cod_confirm_ar: templates.cod_confirm_ar || "", cod_confirm_fr: templates.cod_confirm_fr || "", cod_confirm_en: templates.cod_confirm_en || "",
          review_request_ar: templates.review_request_ar || "", review_request_fr: templates.review_request_fr || "", review_request_en: templates.review_request_en || "",
          show_about_section: visibility.show_about_section !== false,
          show_pillars_section: visibility.show_pillars_section !== false,
          show_testimonials_section: visibility.show_testimonials_section !== false,
          show_announcement_bar: visibility.show_announcement_bar !== false,
          field_name_ar: checkoutFields.field_name_ar || "", field_name_fr: checkoutFields.field_name_fr || "", field_name_en: checkoutFields.field_name_en || "", field_name_required: checkoutFields.field_name_required !== false, field_name_visible: checkoutFields.field_name_visible !== false,
          field_phone_ar: checkoutFields.field_phone_ar || "", field_phone_fr: checkoutFields.field_phone_fr || "", field_phone_en: checkoutFields.field_phone_en || "", field_phone_required: checkoutFields.field_phone_required !== false, field_phone_visible: checkoutFields.field_phone_visible !== false,
          field_city_ar: checkoutFields.field_city_ar || "", field_city_fr: checkoutFields.field_city_fr || "", field_city_en: checkoutFields.field_city_en || "", field_city_required: checkoutFields.field_city_required !== false, field_city_visible: checkoutFields.field_city_visible !== false,
          field_address_ar: checkoutFields.field_address_ar || "", field_address_fr: checkoutFields.field_address_fr || "", field_address_en: checkoutFields.field_address_en || "", field_address_required: checkoutFields.field_address_required !== false, field_address_visible: checkoutFields.field_address_visible !== false,
          field_notes_ar: checkoutFields.field_notes_ar || "", field_notes_fr: checkoutFields.field_notes_fr || "", field_notes_en: checkoutFields.field_notes_en || "", field_notes_required: checkoutFields.field_notes_required === true, field_notes_visible: checkoutFields.field_notes_visible !== false,
          menu_p1_ar: menuLinks.menu_p1_ar || "", menu_p1_fr: menuLinks.menu_p1_fr || "", menu_p1_en: menuLinks.menu_p1_en || "", menu_p1_visible: menuLinks.menu_p1_visible !== false,
          menu_p2_ar: menuLinks.menu_p2_ar || "", menu_p2_fr: menuLinks.menu_p2_fr || "", menu_p2_en: menuLinks.menu_p2_en || "", menu_p2_visible: menuLinks.menu_p2_visible !== false,
          menu_p3_ar: menuLinks.menu_p3_ar || "", menu_p3_fr: menuLinks.menu_p3_fr || "", menu_p3_en: menuLinks.menu_p3_en || "", menu_p3_visible: menuLinks.menu_p3_visible !== false,
          menu_p4_ar: menuLinks.menu_p4_ar || "", menu_p4_fr: menuLinks.menu_p4_fr || "", menu_p4_en: menuLinks.menu_p4_en || "", menu_p4_visible: menuLinks.menu_p4_visible !== false,
          menu_p5_ar: menuLinks.menu_p5_ar || "", menu_p5_fr: menuLinks.menu_p5_fr || "", menu_p5_en: menuLinks.menu_p5_en || "", menu_p5_visible: menuLinks.menu_p5_visible !== false
        });
      }
    } catch (err: any) {
      showToast(err.message || "فشل تحميل البيانات من السحابة", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  async function handleImageUpload(file: File, bucketKey: string): Promise<string> {
    if (!supabase) {
      throw new Error("سوبابيس غير متصل.");
    }
    const bucketName = bucketKey === "LOGOS" ? "logos" : "product-images";
    const fileName = `safos-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);
    if (error) {
      throw new Error(error.message);
    }
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  const handleDownloadImage = async (imageUrl: string, fileName: string) => {
    if (!imageUrl) return;
    try {
      showToast("جاري التحميل...", "success");
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName.replace(/\s+/g, "_")}_safos.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleSendWhatsAppMessage = (order: any, type: "confirm" | "review") => {
    if (!order) return;
    const cleanPhone = order.customer_phone.replace(/\s+/g, "");
    
    let template = "";
    if (type === "confirm") {
      template = lang === "ar" ? settings.cod_confirm_ar : lang === "fr" ? settings.cod_confirm_fr : settings.cod_confirm_en;
    } else {
      template = lang === "ar" ? settings.review_request_ar : lang === "fr" ? settings.review_request_fr : settings.review_request_en;
    }

    const reviewUrl = `https://safos.online/review/${order.items && order.items[0] ? order.items[0].id : ""}`;

    let message = template
      .replace(/{name}/g, order.customer_name)
      .replace(/{order_number}/g, order.order_number)
      .replace(/{total}/g, order.total)
      .replace(/{city}/g, order.customer_city)
      .replace(/{review_url}/g, reviewUrl);

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(`order-status-${orderId}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast("تم تحديث حالة الطلب بنجاح", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleReviewStatus = async (reviewId: string, currentStatus: boolean) => {
    setActionLoading(`review-${reviewId}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: !currentStatus })
        .eq("id", reviewId);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: !currentStatus } : r));
      showToast("تم تعديل حالة المراجعة", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("هل تريد حذف هذا التقييم نهائياً؟")) return;
    setActionLoading(`del-review-${reviewId}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = await supabase
        .from("reviews")
        .delete().eq("id", reviewId);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast("تم حذف التقييم بنجاح", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    setActionLoading(`del-order-${orderId}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast("تم حذف الطلبية بنجاح", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("save-category");
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = editingCategory
        ? await supabase.from("categories").update(newCategory).eq("id", editingCategory.id)
        : await supabase.from("categories").insert([newCategory]);
      
      if (error) throw error;
      showToast("تم حفظ المجموعة بنجاح", "success");
      setIsAddingCategory(false);
      setEditingCategory(null);
      setNewCategory({ name_ar: "", name_fr: "", name_en: "" });
      await refreshData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المجموعة؟")) return;
    setActionLoading(`del-cat-${catId}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = await supabase.from("categories").delete().eq("id", catId);
      if (error) throw error;
      showToast("تم حذف المجموعة بنجاح", "success");
      await refreshData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("add-product");
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const payload = { ...newProduct };
      if (!payload.category) payload.category = null;

      const { error } = await supabase
        .from("products")
        .insert([payload]);
      if (error) throw error;
      showToast("تمتضافة المنتج بنجاح", "success");
      setIsAddingProduct(false);
      setNewProduct({
        name: "", name_en: "", name_fr: "", price: 0, old_price: null, stock: 5, image_url: "", category: "",
        color: "", tag: "", description: "", description_en: "", description_fr: "",
        materials_dimensions: "", materials_dimensions_en: "", materials_dimensions_fr: "",
        care_guide: "", care_guide_en: "", care_guide_fr: "", additional_images: [], video_url: "",
        show_video: true, show_gallery: true, show_care_guide: true, show_dimensions: true
      });
      await refreshData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionLoading(`save-prod-${editingProduct.id}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const payload = { ...editingProduct };
      if (!payload.category) payload.category = null as any;

      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
      if (error) throw error;
      showToast("تم حفظ التعديلات بنجاح", "success");
      setEditingProduct(null);
      await refreshData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("هل تريد حذف هذا المنتج نهائياً؟")) return;
    setActionLoading(`del-prod-${productId}`);
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const { error } = await supabase
        .from("products")
        .delete().eq("id", productId);
      if (error) throw error;
      showToast("تم الحذف بنجاح", "success");
      await refreshData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("settings");
    try {
      if (!supabase) throw new Error("سوبابيس غير متصل.");
      const updates = [
        {
          key: "brand",
          value: { name_ar: settings.site_name_ar, name_fr: settings.site_name_fr, name_en: settings.site_name_en, subtitle_ar: settings.site_subtitle_ar, subtitle_fr: settings.site_subtitle_fr, subtitle_en: settings.site_subtitle_en, logo_letter: settings.logo_letter, logo_url: settings.logo_url }
        },
        {
          key: "colors",
          value: { primary: settings.primary_color, secondary: settings.secondary_color, title_color: settings.title_color, text_color: settings.text_color, card_bg: settings.card_bg, accordion_bg: settings.accordion_bg, image_bg: settings.image_bg, title_font: settings.title_font, body_font: settings.body_font, admin_bg_color: settings.admin_bg_color, admin_card_bg: settings.admin_card_bg, admin_text_color: settings.admin_text_color, admin_button_bg_color: settings.admin_button_bg_color, admin_button_text_color: settings.admin_button_text_color, button_bg_color: settings.button_bg_color, button_text_color: settings.button_text_color }
        },
        {
          key: "contact",
          value: {
            phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email, address: settings.address,
            instagram: settings.instagram, facebook: settings.facebook, tiktok: settings.tiktok, currency: settings.currency, currency_symbol: settings.currency_symbol
          }
        },
        {
          key: "hero",
          value: { title_ar: settings.hero_title_ar, title_fr: settings.hero_title_fr, title_en: settings.hero_title_en, subtitle_ar: settings.hero_subtitle_ar, subtitle_fr: settings.hero_subtitle_fr, subtitle_en: settings.hero_subtitle_en, description_ar: settings.hero_description_ar, description_fr: settings.hero_description_fr, description_en: settings.hero_description_en, image: settings.hero_image_url, announcement_ar: settings.announcement_text_ar, announcement_fr: settings.announcement_text_fr, announcement_en: settings.announcement_text_en }
        },
        {
          key: "about",
          value: { title_ar: settings.about_title_ar, title_fr: settings.about_title_fr, title_en: settings.about_title_en, text_ar: settings.about_text_ar, text_fr: settings.about_text_fr, text_en: settings.about_text_en, image: settings.about_image }
        },
        {
          key: "pillars",
          value: {
            p1_title_ar: settings.p1_title_ar, p1_title_fr: settings.p1_title_fr, p1_title_en: settings.p1_title_en, p1_desc_ar: settings.p1_desc_ar, p1_desc_fr: settings.p1_desc_fr, p1_desc_en: settings.p1_desc_en,
            p2_title_ar: settings.p2_title_ar, p2_title_fr: settings.p2_title_fr, p2_title_en: settings.p2_title_en, p2_desc_ar: settings.p2_desc_ar, p2_desc_fr: settings.p2_desc_fr, p2_desc_en: settings.p2_desc_en,
            p3_title_ar: settings.p3_title_ar, p3_title_fr: settings.p3_title_fr, p3_title_en: settings.p3_title_en, p3_desc_ar: settings.p3_desc_ar, p3_desc_fr: settings.p3_desc_fr, p3_desc_en: settings.p3_desc_en
          }
        },
        {
          key: "testimonials",
          value: {
            t1_name_ar: settings.t1_name_ar, t1_name_fr: settings.t1_name_fr, t1_name_en: settings.t1_name_en, t1_text_ar: settings.t1_text_ar, t1_text_fr: settings.t1_text_fr, t1_text_en: settings.t1_text_en, t1_rating: settings.t1_rating,
            t2_name_ar: settings.t2_name_ar, t2_name_fr: settings.t2_name_fr, t2_name_en: settings.t2_name_en, t2_text_ar: settings.t2_text_ar, t2_text_fr: settings.t2_text_fr, t2_text_en: settings.t2_text_en, t2_rating: settings.t2_rating
          }
        },
        {
          key: "policies",
          value: { shipping_ar: settings.shipping_policy_ar, shipping_fr: settings.shipping_policy_fr, shipping_en: settings.shipping_policy_en, refund_ar: settings.refund_policy_ar, refund_fr: settings.refund_policy_fr, refund_en: settings.refund_policy_en, copyright: settings.copyright_text }
        },
        {
          key: "templates",
          value: {
            cod_confirm_ar: settings.cod_confirm_ar, cod_confirm_fr: settings.cod_confirm_fr, cod_confirm_en: settings.cod_confirm_en,
            review_request_ar: settings.review_request_ar, review_request_fr: settings.review_request_fr, review_request_en: settings.review_request_en
          }
        },
        {
          key: "menu_links",
          value: {
            menu_p1_ar: settings.menu_p1_ar, menu_p1_fr: settings.menu_p1_fr, menu_p1_en: settings.menu_p1_en, menu_p1_visible: settings.menu_p1_visible,
            menu_p2_ar: settings.menu_p2_ar, menu_p2_fr: settings.menu_p2_fr, menu_p2_en: settings.menu_p2_en, menu_p2_visible: settings.menu_p2_visible,
            menu_p3_ar: settings.menu_p3_ar, menu_p3_fr: settings.menu_p3_fr, menu_p3_en: settings.menu_p3_en, menu_p3_visible: settings.menu_p3_visible,
            menu_p4_ar: settings.menu_p4_ar, menu_p4_fr: settings.menu_p4_fr, menu_p4_en: settings.menu_p4_en, menu_p4_visible: settings.menu_p4_visible,
            menu_p5_ar: settings.menu_p5_ar, menu_p5_fr: settings.menu_p5_fr, menu_p5_en: settings.menu_p5_en, menu_p5_visible: settings.menu_p5_visible
          }
        },
        {
          key: "checkout_fields",
          value: {
            field_name_ar: settings.field_name_ar, field_name_fr: settings.field_name_fr, field_name_en: settings.field_name_en, field_name_required: settings.field_name_required, field_name_visible: settings.field_name_visible,
            field_phone_ar: settings.field_phone_ar, field_phone_fr: settings.field_phone_fr, field_phone_en: settings.field_phone_en, field_phone_required: settings.field_phone_required, field_phone_visible: settings.field_phone_visible,
            field_city_ar: settings.field_city_ar, field_city_fr: settings.field_city_fr, field_city_en: settings.field_city_en, field_city_required: settings.field_city_required, field_city_visible: settings.field_city_visible,
            field_address_ar: settings.field_address_ar, field_address_fr: settings.field_address_fr, field_address_en: settings.field_address_en, field_address_required: settings.field_address_required, field_address_visible: settings.field_address_visible,
            field_notes_ar: settings.field_notes_ar, field_notes_fr: settings.field_notes_fr, field_notes_en: settings.field_notes_en, field_notes_required: settings.field_notes_required, field_notes_visible: settings.field_notes_visible
          }
        },
        {
          key: "visibility",
          value: {
            show_about_section: settings.show_about_section,
            show_pillars_section: settings.show_pillars_section,
            show_testimonials_section: settings.show_testimonials_section,
            show_announcement_bar: settings.show_announcement_bar
          }
        }
      ];

      for (const item of updates) {
        const { error } = await supabase.from("store_settings").upsert({
          key: item.key,
          value: item.value,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });
        if (error) throw error;
      }

      showToast("تمت مزامنة جميع الإعدادات التخصيصية بنجاح", "success");
      await refreshData();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status !== "cancelled" && o.payment_status === "paid")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === "pending").length;
  const lowStockProducts = products.filter(p => p.stock < 3);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number?.toLowerCase() || "").includes(orderSearch.toLowerCase()) ||
      (order.customer_name?.toLowerCase() || "").includes(orderSearch.toLowerCase()) ||
      (order.customer_phone || "").includes(orderSearch);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrdersCount = orders.length || 1;
  const pendingPercent = Math.round((orders.filter(o => o.status === "pending").length / totalOrdersCount) * 100);
  const confirmedPercent = Math.round((orders.filter(o => o.status === "confirmed").length / totalOrdersCount) * 100);
  const shippedPercent = Math.round((orders.filter(o => o.status === "shipped").length / totalOrdersCount) * 100);
  const deliveredPercent = Math.round((orders.filter(o => o.status === "delivered").length / totalOrdersCount) * 100);
  const cancelledPercent = Math.round((orders.filter(o => o.status === "cancelled").length / totalOrdersCount) * 100);

  const settingsSections: { id: "identity" | "hero" | "about" | "pillars" | "testimonials" | "policies" | "contact" | "templates" | "style" | "checkout" | "menu"; label: string; icon: any }[] = [
    { id: "identity", label: "الشعار والهوية البصرية", icon: Globe },
    { id: "style", label: "الألوان والخطوط الفاخرة", icon: Palette },
    { id: "menu", label: "إدارة قائمة التنقل (Menu)", icon: Menu },
    { id: "checkout", label: "إدارة حقول الشراء (Checkout)", icon: Lock },
    { id: "templates", label: "قوالب رسائل الواتساب", icon: Send },
    { id: "hero", label: "البانر الترحيبي والفرعي", icon: ImageIcon },
    { id: "about", label: "قصة الماركة (من نحن)", icon: Clock },
    { id: "pillars", label: "ركائز الفخامة (لماذا نحن)", icon: AlertCircle },
    { id: "testimonials", label: "آراء العميلات والتقييمات", icon: CheckCircle },
    { id: "policies", label: "السياسات وتذييل الصفحة", icon: SettingsIcon },
    { id: "contact", label: "بيانات التواصل والشبكات", icon: Phone }
  ];

  return (
    <div 
      style={{
        "--admin-bg-theme": settings.admin_bg_color || "#FFFFFF",
        "--admin-text-theme": settings.admin_text_color || "#18181B",
        "--admin-card-theme": settings.admin_card_bg || "#F4F4F5",
        "--admin-btn-theme": settings.admin_button_bg_color || "#18181B",
        "--admin-btn-text": settings.admin_button_text_color || "#FFFFFF",
        "--secondary-theme": settings.secondary_color || "#D4AF37",
        backgroundColor: "var(--admin-bg-theme)",
        color: "var(--admin-text-theme)"
      } as React.CSSProperties}
      className="min-h-screen flex font-sans antialiased selection:bg-amber-500/30 print:bg-white print:text-black animate-fadeIn"
    >
      <aside className="print:hidden fixed inset-y-0 right-0 z-30 w-64 bg-white border-l border-zinc-200 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:translate-x-0">
        <div>
          <div className="p-8 border-b border-zinc-100 text-center">
            <h1 className="text-2xl font-bold tracking-[0.3em]" style={{ color: "var(--secondary-theme)" }}>
              {lang === "ar" ? settings.site_name_ar : lang === "fr" ? settings.site_name_fr : settings.site_name_en}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
              {lang === "ar" ? settings.site_subtitle_ar : lang === "fr" ? settings.site_subtitle_fr : settings.site_subtitle_en}
            </p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard", label: "الإحصائيات العامة والتحليل", icon: LayoutDashboard },
              { id: "orders", label: "إدارة الطلبيات والمبيعات", icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
              { id: "products", label: "حقائب ومخزون الكانفاس", icon: TrendingUp, badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined },
              { id: "categories", label: "مجموعات وتصنيفات السلع", icon: Menu },
              { id: "reviews", label: "تقييمات وآراء العميلات", icon: Star },
              { id: "settings", label: "تخصيص الموقع والرسائل", icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 text-xs font-light"
                  style={{
                    backgroundColor: isActive ? "rgba(212, 175, 55, 0.05)" : "transparent",
                    color: isActive ? "var(--secondary-theme)" : "#71717a",
                    borderRight: isActive ? "3px solid var(--secondary-theme)" : "none"
                  }}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-100 text-zinc-500">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-100 space-y-3">
          <div className="flex items-center justify-center space-x-2 space-x-reverse bg-zinc-50 p-2 rounded-xl border border-zinc-100">
            <button onClick={() => handleLangChange("ar")} className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all ${lang === "ar" ? "text-black font-bold" : "text-zinc-400"}`} style={{ backgroundColor: lang === "ar" ? "var(--secondary-theme)" : "transparent" }}>AR</button>
            <button onClick={() => handleLangChange("fr")} className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all ${lang === "fr" ? "text-black font-bold" : "text-zinc-400"}`} style={{ backgroundColor: lang === "fr" ? "var(--secondary-theme)" : "transparent" }}>FR</button>
            <button onClick={() => handleLangChange("en")} className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all ${lang === "en" ? "text-black font-bold" : "text-zinc-400"}`} style={{ backgroundColor: lang === "en" ? "var(--secondary-theme)" : "transparent" }}>EN</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-200 text-sm">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto print:p-0">
        <div className="print:hidden flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
          <h2 className="text-2xl font-light">
            {activeTab === "dashboard" && "الإحصائيات العامة والتحليل"}
            {activeTab === "orders" && "سجل المبيعات والطلبات"}
            {activeTab === "products" && "إدارة المنتجات وتعديل الخصائص"}
            {activeTab === "categories" && "إدارة مجموعات وتصنيفات السلع"}
            {activeTab === "reviews" && "إدارة وتقييمات العميلات"}
            {activeTab === "settings" && "تخصيص الموقع والرسائل"}
          </h2>
          <button onClick={fetchData} className="p-2.5 bg-white border border-zinc-100 hover:text-amber-500 rounded-xl transition">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} style={{ color: loading ? "var(--secondary-theme)" : "#71717a" }} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-100 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div className="space-y-8 print:hidden animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: "var(--admin-card-theme)", borderColor: "rgba(0,0,0,0.05)" }}>
                    <span className="text-xs text-zinc-400">إجمالي الأرباح المستلمة</span>
                    <div className="mt-4 text-3xl font-light">{totalRevenue.toLocaleString()} <span style={{ color: "var(--secondary-theme)" }}>درهم</span></div>
                  </div>
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: "var(--admin-card-theme)", borderColor: "rgba(0,0,0,0.05)" }}>
                    <span className="text-xs text-zinc-400">الطلبات قيد الانتظار</span>
                    <div className="mt-4 text-3xl font-light" style={{ color: "var(--secondary-theme)" }}>{pendingOrdersCount}</div>
                  </div>
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: "var(--admin-card-theme)", borderColor: "rgba(0,0,0,0.05)" }}>
                    <span className="text-xs text-red-400">نقص المخزون</span>
                    <div className="mt-4 text-3xl font-light text-red-500">{lowStockProducts.length}</div>
                  </div>
                  <div className="border p-6 rounded-2xl" style={{ backgroundColor: "var(--admin-card-theme)", borderColor: "rgba(0,0,0,0.05)" }}>
                    <span className="text-xs text-zinc-400">إجمالي السلع</span>
                    <div className="mt-4 text-3xl font-light">{products.length}</div>
                  </div>
                </div>

                <div className="border p-8 rounded-3xl animate-fadeIn" style={{ backgroundColor: "var(--admin-card-theme)", borderColor: "rgba(0,0,0,0.05)" }}>
                  <h3 className="text-lg font-light">توزيع حالات طلبيات الكانفاس</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-10">
                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="var(--secondary-theme)" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * pendingPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{pendingPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">معلقة ({orders.filter(o => o.status === "pending").length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#8b5cf6" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * confirmedPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{confirmedPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">مؤكدة ({orders.filter(o => o.status === "confirmed").length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * shippedPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{shippedPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">مشحونة ({orders.filter(o => o.status === "shipped").length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * deliveredPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{deliveredPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">موزعة ({orders.filter(o => o.status === "delivered").length})</span>
                    </div>

                    <div className="flex flex-col items-center space-y-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#ef4444" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * cancelledPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 m-auto h-fit text-center font-mono text-sm font-semibold">{cancelledPercent}%</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">ملغاة ({orders.filter(o => o.status === "cancelled").length})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="bg-white border p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <input
                    type="text"
                    placeholder="البحث بالاسم، الهاتف، أو رقم الطلب..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full md:w-96 p-2.5 bg-zinc-50 border rounded-xl text-zinc-800 focus:outline-none"
                  />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border text-zinc-600 py-2 px-3 rounded-xl text-xs">
                    <option value="all">كل حالات الشحن</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>

                <div className="bg-white border rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfbf9] text-zinc-400 text-[10px] uppercase border-b">
                      <tr>
                        <th className="py-4 px-6">رقم الطلب</th>
                        <th className="py-4 px-6">العميل</th>
                        <th className="py-4 px-6 text-left">قيمة الطلب</th>
                        <th className="py-4 px-6 text-center">حالة الشحن</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50/50">
                          <td className="py-4 px-6 font-mono text-xs font-semibold" style={{ color: "var(--secondary-theme)" }}>{order.order_number}</td>
                          <td className="py-4 px-6 font-medium text-zinc-800">{order.customer_name}</td>
                          <td className="py-4 px-6 text-left">{order.total} درهم</td>
                          <td className="py-4 px-6 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs py-1 px-2.5 rounded bg-white border"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">مؤكد</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التوصيل</option>
                              <option value="cancelled">ملغى</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-center flex items-center justify-center space-x-2 space-x-reverse">
                            <button onClick={() => setSelectedOrder(order)} className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200"><Eye size={14}/></button>
                            <button onClick={() => handleSendWhatsAppMessage(order, "confirm")} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Send size={14}/></button>
                            {order.status === "delivered" && (
                              <button onClick={() => handleSendWhatsAppMessage(order, "review")} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200"><Star size={14}/></button>
                            )}
                            <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 bg-red-50 text-red-650 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-light">مخزون الكانفاس</h3>
                  <button onClick={() => setIsAddingProduct(true)} className="text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 space-x-reverse" style={{ backgroundColor: "var(--admin-btn-theme)", color: "var(--admin-btn-text)" }}>
                    <Plus size={16} />
                    <span>إضافة منتج كانفاس جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-2xl overflow-hidden p-5 bg-white flex flex-col justify-between">
                      <div>
                        <div className="w-full h-48 bg-zinc-50 rounded-xl overflow-hidden mb-4 relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-light">لا توجد صورة</div>
                          )}
                          {product.image_url && (
                            <button
                              onClick={() => handleDownloadImage(product.image_url, product.name)}
                              className="absolute bottom-3 right-3 bg-white/80 hover:bg-zinc-100 text-zinc-700 p-2.5 rounded-full shadow-md"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                        <h4 className="text-base font-light">{product.name}</h4>
                        <p className="text-xs font-mono mt-1" style={{ color: "var(--secondary-theme)" }}>{product.price} درهم</p>
                      </div>

                      <div className="border-t pt-4 mt-4 flex gap-2">
                        <button onClick={() => setEditingProduct(product)} className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 space-x-reverse">
                          <Edit3 size={14} />
                          <span>تعديل الخصائص</span>
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-50 text-red-650 hover:bg-red-100 rounded-xl"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-light">مجموعات وتصنيفات السلع</h3>
                  <button onClick={() => setIsAddingCategory(true)} className="text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 space-x-reverse" style={{ backgroundColor: "var(--admin-btn-theme)", color: "var(--admin-btn-text)" }}>
                    <Plus size={16} />
                    <span>إضافة مجموعة جديدة</span>
                  </button>
                </div>

                <div className="bg-white border rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfbf9] text-zinc-400 text-[10px] uppercase border-b">
                      <tr>
                        <th className="py-4 px-6">المجموعة بالعربية</th>
                        <th className="py-4 px-6">المجموعة بالفرنسية</th>
                        <th className="py-4 px-6">المجموعة بالإنجليزية</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-zinc-50/50">
                          <td className="py-4 px-6 font-medium text-zinc-800">{cat.name_ar}</td>
                          <td className="py-4 px-6 text-zinc-400">{cat.name_fr}</td>
                          <td className="py-4 px-6 text-zinc-400">{cat.name_en}</td>
                          <td className="py-4 px-6 text-center flex items-center justify-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setNewCategory({ name_ar: cat.name_ar, name_fr: cat.name_fr, name_en: cat.name_en });
                                setIsAddingCategory(true);
                              }}
                              className="p-1.5 bg-zinc-100 text-zinc-600 rounded hover:bg-zinc-200"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 bg-red-50 text-red-650 rounded"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfbf9] text-zinc-400 text-[10px] uppercase border-b">
                      <tr>
                        <th className="py-4 px-6">اسم العميلة</th>
                        <th className="py-4 px-6">التقييم</th>
                        <th className="py-4 px-6">التعليق والملاحظة</th>
                        <th className="py-4 px-6 text-center">حالة الإظهار</th>
                        <th className="py-4 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {reviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-zinc-50/50">
                          <td className="py-4 px-6 font-medium text-zinc-800">{rev.customer_name}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-amber-500">
                              {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-zinc-400">{rev.comment}</td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleToggleReviewStatus(rev.id, rev.is_approved)}
                              className={`text-[10px] py-1 px-3 rounded-full border transition-all ${
                                rev.is_approved 
                                  ? "bg-emerald-100 text-emerald-600 border-emerald-200" 
                                  : "bg-zinc-100 text-zinc-400 border-zinc-200"
                              }`}
                            >
                              {rev.is_approved ? "نشط وظاهر" : "مخفي ومعلق"}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => handleDeleteReview(rev.id)} className="p-1.5 bg-red-50 text-red-650 rounded"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-3 mb-4">أقسام واجهة المتجر</h3>
                  {settingsSections.map((sec) => {
                    const Icon = sec.icon;
                    const isSecActive = activeSettingsSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSettingsSection(sec.id)}
                        className="w-full flex items-center space-x-3 space-x-reverse p-3.5 rounded-xl text-xs transition-all font-light"
                        style={{
                          backgroundColor: isSecActive ? "rgba(0, 0, 0, 0.03)" : "transparent",
                          color: isSecActive ? "var(--secondary-theme)" : "#71717a"
                        }}
                      >
                        <Icon size={16} />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-3 bg-white border rounded-3xl p-6 lg:p-8 shadow">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    {activeSettingsSection === "identity" && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-medium">هوية المتجر والشعار</h4>
                          <p className="text-xs text-zinc-400 mt-1">تعديل الاسم والوصوف الرئيسية للماركة والألوان</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">الاسم بالعربية</label>
                            <input type="text" value={settings.site_name_ar || ""} onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })} className="w-full bg-zinc-50 border p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">الاسم بالفرنسية</label>
                            <input type="text" value={settings.site_name_fr || ""} onChange={(e) => setSettings({ ...settings, site_name_fr: e.target.value })} className="w-full bg-zinc-50 border p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">الاسم بالإنجليزية</label>
                            <input type="text" value={settings.site_name_en || ""} onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })} className="w-full bg-zinc-50 border p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">العنوان الفرعي بالعربية</label>
                            <input type="text" value={settings.site_subtitle_ar || ""} onChange={(e) => setSettings({ ...settings, site_subtitle_ar: e.target.value })} className="w-full bg-zinc-50 border p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">العنوان الفرعي بالفرنسية</label>
                            <input type="text" value={settings.site_subtitle_fr || ""} onChange={(e) => setSettings({ ...settings, site_subtitle_fr: e.target.value })} className="w-full bg-zinc-50 border p-3 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">العنوان الفرعي بالإنجليزية</label>
                            <input type="text" value={settings.site_subtitle_en || ""} onChange={(e) => setSettings({ ...settings, site_subtitle_en: e.target.value })} className="w-full bg-zinc-50 border p-3 rounded-xl text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">الحرف الرمزي للشعار</label>
                            <input type="text" maxLength={1} value={settings.logo_letter} onChange={(e) => setSettings({ ...settings, logo_letter: e.target.value })} className="w-full bg-[#faf6ef] border p-3 rounded-xl text-sm text-center font-bold text-[#1a1410]" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-xs text-zinc-400 block mb-1.5">شعار المتجر</label>
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-350 py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 space-x-reverse">
                                <Upload size={14} />
                                <span>رفع شعار من جهازك</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const url = await handleImageUpload(file, "LOGOS");
                                        setSettings({ ...settings, logo_url: url });
                                        showToast("تم رفع الشعار بنجاح", "success");
                                      } catch (err: any) {
                                        showToast(err.message, "error");
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === "style" && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-medium">الألوان والخطوط الفاخرة وخلفيات الكروت</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل ألوان المتجر والخلفيات حياً في قاعدة سوبابيس</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">اللون الأساسي للموقع (Primary)</label>
                            <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">اللون الثانوي / الذهبي للموقع (Secondary)</label>
                            <input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">لون العناوين الكبرى والشعار</label>
                            <input type="color" value={settings.title_color} onChange={(e) => setSettings({ ...settings, title_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">لون النصوص والفقرات</label>
                            <input type="color" value={settings.text_color} onChange={(e) => setSettings({ ...settings, text_color: e.target.value })} className="w-full h-10 bg-transparent border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">لون خلفية كروت الحقائب والآراء</label>
                            <input type="color" value={settings.card_bg} onChange={(e) => setSettings({ ...settings, card_bg: e.target.value })} className="w-full h-10 bg-transparent/10 border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">لون خلفية الأكورديون المطوي</label>
                            <input type="color" value={settings.accordion_bg} onChange={(e) => setSettings({ ...settings, accordion_bg: e.target.value })} className="w-full h-10 bg-transparent/10 border-0 cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">لون خلفية إطارات صور الحقائب</label>
                            <input type="color" value={settings.image_bg} onChange={(e) => setSettings({ ...settings, image_bg: e.target.value })} className="w-full h-10 bg-transparent/10 border-0 cursor-pointer" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">خط العناوين الكبرى</label>
                            <select value={settings.title_font} onChange={(e) => setSettings({ ...settings, title_font: e.target.value })} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs text-zinc-700">
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Cinzel">Cinzel</option>
                              <option value="Cairo">Cairo (عربي فاخر)</option>
                              <option value="Cormorant Garamond">Cormorant Garamond</option>
                              <option value="Tajawal">Tajawal</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">خط النصوص والوصوف العادية</label>
                            <select value={settings.body_font} onChange={(e) => setSettings({ ...settings, body_font: e.target.value })} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs text-zinc-700">
                              <option value="Montserrat">Montserrat</option>
                              <option value="Lato">Lato</option>
                              <option value="Inter">Inter</option>
                              <option value="Tajawal">Tajawal (عربي ناعم)</option>
                              <option value="Roboto">Roboto</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSettingsSection === "menu" && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-medium">إدارة قائمة التنقل (Menu Links)</h4>
                          <p className="text-xs text-zinc-500 mt-1">تعديل أسماء الروابط الخمسة بالكامل باللغات الثلاث مع تفعيلها وإخفائها</p>
                        </div>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num} className="border-b pb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-500 font-semibold">رابط التنقل {num}</span>
                              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                <input type="checkbox" checked={settings[`menu_p${num}_visible`]} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_visible`]: e.target.checked })} className="rounded text-[#D4AF37] focus:ring-0" />
                                <span>إظهار في القائمة</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="الاسم بالعربية" value={settings[`menu_p${num}_ar`] || ""} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_ar`]: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                              <input type="text" placeholder="الاسم بالفرنسية" value={settings[`menu_p${num}_fr`] || ""} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_fr`]: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                              <input type="text" placeholder="الاسم بالإنجليزية" value={settings[`menu_p${num}_en`] || ""} onChange={(e) => setSettings({ ...settings, [`menu_p${num}_en`]: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSettingsSection === "checkout" && (
                      <div className="space-y-5 animate-fadeIn">
                        <div>
                          <h4 className="text-base font-light">إدارة حقول الشراء (Checkout Manager)</h4>
                          <p className="text-xs text-zinc-500 mt-1">التحكم في حقول استمارة الشحن وتعديل مسمياتها حياً</p>
                        </div>
                        {["name", "phone", "city", "address", "notes"].map((field) => (
                          <div key={field} className="border-b pb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-500 uppercase">حقل: {field === "name" ? "الاسم" : field === "phone" ? "الهاتف" : field === "city" ? "المدينة" : field === "address" ? "العنوان" : "ملاحظات"}</span>
                              <div className="flex space-x-3 space-x-reverse">
                                <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                  <input type="checkbox" checked={settings[`field_${field}_visible`]} onChange={(e) => setSettings({ ...settings, [`field_${field}_visible`]: e.target.checked })} className="rounded text-[#D4AF37]" />
                                  <span>ظاهر فالموقع</span>
                                </label>
                                <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer text-xs text-zinc-500">
                                  <input type="checkbox" checked={settings[`field_${field}_required`]} onChange={(e) => setSettings({ ...settings, [`field_${field}_required`]: e.target.checked })} className="rounded text-[#D4AF37]" />
                                  <span>حقل إجباري</span>
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="الاسم بالعربية" value={settings[`field_${field}_ar`] || ""} onChange={(e) => setSettings({ ...settings, [`field_${field}_ar`]: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                              <input type="text" placeholder="الاسم بالفرنسية" value={settings[`field_${field}_fr`] || ""} onChange={(e) => setSettings({ ...settings, [`field_${field}_fr`]: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                              <input type="text" placeholder="الاسم بالإنجليزية" value={settings[`field_${field}_en`] || ""} onChange={(e) => setSettings({ ...settings, [`field_${field}_en`]: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSettingsSection === "policies" && (
                      <div className="space-y-4 border-t pt-5 animate-fadeIn">
                        <h4 className="text-xs text-amber-500 font-semibold mb-2">إظهار وإخفاء الأقسام الرئيسية في المتجر</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-3 rounded-xl border">
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-600 font-bold">
                            <input type="checkbox" checked={settings.show_announcement_bar} onChange={(e) => setSettings({ ...settings, show_announcement_bar: e.target.checked })} className="rounded text-[#D4AF37]" />
                            <span>شريط الإعلانات</span>
                          </label>
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-600 font-bold">
                            <input type="checkbox" checked={settings.show_about_section} onChange={(e) => setSettings({ ...settings, show_about_section: e.target.checked })} className="rounded text-[#D4AF37]" />
                            <span>قصة ورشتنا (من نحن)</span>
                          </label>
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-600 font-bold">
                            <input type="checkbox" checked={settings.show_pillars_section} onChange={(e) => setSettings({ ...settings, show_pillars_section: e.target.checked })} className="rounded text-[#D4AF37]" />
                            <span>قسم ركائز الفخامة</span>
                          </label>
                          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-600 font-bold">
                            <input type="checkbox" checked={settings.show_testimonials_section} onChange={(e) => setSettings({ ...settings, show_testimonials_section: e.target.checked })} className="rounded text-[#D4AF37]" />
                            <span>قسم التقييمات</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-6 mt-6 flex justify-end">
                      <button type="submit" disabled={actionLoading === "settings"} className="hover:bg-amber-500 text-[#000000] font-bold py-3 px-8 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-all text-xs" style={{ backgroundColor: "var(--secondary-theme)" }}>
                        <Save size={18} />
                        <span>{actionLoading === "settings" ? "جاري الحفظ والمزامنة..." : "مزامنة وحفظ التعديلات حياً"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* نافذة إضافة منتج جديد */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">إضافة حقيبة كانفاس جديدة للتشكيلة</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">اسم الحقيبة بالعربية *</label>
                  <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">الاسم بالإنجليزي (EN) *</label>
                  <input type="text" required value={newProduct.name_en} onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">السعر الموحد (درهم) *</label>
                  <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">المخزون المتوفر</label>
                  <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm font-mono text-[#1a1410]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">الصنف والمجموعة *</label>
                  <select 
                    required
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} 
                    className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]"
                  >
                    <option value="">اختر المجموعة...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">الألوان المتوفرة</label>
                  <input type="text" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-bold">التاغ الترويجي</label>
                  <input type="text" value={newProduct.tag} onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-xs text-[#1a1410]" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_video} onChange={(e) => setNewProduct({ ...newProduct, show_video: e.target.checked })} className="rounded bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار الفيديو</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_gallery} onChange={(e) => setNewProduct({ ...newProduct, show_gallery: e.target.checked })} className="rounded bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار المعرض</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_care_guide} onChange={(e) => setNewProduct({ ...newProduct, show_care_guide: e.target.checked })} className="rounded bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار دليل العناية</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={newProduct.show_dimensions} onChange={(e) => setNewProduct({ ...newProduct, show_dimensions: e.target.checked })} className="rounded bg-black text-[#D4AF37]" />
                  <span>إظهار المقاسات</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#b8935a]/20 pt-4">
                <div>
                  <label className="text-xs text-zinc-450 mb-1.5 block font-bold">الصورة الرئيسية للحقيبة</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-800 text-[#faf6ef] p-2.5 rounded-xl text-xs border flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, "PRODUCT_IMAGES");
                            setNewProduct({ ...newProduct, image_url: url });
                            showToast("تم رفع الصورة بنجاح", "success");
                          } catch (err: any) {
                            showToast(err.message, "error");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-zinc-450 mb-1.5 block font-bold">صور المعرض الإضافية</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-850 text-[#faf6ef] p-2.5 rounded-xl text-xs border flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>رفع صورة إضافية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, "PRODUCT_IMAGES");
                            setNewProduct((prev: any) => ({
                              ...prev,
                              additional_images: [...prev.additional_images, url]
                            }));
                            showToast("تمت إضافة صورة للمعرض", "success");
                          } catch (err: any) {
                            showToast(err.message, "error");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="bg-[#1a1410] text-[#faf6ef] py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === "add-product"} className="text-black py-2.5 px-6 rounded-xl text-xs font-bold" style={{ backgroundColor: "var(--secondary-theme)" }}>حفظ المنتج الجديد</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تعديل تفاصيل منتج كانفاس */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">تعديل مواصفات الحقيبة</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">اسم الحقيبة بالعربية</label>
                  <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-sm text-black border" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الاسم بالإنجليزي (EN)</label>
                  <input type="text" value={editingProduct.name_en} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name_en: e.target.value } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-sm font-mono text-black border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر الموحد (درهم)</label>
                  <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-sm font-mono text-black border" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">المخزون المتوفر</label>
                  <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: Number(e.target.value) } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-sm font-mono text-black border" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الصنف والمجموعة *</label>
                  <select 
                    required
                    value={editingProduct.category} 
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)} 
                    className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-xs text-[#1a1410] border"
                  >
                    <option value="">اختر المجموعة...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الألوان</label>
                  <input type="text" value={editingProduct.color || ""} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, color: e.target.value } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-xs text-[#1a1410] border" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التاغ</label>
                  <input type="text" value={editingProduct.tag || ""} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, tag: e.target.value } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-xs text-[#1a1410] border" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_video} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, show_video: e.target.checked } : null)} className="rounded bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار الفيديو</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_gallery} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, show_gallery: e.target.checked } : null)} className="rounded bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار المعرض</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_care_guide} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, show_care_guide: e.target.checked } : null)} className="rounded bg-black text-[#D4AF37] focus:ring-0" />
                  <span>إظهار دليل العناية</span>
                </label>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-xs text-zinc-400">
                  <input type="checkbox" checked={editingProduct.show_dimensions} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, show_dimensions: e.target.checked } : null)} className="rounded bg-black text-[#D4AF37]" />
                  <span>إظهار المقاسات</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#b8935a]/20 pt-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">تغيير الصورة الرئيسية</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-850 text-[#faf6ef] p-2.5 rounded-xl text-xs border flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>تحميل من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, "PRODUCT_IMAGES");
                            setEditingProduct(prev => prev ? { ...prev, image_url: url } : null);
                            showToast("تم تغيير الصورة الرئيسية", "success");
                          } catch (err: any) {
                            showToast(err.message, "error");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رفع صور إضافية للمعرض</label>
                  <label className="cursor-pointer w-full bg-[#1a1410] hover:bg-zinc-850 text-[#faf6ef] p-2.5 rounded-xl text-xs border flex items-center justify-center space-x-2 space-x-reverse">
                    <Upload size={14} />
                    <span>رفع صورة إضافية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file, "PRODUCT_IMAGES");
                            setEditingProduct(prev => prev ? ({
                              ...prev,
                              additional_images: [...(prev.additional_images || []), url]
                            }) : null);
                            showToast("تمت إضافة صورة للمعرض", "success");
                          } catch (err: any) {
                            showToast(err.message, "error");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-bold">رابط الفيديو الترويجي</label>
                <input type="text" value={editingProduct.video_url || ""} onChange={(e) => setEditingProduct(prev => prev ? { ...prev, video_url: e.target.value } : null)} className="w-full bg-[#faf6ef] p-2.5 rounded-xl text-xs font-mono text-black border" />
              </div>
              <div className="border-t pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setEditingProduct(null)} className="bg-zinc-900 text-zinc-350 py-2.5 px-6 rounded-xl text-xs">إلغاء</button>
                <button type="submit" disabled={actionLoading === `save-prod-${editingProduct.id}`} className="text-black py-2.5 px-6 rounded-xl text-xs font-bold" style={{ backgroundColor: "var(--secondary-theme)" }}>حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* إضافة / تعديل تصنيف ومجموعة سريعة */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 bg-[#0F0F0F] border-b border-zinc-900">
              <h3 className="text-base font-light text-zinc-100">{editingCategory ? "تعديل اسم المجموعة" : "إضافة مجموعة جديدة"}</h3>
              <button onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-right">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-bold">الاسم بالعربية *</label>
                <input type="text" required value={newCategory.name_ar} onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm text-black" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-bold">الاسم بالفرنسية *</label>
                <input type="text" required value={newCategory.name_fr} onChange={(e) => setNewCategory({ ...newCategory, name_fr: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm text-black" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-bold">الاسم بالإنجليزية *</label>
                <input type="text" required value={newCategory.name_en} onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value })} className="w-full bg-[#faf6ef] border p-2.5 rounded-xl text-sm text-black" />
              </div>
              <div className="border-t pt-4 flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }} className="bg-[#1a1410] text-[#faf6ef] py-2.5 px-5 rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="text-black py-2.5 px-5 rounded-xl text-xs font-bold" style={{ backgroundColor: "var(--secondary-theme)" }}>حفظ المجموعة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* تفاصيل الفاتورة والطلبية المنبثقة للمعالجة والطباعة */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:absolute print:inset-0 print:bg-white print:p-0">
          <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl print:border-0 print:bg-white print:text-black print:shadow-none animate-scaleIn">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-[#0F0F0F] print:hidden">
              <div>
                <span className="text-xs text-amber-500 font-mono font-bold">{selectedOrder.order_number}</span>
                <h3 className="text-base font-light text-zinc-200 mt-0.5">تفاصيل ومعالجة الطلب</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-900 text-zinc-500 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6 print:p-8 text-right">
              <div className="hidden print:block text-center border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold tracking-[0.2em] text-black">
                  {lang === "ar" ? settings.site_name_ar : lang === "fr" ? settings.site_name_fr : settings.site_name_en}
                </h1>
                <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                  {lang === "ar" ? settings.site_subtitle_ar : lang === "fr" ? settings.site_subtitle_fr : settings.site_subtitle_en}
                </p>
                <div className="text-right mt-6 text-xs text-gray-600">
                  <p>رقم الفاتورة: #{selectedOrder.order_number}</p>
                  <p>التاريخ: {new Date(selectedOrder.created_at).toLocaleDateString("ar-MA")}</p>
                </div>
              </div>

              <div className="bg-[#0D0D0D] border border-zinc-900 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 print:bg-white print:border-gray-200 print:text-black">
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">اسم العميل</h4>
                  <p className="text-sm font-semibold print:text-black">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">المدينة وعنوان الشحن</h4>
                  <p className="text-sm print:text-black">{selectedOrder.customer_city} • {selectedOrder.customer_address}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">الهاتف للتواصل</h4>
                  <p className="text-sm font-mono print:text-black">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase mb-1">طريقة الدفع</h4>
                  <p className="text-sm print:text-black">الدفع عند الاستلام (COD)</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-3 print:text-black">المنتجات المشمولة:</h4>
                <div className="space-y-2">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-[#0F0F0F] border border-zinc-900 rounded-xl print:bg-white print:border-gray-200">
                      <div>
                        <span className="text-sm font-light text-zinc-200 print:text-black">{item.productName || item.product_name}</span>
                        <span className="text-xs text-zinc-500 block mt-0.5">الكمية: {item.qty || item.quantity} قطعة</span>
                      </div>
                      <span className="text-sm text-[#D4AF37] font-semibold print:text-black">{(Number(item.price) * Number(item.qty || item.quantity)).toLocaleString()} درهم</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex justify-between items-center print:border-gray-200">
                <span className="text-sm text-zinc-400 print:text-black">المجموع الإجمالي للطلبية:</span>
                <span className="text-xl font-light text-[#D4AF37] print:text-black print:font-bold">{Number(selectedOrder.total).toLocaleString()} درهم</span>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-zinc-900/50 rounded-xl text-xs text-zinc-400 print:hidden">
                  <span className="font-semibold block mb-1">ملاحظات الزبون الاضافية:</span>
                  {selectedOrder.notes}
                </div>
              )}

              <div className="hidden print:block text-center text-[10px] text-gray-400 border-t pt-8 mt-8">
                شكرًا لكم على تسوقكم من SAFOS • حقائب كانفاس مصنوعة يدويًا بفخر مغربي 🇲🇦
              </div>
            </div>

            <div className="p-6 bg-[#0F0F0F] border-t border-zinc-900 flex flex-wrap gap-3 justify-between items-center print:hidden">
              <div className="flex gap-2">
                <button onClick={() => handleSendWhatsAppMessage(selectedOrder, "confirm")} className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Send size={14} />
                  <span>تأكيد وشحن عبر واتساب</span>
                </button>
                <button onClick={() => window.print()} className="bg-zinc-900 hover:bg-[#1a1410] text-[#faf6ef] py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 space-x-reverse border border-zinc-800">
                  <Printer size={14} />
                  <span>تحميل / طباعة الفاتورة</span>
                </button>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 py-2 px-5 rounded-xl text-xs">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
