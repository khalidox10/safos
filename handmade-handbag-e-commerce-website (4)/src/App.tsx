import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
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
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
}

// Main Website Component
function Website() {
  // Import all the existing website logic here
  // For now, we'll show a simple message
  return (
    <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-[#b8935a] flex items-center justify-center">
          <span className="font-display text-5xl text-[#b8935a] italic font-bold">S</span>
        </div>
        <h1 className="font-display text-4xl text-[#1a1410] mb-4">SAFOS</h1>
        <p className="text-[#5c4330] mb-6">موقع الويب الرئيسي قيد التطوير</p>
        <a
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1410] text-[#faf6ef] text-sm rounded-lg hover:bg-[#b8935a] transition"
        >
          الذهاب للوحة التحكم
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Website />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
