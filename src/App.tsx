import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import AdminDashboard from './pages/AdminDashboard';
import ProductPage from './pages/ProductPage';
import HomePage from './pages/HomePage'; // استيراد الصفحة الرئيسية الفاخرة للزبناء

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* 🟢 الصفحة الرئيسية الفاخرة لمتجر SAFOS للحقائب المطرزة */}
          <Route path="/" element={<HomePage />} />
          
          {/* مسار لوحة التحكم الإدارية الشاملة */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* مسار صفحة المنتج المصممة بأسلوب Shopify للزبناء */}
          <Route path="/product/:id" element={<ProductPage />} />
          
          {/* التوجيه التلقائي لأي رابط غير معروف إلى الصفحة الرئيسية */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}
