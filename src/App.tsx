import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Website from './pages/Website';
import { StoreProvider } from './context/StoreContext';
import { LanguageProvider } from './context/LanguageContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#b8935a]/30 border-t-[#b8935a] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5c4330]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
      <StoreProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Website />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StoreProvider>
    </LanguageProvider>
  );
}
