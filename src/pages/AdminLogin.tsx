import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/useAuth';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@safos.ma');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] to-[#3d2a1c] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-[#b8935a] flex items-center justify-center bg-[#faf6ef]">
            <span className="font-display text-4xl text-[#b8935a] italic font-bold">S</span>
          </div>
          <h1 className="font-display text-3xl tracking-[0.2em] text-[#faf6ef] mb-2">SAFOS</h1>
          <p className="text-[#d4b483] text-sm tracking-[0.2em] uppercase">Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#faf6ef] rounded-2xl shadow-2xl p-8">
          <h2 className="font-display text-2xl text-[#1a1410] mb-6 text-center">تسجيل الدخول</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-wider text-[#5c4330] mb-2 font-medium">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 pr-11 border border-[#b8935a]/30 rounded-lg focus:outline-none focus:border-[#b8935a] bg-transparent text-sm"
                  placeholder="admin@safos.ma"
                  required
                />
                <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b8935a]" />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-[#5c4330] mb-2 font-medium">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-[#b8935a]/30 rounded-lg focus:outline-none focus:border-[#b8935a] bg-transparent text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1410] text-[#faf6ef] py-3.5 text-xs tracking-[0.25em] uppercase rounded-lg hover:bg-[#b8935a] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#b8935a]/20 text-center">
            <p className="text-xs text-[#5c4330]">
              كلمة المرور الافتراضية: <code className="bg-[#e8dcc4] px-2 py-0.5 rounded">safos1007</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-[#d4b483]/60 text-xs">
          <p>© 2026 SAFOS. جميع الحقوق محفوظة.</p>
          <p className="mt-1">صُنع بحب في المغرب 🇲</p>
        </div>
      </div>
    </div>
  );
}
