import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import AdminDashboard from './pages/AdminDashboard';
import ProductPage from './pages/ProductPage';
import HomePage from './pages/HomePage'; // استيراد الصفحة الرئيسية الفاخرة للزبناء
import AdminLogin from './pages/AdminLogin'; // استيراد صفحة الدخول لحل مشكلة توجيه الهاتف

// 🟢 مكون أزرار التواصل الاجتماعي العائمة المحدثة (واتساب الرسمي + إنستغرام)
function FloatingSocialIcons() {
  const whatsappNumber = "212647960846"; // 📞 يمكنكِ تعديل رقم الواتساب الخاص بكِ هنا مستقبلاً
  const instagramUsername = "safos__1"; // 📸 يمكنكِ تعديل اسم حساب الإنستغرام هنا مستقبلاً

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 items-center pointer-events-auto">
      
      {/* 1. زر واتساب بالشعار الدائري الرسمي الأصلي الأخضر */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="w-12 h-12 bg-[#25D366] text-white flex items-center justify-center rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[#25D366]/30"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512" 
          className="w-6 h-6 fill-current"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      {/* 2. زر إنستغرام الفاخر بـخلفية متدرجة أنيقة */}
      <a
        href={`https://instagram.com/${instagramUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow us on Instagram"
        className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-pink-500/20"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512" 
          className="w-5 h-5 fill-current"
        >
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8c14.9 0 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
        </svg>
      </a>

    </div>
  );
}

// 🔵 مكون فرعي مخصص لإدارة التحكم في المسارات والأزرار العائمة ذكياً
function AppContent() {
  const location = useLocation();
  
  // التحقق مما إذا كانت الصفحة الحالية تابعة للإدارة لكي نخفي الأزرار فيها تلقائياً
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        {/* الصفحة الرئيسية الفاخرة لمتجر SAFOS للحقائب المطرزة */}
        <Route path="/" element={<HomePage />} />
        
        {/* مسار لوحة التحكم الإدارية الشاملة */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* مسار صفحة تسجيل دخول المسؤول لحل مشكلة عدم فتح Dashboard فالهاتف */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* مسار صفحة المنتج المصممة بأسلوب Shopify للزبناء */}
        <Route path="/product/:id" element={<ProductPage />} />
        
        {/* التوجيه التلقائي لأي رابط غير معروف إلى الصفحة الرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* الأزرار تظهر فقط في صفحات الزبائن وتختفي في صفحات الإدارة تماماً */}
      {!isAdminPage && <FloatingSocialIcons />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <AppContent />
      </Router>
    </StoreProvider>
  );
}
