/**
 * src/pages/LoginPage.js
 *
 * Admin login page — main domain only (growcad.in).
 *
 * WHAT CHANGED vs the original:
 *   1. Error extraction uses the normalised err.message set by the Axios
 *      interceptor — no more inspecting err.response?.data?.detail manually.
 *   2. Demo credentials panel is dev-only (hidden in production).
 *   3. Everything else (styles, illustration, layout) is unchanged.
 */

import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '@/contexts/AuthContext';
import {
  Eye, EyeOff, Sparkles, BookOpen, BarChart3,
  CreditCard, MessageCircle, ArrowRight,
} from 'lucide-react';
import { Button }            from '@/components/ui/button';
import { Input }             from '@/components/ui/input';
import { Label }             from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from "react-router-dom";

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: BookOpen,   text: 'Student & Teacher Management'      },
  { icon: BarChart3,  text: 'Attendance & Performance Tracking' },
  { icon: CreditCard, text: 'Automated Fee Collection'          },
  { icon: Sparkles,   text: 'Insightful Analytics & Reports'    },
];

// Demo credentials are only shown in development builds
const IS_DEV = process.env.NODE_ENV === 'development';
const DEMO_CREDS = [
  { role: 'Admin',   email: 'admin@growcad.in',   pw: 'admin123'   },
  { role: 'Teacher', email: 'teacher@growcad.in', pw: 'teacher123' },
  { role: 'Student', email: 'student@growcad.in', pw: 'student123' },
];

// ─── SVG dashboard illustration (unchanged) ───────────────────────────────────

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id="panelG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.13)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
        <linearGradient id="bV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6C3CF4" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="bB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" stopOpacity=".7" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="480" height="300" rx="18" fill="url(#panelG)"
        stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
      <rect width="66" height="300" rx="18" fill="rgba(255,255,255,0.06)" />
      <rect x="13" y="18" width="40" height="40" rx="10" fill="rgba(108,60,244,0.75)" />
      <text x="33" y="44" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">G</text>
      {[76, 114, 152, 190, 228].map((y, i) => (
        <rect key={i} x="17" y={y} width="32" height="6" rx="3"
          fill={i === 0 ? 'rgba(167,139,250,0.95)' : 'rgba(255,255,255,0.16)'} />
      ))}

      {[
        { x: 82,  val: '2,847', label: 'Students',  color: '#a78bfa' },
        { x: 200, val: '94.2%', label: 'Attendance', color: '#34d399' },
        { x: 318, val: '₹1.2L', label: 'Revenue',   color: '#60a5fa' },
      ].map(({ x, val, label, color }) => (
        <g key={label}>
          <rect x={x} y="13" width="106" height="56" rx="10"
            fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
          <text x={x+12} y="38" fill={color} fontSize="15" fontWeight="bold" filter="url(#glow)">{val}</text>
          <text x={x+12} y="56" fill="rgba(255,255,255,0.36)" fontSize="9">{label}</text>
        </g>
      ))}

      <rect x="82" y="82" width="230" height="144" rx="10"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <text x="96" y="100" fill="rgba(255,255,255,0.60)" fontSize="9" fontWeight="600">Revenue Overview</text>
      {[
        { x: 102, h: 62, g: 'bV' }, { x: 136, h: 82, g: 'bB' }, { x: 170, h: 50, g: 'bG' },
        { x: 204, h: 94, g: 'bV' }, { x: 238, h: 74, g: 'bB' }, { x: 272, h:100, g: 'bV' },
      ].map(({ x, h, g }, i) => (
        <rect key={i} x={x} y={210 - h} width="24" height={h} rx="4" fill={`url(#${g})`} opacity=".9" />
      ))}
      {['J','F','M','A','M','J'].map((m, i) => (
        <text key={m} x={114 + i*34} y="224" textAnchor="middle"
          fill="rgba(255,255,255,0.22)" fontSize="8">{m}</text>
      ))}

      <rect x="324" y="82" width="138" height="144" rx="10"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <text x="337" y="100" fill="rgba(255,255,255,0.60)" fontSize="9" fontWeight="600">Attendance</text>
      <circle cx="393" cy="168" r="38" fill="none" stroke="rgba(108,60,244,0.18)" strokeWidth="14" />
      <circle cx="393" cy="168" r="38" fill="none" stroke="url(#bV)" strokeWidth="14"
        strokeDasharray="194 44" strokeLinecap="round" strokeDashoffset="48" />
      <text x="393" y="172" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">94%</text>
      <text x="393" y="184" textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize="7">present</text>

      <rect x="82" y="238" width="380" height="44" rx="10"
        fill="rgba(108,60,244,0.13)" stroke="rgba(108,60,244,0.28)" strokeWidth="0.8" />
      <circle cx="102" cy="260" r="10" fill="rgba(108,60,244,0.45)" />
      <text x="102" y="264" textAnchor="middle" fill="white" fontSize="8">!</text>
      <rect x="122" y="252" width="110" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
      <rect x="122" y="264" width="70"  height="4" rx="2" fill="rgba(255,255,255,0.14)" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // err.message is normalised by the Axios interceptor in api/index.js
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono&display=swap');

        @keyframes floatY {
          0%,100% { transform: translateY(0px) rotate(-0.8deg); }
          50%      { transform: translateY(-16px) rotate(0.8deg); }
        }
        @keyframes orbMove1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(35px,-25px) scale(1.07); }
        }
        @keyframes orbMove2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-28px,35px) scale(1.05); }
        }
        @keyframes orbMove3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(18px,18px); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sparkle {
          0%,100% { opacity:0.5; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.4); }
        }

        .gc-page    { font-family:'DM Sans',sans-serif; min-height:100vh; display:flex;
                      background:linear-gradient(135deg,#0f0a1e 0%,#1a0f3e 40%,#0a1628 100%); }
        .gc-left    { flex:1; display:flex; flex-direction:column; justify-content:center;
                      padding:48px 60px; position:relative; overflow:hidden; }
        .gc-right   { width:420px; display:flex; flex-direction:column; justify-content:center;
                      padding:40px 44px; border-left:1px solid rgba(255,255,255,.06); }
        .glass-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
                      border-radius:20px; backdrop-filter:blur(12px); }
        .glass-input{ background:rgba(255,255,255,.06) !important; border:1px solid rgba(255,255,255,.12) !important;
                      color:#fff !important; border-radius:10px !important; }
        .glass-input::placeholder{ color:rgba(255,255,255,.25) !important; }
        .glass-input:focus{ border-color:rgba(108,60,244,.55) !important;
                            box-shadow:0 0 0 3px rgba(108,60,244,.15) !important; outline:none !important; }
        .btn-glow:not(:disabled):hover{
          box-shadow:0 6px 28px rgba(108,60,244,.55),0 0 50px rgba(108,60,244,.22) !important; }
        .gc-mono { font-family:'DM Mono',monospace; font-size:11px; }

        .orb1 { animation: orbMove1 9s ease-in-out infinite; }
        .orb2 { animation: orbMove2 12s ease-in-out infinite; }
        .orb3 { animation: orbMove3 7s ease-in-out infinite; }
        .float-card { animation: floatY 6s ease-in-out infinite; }
        .fade-in    { opacity:0; animation: fadeSlideUp .6s ease forwards; }
        .fade-in-1  { animation-delay:.10s; }
        .fade-in-2  { animation-delay:.22s; }
        .fade-in-3  { animation-delay:.34s; }
        .fade-in-4  { animation-delay:.46s; }

        @media(max-width:860px){ .gc-left{ display:none; } .gc-right{ width:100%; border:none; padding:32px 24px; } }
      `}</style>

      <div className="gc-page">

        {/* ── Left panel ────────────────────────────────────────────────── */}
        <div className="gc-left">
          {/* Ambient orbs */}
          <div className="orb1 absolute w-96 h-96 rounded-full pointer-events-none"
            style={{ top:'-80px', left:'-60px', background:'radial-gradient(circle,rgba(108,60,244,.28) 0%,transparent 70%)' }} />
          <div className="orb2 absolute w-80 h-80 rounded-full pointer-events-none"
            style={{ bottom:'40px', right:'60px', background:'radial-gradient(circle,rgba(59,130,246,.22) 0%,transparent 70%)' }} />
          <div className="orb3 absolute w-60 h-60 rounded-full pointer-events-none"
            style={{ top:'40%', left:'55%', background:'radial-gradient(circle,rgba(52,211,153,.14) 0%,transparent 70%)' }} />

          <div className="relative z-10 max-w-xl">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 fade-in fade-in-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)' }}>G</div>
              <span className="font-bold text-xl text-white tracking-tight">Growcad</span>
            </div>

            <h1 className="fade-in fade-in-2 text-5xl font-extrabold text-white leading-tight mb-4"
              style={{ letterSpacing:'-.02em' }}>
              Manage your<br />
              <span style={{ background:'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                institute smarter
              </span>
            </h1>
            <p className="fade-in fade-in-2 text-base mb-8" style={{ color:'rgba(255,255,255,.45)', lineHeight:1.7 }}>
              The all-in-one LMS built for coaching institutes across India.
            </p>

            <ul className="fade-in fade-in-3 space-y-3 mb-10">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(108,60,244,.18)' }}>
                    <Icon size={14} color="#a78bfa" />
                  </div>
                  <span className="text-sm font-medium" style={{ color:'rgba(255,255,255,.60)' }}>{text}</span>
                </li>
              ))}
            </ul>

            {/* Floating illustration */}
            <div className="float-card fade-in fade-in-4 glass-card p-3" style={{ maxWidth:'460px' }}>
              <DashboardIllustration />
            </div>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────── */}
        <div className="gc-right">
          <div style={{ maxWidth:'340px', margin:'0 auto', width:'100%' }}>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)' }}>G</div>
                <span className="font-bold text-white text-base">Growcad</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-3 mb-1">Welcome back</h2>
              <p className="text-sm" style={{ color:'rgba(255,255,255,.38)' }}>
                Sign in to your admin account
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.25)', color:'#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,.09)' }} />
              <span className="text-[11px] font-medium" style={{ color:'rgba(255,255,255,.28)' }}>sign in with email</span>
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,.09)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email"
                  className="text-[10.5px] font-bold uppercase tracking-[0.10em]"
                  style={{ color:'rgba(255,255,255,.40)' }}>
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
                  className="h-10 glass-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password"
                  className="text-[10.5px] font-bold uppercase tracking-[0.10em]"
                  style={{ color:'rgba(255,255,255,.40)' }}>
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
                    className="h-10 pr-10 glass-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color:'rgba(255,255,255,.28)' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.65)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.28)'}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor:'#7c4ff5' }}
                  />
                  <span className="text-[12px] font-medium" style={{ color:'rgba(255,255,255,.38)' }}>
                    Keep me signed in
                  </span>
                </label>
                <a href="#" onClick={e => e.preventDefault()}
                  className="text-[11px] font-medium transition-colors duration-150"
                  style={{ color:'rgba(167,139,250,.65)' }}
                  onMouseEnter={e => e.currentTarget.style.color='#a78bfa'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(167,139,250,.65)'}
                >
                  Forgot password?
                </a>
              </div>

              <button
                data-testid="login-submit-button"
                type="submit"
                disabled={loading}
                onMouseMove={e  => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                className="btn-glow w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-bold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:  'linear-gradient(135deg, #6C3CF4, #8b5cf6, #a855f7)',
                  boxShadow:   loading ? 'none' : '0 4px 20px rgba(108,60,244,.45), 0 0 40px rgba(108,60,244,.18)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full animate-spin"
                      style={{ border:'2px solid rgba(255,255,255,.25)', borderTopColor:'#fff' }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1 mt-4 text-xs">
              <span style={{ color:'rgba(255,255,255,.35)' }}>Don't have an account?</span>
              

<Link
  to="/signup"
  className="font-semibold transition-all duration-150"
  style={{ color:'#a78bfa' }}
  onMouseEnter={e => e.currentTarget.style.color='#c4b5fd'}
  onMouseLeave={e => e.currentTarget.style.color='#a78bfa'}
>
  Sign up
</Link>
            </div>

            <a
              href="https://wa.me/917488616782"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 py-2.5 w-full rounded-[10px] text-xs font-medium transition-all duration-200"
              style={{ color:'rgba(255,255,255,.30)', border:'1px solid rgba(255,255,255,.07)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(37,211,102,.35)';
                e.currentTarget.style.color       = 'rgba(74,222,128,.80)';
                e.currentTarget.style.background  = 'rgba(37,211,102,.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)';
                e.currentTarget.style.color       = 'rgba(255,255,255,.30)';
                e.currentTarget.style.background  = 'transparent';
              }}
            >
              <MessageCircle size={13} />
              Need help? WhatsApp us · 7488616782
            </a>

            {/* Demo credentials — development only */}
            {IS_DEV && (
              <div className="mt-4 p-4 rounded-[16px]"
                style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)' }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2.5"
                  style={{ color:'rgba(255,255,255,.22)' }}>Demo Credentials</p>
                <div className="space-y-1.5">
                  {DEMO_CREDS.map(({ role, email: e, pw }) => (
                    <div key={role} className="flex items-center gap-2 text-xs"
                      style={{ color:'rgba(255,255,255,.38)' }}>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background:'rgba(108,60,244,.20)', color:'#a78bfa' }}>{role}</span>
                      <span>{e}</span>
                      <span style={{ color:'rgba(255,255,255,.18)' }}>/</span>
                      <span className="gc-mono">{pw}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
