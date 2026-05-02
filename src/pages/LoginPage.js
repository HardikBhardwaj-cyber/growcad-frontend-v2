import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Sparkles, BookOpen, BarChart3, CreditCard } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  { icon: BookOpen,    text: 'Student & Teacher Management' },
  { icon: BarChart3,   text: 'Attendance & Performance Tracking' },
  { icon: CreditCard,  text: 'Automated Fee Collection' },
  { icon: Sparkles,    text: 'Insightful Analytics & Reports' },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

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
    <div
      className="min-h-screen flex animate-fade-in"
      style={{ fontFamily: "'Inter', sans-serif" }}
      data-testid="login-page"
    >
      {/* ── Left hero panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[56%] relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(145deg, #0d0b18 0%, #130f24 50%, #0c0c1a 100%)' }}
      >
        {/* Glow orbs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(108,60,244,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute top-[38%] right-[12%] w-[220px] h-[220px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-[460px] px-12 py-16">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-14">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background:  'linear-gradient(135deg, #6C3CF4, #a855f7)',
                boxShadow:   '0 8px 24px rgba(108,60,244,0.45)',
              }}
            >
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-[22px] font-bold text-white tracking-tight">Growcad</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.6rem] font-extrabold leading-[1.18] mb-4 text-white">
            The complete ERP<br />
            <span style={{ background: 'linear-gradient(90deg, #a78bfa, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              for coaching institutes
            </span>
          </h1>
          <p className="text-[15px] text-white/45 leading-relaxed mb-12">
            Manage academics, operations, and finances<br />from one intelligent platform.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(108,60,244,0.15)', border: '1px solid rgba(108,60,244,0.25)' }}
                >
                  <Icon size={15} className="text-violet-400" />
                </div>
                <span className="text-[13.5px] text-white/60">{text}</span>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div
            className="flex items-center gap-6 mt-14 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[['2k+', 'Students'], ['150+', 'Institutes'], ['99.9%', 'Uptime']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-[11px] text-white/35">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ background: '#f6f5fb' }}
      >
        <div className="w-full max-w-[390px]">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C3CF4, #a855f7)' }}
            >
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-lg font-bold text-[#1a1625]">Growcad</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[1.75rem] font-bold text-[#1a1625] leading-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-sm text-gray-400">
              Sign in to manage your institute
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              data-testid="login-error"
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{
                background:  '#fef2f2',
                border:      '1px solid #fecaca',
                color:       '#dc2626',
              }}
            >
              <div className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
              {error}
            </div>
          )}

          {/* Form card */}
          <Card
            className="mb-4 transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
            style={{
              background:   '#ffffff',
              border:       '1px solid rgba(0,0,0,0.07)',
              boxShadow:    '0 1px 4px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              borderRadius: '18px',
            }}
          >
            <CardContent className="p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    data-testid="login-email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@growcad.in"
                    required
                    className="h-10 border-gray-200 bg-gray-50/60 text-[#1a1625] placeholder:text-gray-400"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      data-testid="login-password-input"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-10 pr-10 border-gray-200 bg-gray-50/60 text-[#1a1625] placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  data-testid="login-submit-button"
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full mt-1 text-sm font-semibold active:scale-[0.98]"
                  style={{
                    background:  'linear-gradient(135deg, #6C3CF4, #8b5cf6)',
                    boxShadow:   '0 4px 14px rgba(108,60,244,0.32)',
                    borderRadius: '12px',
                    height:      '42px',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                      Signing in…
                    </span>
                  ) : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo credentials */}
          <Card
            style={{
              background:   '#ffffff',
              border:       '1px solid rgba(0,0,0,0.06)',
              boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
              borderRadius: '14px',
            }}
          >
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5">
                Demo Credentials
              </p>
              <div className="space-y-2">
                {[
                  { role: 'Admin',   email: 'admin@growcad.in',   pw: 'admin123'   },
                  { role: 'Teacher', email: 'teacher@growcad.in', pw: 'teacher123' },
                  { role: 'Student', email: 'student@growcad.in', pw: 'student123' },
                ].map(({ role, email: e, pw }) => (
                  <div key={role} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: '#f3f0ff', color: '#6C3CF4' }}
                    >
                      {role}
                    </span>
                    <span>{e}</span>
                    <span className="text-gray-300">/</span>
                    <span className="font-mono">{pw}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
