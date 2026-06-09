import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";
import { useStore } from "../context/StoreContext";
import { ArrowLeft, Lock, Mail, Loader2 } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("admin@safos.ma");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { locale, addToast } = useStore();
  const navigate = useNavigate();

  const isAr = locale === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg(isAr ? "الرجاء إدخال كلمة المرور" : "Please enter your password");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { success, error } = await login(password, email);
      if (success) {
        addToast(isAr ? "تم تسجيل الدخول بنجاح" : "Logged in successfully", "success");
        navigate("/admin");
      } else {
        setErrorMsg(error || (isAr ? "خطأ في تسجيل الدخول" : "Login error"));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ef] text-[#1a1410] font-sans flex flex-col justify-between selection:bg-[#b8935a] selection:text-white">
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#1a1410] hover:text-[#b8935a] transition-all"
        >
          <ArrowLeft size={16} />
          {isAr ? "العودة للمتجر" : "Back to shop"}
        </button>
        <span className="font-serif text-2xl tracking-widest text-[#1a1410] font-medium">
          SAFOS
        </span>
      </header>

      {/* BODY */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#e8dcc4] rounded-sm shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-mono tracking-widest text-[#b8935a]">
              {isAr ? "لوحة الإدارة الخاصة" : "Private Admin Board"}
            </span>
            <h1 className="font-serif text-3xl font-medium mt-2 tracking-tight">
              {isAr ? "تسجيل الدخول" : "Admin Login"}
            </h1>
            <p className="text-xs text-[#5c4330] mt-2 max-w-xs mx-auto">
              {isAr
                ? "أدخل بيانات الاعتماد الخاصة بورشة و متجر SAFOS لتعديل المنتجات وإدارتها"
                : "Enter your credentials to manage Safos luxury collections."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 border-r-4 border-red-500 text-red-800 text-xs rounded-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#5c4330] mb-2">
                {isAr ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3 flex items-center text-[#c9a574]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@safos.ma"
                  className="w-full bg-[#faf6ef] border border-[#e8dcc4] focus:border-[#b8935a] outline-none text-sm px-10 py-3 rounded-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#5c4330] mb-2">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3 flex items-center text-[#c9a574]">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#faf6ef] border border-[#e8dcc4] focus:border-[#b8935a] outline-none text-sm px-10 py-3 rounded-sm transition-all text-left dir-ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1a1410] hover:bg-[#b8935a] active:bg-[#1a1410] text-white text-xs font-mono uppercase tracking-widest py-4 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 select-none shadow-lg cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isAr ? "جاري التحقق..." : "Validating..."}
                </>
              ) : (
                isAr ? "تسجيل الدخول" : "Sign In"
              )}
            </button>
          </form>

          {/* HINT FOR LOCAL HOST AND DEV MODE */}
          <div className="mt-8 pt-6 border-t border-[#faf6ef] text-[10px] text-center text-[#c9a574] font-mono leading-relaxed">
            💡 {isAr ? "كلمة المرور الافتراضية" : "Default Password"}: <span className="font-bold text-[#1a1410] bg-[#faf6ef] px-1.5 py-0.5 rounded-sm">safos1007</span>
            <br />
            {isAr
              ? "مزامنة سحابية نشطة عبر بروتوكول Supabase"
              : "Active hybrid cloud sync protocols enabled via Supabase."}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-[10px] font-mono tracking-wider text-[#5c4330]">
        © 2026 SAFOS ATELIER. All Rights Reserved. Morocco.
      </footer>
    </div>
  );
};
