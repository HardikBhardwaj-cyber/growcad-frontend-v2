import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Eye, EyeOff, Sparkles, BookOpen, BarChart3,
  CreditCard, MessageCircle, ArrowRight,
} from 'lucide-react';
import { Button }            from '@/components/ui/button';
import { Input }             from '@/components/ui/input';
import { Label }             from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: BookOpen,   text: 'Student & Teacher Management'   },
  { icon: BarChart3,  text: 'Attendance & Performance Tracking' },
  { icon: CreditCard, text: 'Automated Fee Collection'       },
  { icon: Sparkles,   text: 'Insightful Analytics & Reports' },
];

const DEMO_CREDS = [
  { role: 'Admin',   email: 'admin@growcad.in',   pw: 'admin123'   },
  { role: 'Teacher', email: 'teacher@growcad.in', pw: 'teacher123' },
  { role: 'Student', email: 'student@growcad.in', pw: 'student123' },
];

// ─── SVG dashboard illustration ───────────────────────────────────────────────

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id="panelG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.13)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
        <linearGradient id="bV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#6C3CF4" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="bB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" stopOpacity=".7" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Card background */}
      <rect width="480" height="300" rx="18" fill="url(#panelG)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />

      {/* Sidebar */}
      <rect width="66" height="300" rx="18" fill="rgba(255,255,255,0.06)" />
      <rect x="13" y="18" width="40" height="40" rx="10" fill="rgba(108,60,244,0.75)" />
      <text x="33" y="44" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">G</text>
      {[76, 114, 152, 190, 228].map((y, i) => (
        <rect key={i} x="17" y={y} width="32" height="6" rx="3" fill={i === 0 ? 'rgba(167,139,250,0.95)' : 'rgba(255,255,255,0.16)'} />
      ))}

      {/* Stat cards row */}
      {[
        { x: 82,  val: '2,847', label: 'Students',   color: '#a78bfa' },
        { x: 200, val: '94.2%', label: 'Attendance',  color: '#34d399' },
        { x: 318, val: '₹1.2L', label: 'Revenue',    color: '#60a5fa' },
      ].map(({ x, val, label, color }) => (
        <g key={label}>
          <rect x={x} y="13" width="106" height="56" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
          <text x={x+12} y="38" fill={color} fontSize="15" fontWeight="bold" filter="url(#glow)">{val}</text>
          <text x={x+12} y="56" fill="rgba(255,255,255,0.36)" fontSize="9">{label}</text>
        </g>
      ))}

      {/* Bar chart panel */}
      <rect x="82" y="82" width="230" height="144" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <text x="96" y="100" fill="rgba(255,255,255,0.60)" fontSize="9" fontWeight="600">Revenue Overview</text>
      {[
        { x: 102, h: 62, g: 'bV' }, { x: 136, h: 82, g: 'bB' }, { x: 170, h: 50, g: 'bG' },
        { x: 204, h: 94, g: 'bV' }, { x: 238, h: 74, g: 'bB' }, { x: 272, h: 100, g: 'bV' },
      ].map(({ x, h, g }, i) => (
        <rect key={i} x={x} y={210 - h} width="24" height={h} rx="4" fill={`url(#${g})`} opacity=".9" />
      ))}
      {['J','F','M','A','M','J'].map((m, i) => (
        <text key={m} x={114 + i*34} y="224" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="8">{m}</text>
      ))}

      {/* Donut chart panel */}
      <rect x="324" y="82" width="138" height="144" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <text x="337" y="100" fill="rgba(255,255,255,0.60)" fontSize="9" fontWeight="600">Attendance</text>
      <circle cx="393" cy="168" r="38" fill="none" stroke="rgba(108,60,244,0.18)" strokeWidth="14" />
      <circle cx="393" cy="168" r="38" fill="none" stroke="url(#bV)" strokeWidth="14"
        strokeDasharray="194 44" strokeLinecap="round" strokeDashoffset="48" />
      <text x="393" y="172" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">94%</text>
      <text x="393" y="184" textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize="7">present</text>

      {/* Notification bar */}
      <rect x="82" y="238" width="380" height="44" rx="10" fill="rgba(108,60,244,0.13)" stroke="rgba(108,60,244,0.28)" strokeWidth="0.8" />
      <circle cx="102" cy="260" r="10" fill="rgba(108,60,244,0.45)" />
      <text x="102" y="264" textAnchor="middle" fill="white" fontSize="8">!</text>
      <rect x="122" y="252" width="110" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
      <rect x="122" y="264" width="70" height="4" rx="2" fill="rgba(255,255,255,0.14)" />
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
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
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
          50%      { opacity:1; transform:scale(1.4); }
        }
        @keyframes particleRise {
          0%   { transform:translateY(0) scale(1); opacity:0.55; }
          100% { transform:translateY(-100px) translateX(15px) scale(0); opacity:0; }
        }

        .gc-font     { font-family:'DM Sans', sans-serif; }
        .gc-mono     { font-family:'DM Mono', monospace; }
        .float-panel { animation: floatY 7s ease-in-out infinite; }
        .orb-a       { animation: orbMove1 10s ease-in-out infinite; }
        .orb-b       { animation: orbMove2 13s ease-in-out infinite; }
        .orb-c       { animation: orbMove3 8s ease-in-out infinite; }

        .anim-1 { animation: fadeSlideUp .55s ease-out .05s both; }
        .anim-2 { animation: fadeSlideUp .55s ease-out .15s both; }
        .anim-3 { animation: fadeSlideUp .55s ease-out .25s both; }
        .anim-4 { animation: fadeSlideUp .55s ease-out .35s both; }

        .glass-input {
          background: rgba(255,255,255,0.075) !important;
          border-color: rgba(255,255,255,0.13) !important;
          color: rgba(255,255,255,0.92) !important;
          backdrop-filter: blur(8px);
          transition: all .2s ease-out;
        }
        .glass-input::placeholder { color:rgba(255,255,255,0.28) !important; }
        .glass-input:hover        { border-color:rgba(255,255,255,0.24) !important; }
        .glass-input:focus-visible {
          border-color:rgba(108,60,244,.65) !important;
          box-shadow: 0 0 0 3px rgba(108,60,244,.18), 0 0 22px rgba(108,60,244,.14) !important;
          background: rgba(255,255,255,0.09) !important;
        }

        .particle {
          position:absolute; width:3px; height:3px; border-radius:50%;
          background:rgba(167,139,250,.45);
          animation: particleRise linear infinite;
          pointer-events:none;
        }
        .btn-glow:not(:disabled):hover {
          box-shadow: 0 6px 30px rgba(108,60,244,.60), 0 0 50px rgba(108,60,244,.22) !important;
        }
      `}</style>

      <div
        data-testid="login-page"
        className="gc-font min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #090614 0%, #110a2c 28%, #0e1040 58%, #060612 100%)' }}
      >
        {/* Glow orbs */}
        <div className="orb-a absolute pointer-events-none" style={{ top:'-8%', left:'-5%', width:600, height:600,
          background:'radial-gradient(circle, rgba(108,60,244,.22) 0%, transparent 65%)', filter:'blur(45px)' }} />
        <div className="orb-b absolute pointer-events-none" style={{ bottom:'-12%', right:'-6%', width:560, height:560,
          background:'radial-gradient(circle, rgba(168,85,247,.18) 0%, transparent 65%)', filter:'blur(45px)' }} />
        <div className="orb-c absolute pointer-events-none" style={{ top:'35%', right:'22%', width:300, height:300,
          background:'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)', filter:'blur(30px)' }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)',
          backgroundSize:'48px 48px',
        }} />

        {/* Particles */}
        {[
          { left:'10%', top:'70%', delay:'0s',    dur:'9s'  },
          { left:'20%', top:'82%', delay:'2.5s',  dur:'11s' },
          { left:'33%', top:'75%', delay:'5s',    dur:'8s'  },
          { left:'70%', top:'78%', delay:'1.5s',  dur:'10s' },
          { left:'84%', top:'65%', delay:'3.8s',  dur:'12s' },
          { left:'55%', top:'85%', delay:'6s',    dur:'9s'  },
        ].map((p, i) => (
          <div key={i} className="particle" style={{ left:p.left, top:p.top, animationDelay:p.delay, animationDuration:p.dur }} />
        ))}

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── LEFT: hero ───────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col flex-1 min-w-0">

            {/* Brand */}
            <div className="anim-1 flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-[13px] flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow:'0 8px 24px rgba(108,60,244,.55)' }}>
                <span className="text-white font-bold text-[17px]">G</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Growcad</span>
            </div>

            <div className="anim-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] mb-3" style={{ color:'rgba(167,139,250,.80)' }}>
                Coaching ERP Platform
              </p>
              <h1 className="text-[3.1rem] font-extrabold leading-[1.10] text-white mb-4" style={{ letterSpacing:'-0.025em' }}>
                Everything your<br />institute needs,<br />
                <span style={{ background:'linear-gradient(90deg,#a78bfa,#e879f9,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  in one place.
                </span>
              </h1>
              <p className="text-[15px] leading-relaxed mb-10" style={{ color:'rgba(255,255,255,.40)' }}>
                Manage academics, operations, and finances<br />from one intelligent platform.
              </p>
            </div>

            {/* Floating illustration */}
            <div className="anim-3 float-panel mb-10"
              style={{ filter:'drop-shadow(0 30px 60px rgba(108,60,244,.38)) drop-shadow(0 8px 18px rgba(0,0,0,.55))' }}>
              <DashboardIllustration />
            </div>

            {/* Feature pills */}
            <div className="anim-4 flex flex-wrap gap-2">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default transition-all duration-200"
                  style={{ background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.09)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(108,60,244,.40)'; e.currentTarget.style.background='rgba(108,60,244,.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.09)'; e.currentTarget.style.background='rgba(255,255,255,.055)'; }}
                >
                  <Icon size={12} style={{ color:'#a78bfa' }} />
                  <span className="text-[11px] font-medium" style={{ color:'rgba(255,255,255,.52)' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Trust strip */}
            <div className="anim-4 flex items-center gap-8 mt-9 pt-7"
              style={{ borderTop:'1px solid rgba(255,255,255,.07)' }}>
              {[['2k+','Students'],['150+','Institutes'],['99.9%','Uptime']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-[1.2rem] font-bold text-white leading-tight">{v}</p>
                  <p className="text-[10.5px]" style={{ color:'rgba(255,255,255,.30)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: glass form ─────────────────────────────────── */}
          <div className={`anim-2 w-full max-w-[400px] shrink-0 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)' }}>
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-lg font-bold text-white">Growcad</span>
            </div>

            {/* Glass card */}
            <div
              className="w-full transition-all duration-300 ease-out hover:-translate-y-[3px]"
              style={{
                background:    'rgba(255,255,255,0.075)',
                backdropFilter:'blur(28px)',
                WebkitBackdropFilter:'blur(28px)',
                border:        '1px solid rgba(255,255,255,0.13)',
                borderRadius:  '24px',
                boxShadow:     '0 4px 28px rgba(0,0,0,.38), 0 1px 0 rgba(255,255,255,.08) inset, 0 0 80px rgba(108,60,244,.07)',
                padding:       '30px',
              }}
            >
              <div className="mb-6">
                <h2 className="text-[1.5rem] font-bold text-white leading-tight tracking-tight mb-1">Welcome back</h2>
                <p className="text-sm" style={{ color:'rgba(255,255,255,.40)' }}>Sign in to manage your institute</p>
              </div>

              {/* Error */}
              {error && (
                <div data-testid="login-error"
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.28)', color:'#fca5a5' }}>
                  <div className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background:'rgba(239,68,68,.22)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  </div>
                  {error}
                </div>
              )}

              {/* Google */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-[12px] mb-5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                style={{ background:'rgba(255,255,255,0.94)', color:'#1a1625', boxShadow:'0 2px 10px rgba(0,0,0,.22)' }}
                onMouseEnter={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.boxShadow='0 4px 18px rgba(0,0,0,.30)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.94)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,.22)'; e.currentTarget.style.transform='none'; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,.09)' }} />
                <span className="text-[11px] font-medium" style={{ color:'rgba(255,255,255,.28)' }}>or sign in with email</span>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password"
                      className="text-[10.5px] font-bold uppercase tracking-[0.10em]"
                      style={{ color:'rgba(255,255,255,.40)' }}>
                      Password
                    </Label>
                    <a href="#" onClick={e => e.preventDefault()}
                      className="text-[11px] font-medium transition-colors duration-150"
                      style={{ color:'rgba(167,139,250,.65)' }}
                      onMouseEnter={e => e.currentTarget.style.color='#a78bfa'}
                      onMouseLeave={e => e.currentTarget.style.color='rgba(167,139,250,.65)'}
                    >Forgot password?</a>
                  </div>
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

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor:'#7c4ff5' }}
                  />
                  <span className="text-[12px] font-medium transition-colors duration-150"
                    style={{ color:'rgba(255,255,255,.38)' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.62)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.38)'}
                  >Keep me signed in</span>
                </label>

                {/* Submit */}
                <button
                  data-testid="login-submit-button"
                  type="submit"
                  disabled={loading}
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

              {/* Help / WhatsApp */}
              <a
                href="https://wa.me/917488616782"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 py-2.5 w-full rounded-[10px] text-xs font-medium transition-all duration-200"
                style={{ color:'rgba(255,255,255,.30)', border:'1px solid rgba(255,255,255,.07)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(37,211,102,.35)'; e.currentTarget.style.color='rgba(74,222,128,.80)'; e.currentTarget.style.background='rgba(37,211,102,.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.30)'; e.currentTarget.style.background='transparent'; }}
              >
                <MessageCircle size={13} />
                Need help? WhatsApp us · 7488616782
              </a>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 p-4 rounded-[16px]"
              style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)' }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2.5"
                style={{ color:'rgba(255,255,255,.22)' }}>Demo Credentials</p>
              <div className="space-y-1.5">
                {DEMO_CREDS.map(({ role, email: e, pw }) => (
                  <div key={role} className="flex items-center gap-2 text-xs" style={{ color:'rgba(255,255,255,.38)' }}>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background:'rgba(108,60,244,.20)', color:'#a78bfa' }}>{role}</span>
                    <span>{e}</span>
                    <span style={{ color:'rgba(255,255,255,.18)' }}>/</span>
                    <span className="gc-mono">{pw}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
