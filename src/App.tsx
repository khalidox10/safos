import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import AdminDashboard from './pages/AdminDashboard';
import ProductPage from './pages/ProductPage';

// المكون الرئيسي للتوجيه والربط
export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* مسار لوحة التحكم الإدارية الشاملة */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* مسار صفحة المنتج المصممة بأسلوب Shopify للزبناء */}
          <Route path="/product/:id" element={<ProductPage />} />
          
          {/* التوجيه الافتراضي لأي رابط خاطئ */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}
