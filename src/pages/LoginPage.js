import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      <div className="hidden lg:flex lg:w-[55%] bg-[#13111c] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C3CF4]/30 via-transparent to-[#a855f7]/20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#6C3CF4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-lg px-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3CF4] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6C3CF4]/30">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Meritinfi</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            The complete ERP<br />for coaching institutes
          </h1>
          <p className="text-base text-white/50 leading-relaxed mb-10">
            Manage academics, operations, and finances from one intelligent platform.
          </p>
          <div className="space-y-4">
            {[
              'Student & Teacher Management',
              'Attendance & Performance Tracking',
              'Automated Fee Collection',
              'Insightful Analytics & Reports',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#6C3CF4]/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#6C3CF4]" />
                </div>
                <span className="text-sm text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#f6f5fb]">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6C3CF4] to-[#a855f7] flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-[#1a1625]">Meritinfi</span>
          </div>

          <h2 className="text-2xl font-bold text-[#1a1625] mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-8">Sign in to manage your institute</p>

          {error && (
            <div data-testid="login-error" className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg mb-5 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/30 focus:border-[#6C3CF4] outline-none transition-shadow"
                placeholder="admin@meritinfi.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input
                  data-testid="login-password-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/30 focus:border-[#6C3CF4] outline-none transition-shadow pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C3CF4] hover:bg-[#5b2ed4] text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#6C3CF4]/25 hover:shadow-[#6C3CF4]/40 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-3.5 rounded-lg bg-white border border-gray-200/80">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              <p><span className="font-medium text-gray-700">Admin:</span> admin@meritinfi.com / admin123</p>
              <p><span className="font-medium text-gray-700">Teacher:</span> teacher@meritinfi.com / teacher123</p>
              <p><span className="font-medium text-gray-700">Student:</span> student@meritinfi.com / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
