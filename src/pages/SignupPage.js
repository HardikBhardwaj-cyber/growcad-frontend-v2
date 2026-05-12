/**
 * src/pages/SignupPage.js
 * Step 1 of 4 — Admin account creation (main domain only).
 * Submits to /auth/admin-signup, then navigates to /verify-otp.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import API        from '@/api';

// ─── Shared step-bar used across the 4-step flow ─────────────────────────────

export function StepBar({ current }) {
  const steps = ['Account', 'Verify', 'Onboarding', 'Plan'];
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                style={
                  done   ? { background:'#10b981', color:'#fff' } :
                  active ? { background:'linear-gradient(135deg,#6C3CF4,#a855f7)', color:'#fff', boxShadow:'0 0 14px rgba(108,60,244,0.55)' } :
                           { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.30)' }
                }
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span className="text-[9px] font-semibold mt-1 whitespace-nowrap"
                style={{ color: active ? '#a78bfa' : done ? '#34d399' : 'rgba(255,255,255,0.25)' }}>
                {label}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-4 transition-all duration-300"
                style={{ background: done ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
.gc-auth * { font-family:'DM Sans',sans-serif; }
@keyframes gc-orb1 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(40px,-30px);} }
@keyframes gc-orb2 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(-30px,40px);} }
.gc-orb1 { animation: gc-orb1 12s ease-in-out infinite; }
.gc-orb2 { animation: gc-orb2 15s ease-in-out infinite; }
@keyframes gc-fadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
.gc-card { animation: gc-fadeUp .5s ease-out both; }
.gc-input {
  background:rgba(255,255,255,0.07)!important; border-color:rgba(255,255,255,0.12)!important;
  color:rgba(255,255,255,0.92)!important; backdrop-filter:blur(8px); transition:all .2s;
}
.gc-input::placeholder { color:rgba(255,255,255,0.28)!important; }
.gc-input:hover        { border-color:rgba(255,255,255,0.22)!important; }
.gc-input:focus-visible {
  border-color:rgba(108,60,244,0.65)!important;
  box-shadow:0 0 0 3px rgba(108,60,244,0.18),0 0 20px rgba(108,60,244,0.12)!important;
}
`;

export default function SignupPage() {
  const navigate             = useNavigate();
  const { isMainDomain }     = useAuth();
  const [form, setForm]      = useState({ name:'', mobile:'', email:'', password:'' });
  const [showPw, setShowPw]  = useState(false);
  const [loading, setLoading]= useState(false);
  const [error,   setError]  = useState('');

  // Guard: only admins on main domain can sign up
  useEffect(() => {
    if (!isMainDomain) navigate('/login', { replace: true });
  }, [isMainDomain, navigate]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const mobile = form.mobile.replace(/\D/g, '');
    if (mobile.length < 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      // Register pending admin + trigger email OTP
      await API.post('/auth/admin-signup', {
        name:     form.name.trim(),
        mobile,
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate('/verify-otp', {
        state: { mobile, email: form.email.trim().toLowerCase() },
      });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="gc-auth min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}>

        {/* Orbs */}
        <div className="gc-orb1 fixed pointer-events-none" style={{ top:'-8%',left:'-5%',width:520,height:520,background:'radial-gradient(circle,rgba(108,60,244,.20) 0%,transparent 65%)',filter:'blur(50px)' }} />
        <div className="gc-orb2 fixed pointer-events-none" style={{ bottom:'-12%',right:'-6%',width:480,height:480,background:'radial-gradient(circle,rgba(168,85,247,.16) 0%,transparent 65%)',filter:'blur(50px)' }} />

        <div className="relative z-10 w-full max-w-[430px]">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow:'0 6px 22px rgba(108,60,244,0.55)' }}>
              <span className="text-white font-bold text-[16px]">G</span>
            </div>
            <span className="text-[19px] font-bold text-white tracking-tight">Growcad</span>
          </div>

          <StepBar current={0} />

          {/* Glass card */}
          <div className="gc-card" style={{
            background:'rgba(255,255,255,0.075)', backdropFilter:'blur(26px)',
            border:'1px solid rgba(255,255,255,0.12)', borderRadius:'22px', padding:'30px',
            boxShadow:'0 4px 30px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.08) inset,0 0 60px rgba(108,60,244,.06)',
          }}>
            <h2 className="text-[1.45rem] font-bold text-white tracking-tight mb-1">Create your account</h2>
            <p className="text-xs mb-6" style={{ color:'rgba(255,255,255,.40)' }}>
              Set up Growcad for your coaching institute
            </p>

            {error && (
              <div className="mb-5 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
                style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.28)', color:'#fca5a5' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.38)' }}>
                  Full Name
                </Label>
                <Input value={form.name} onChange={set('name')} placeholder="Amit Sharma"
                  required className="h-10 gc-input" />
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.38)' }}>
                  Mobile Number
                </Label>
                <Input value={form.mobile} onChange={set('mobile')} placeholder="9876543210"
                  required className="h-10 gc-input" />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.38)' }}>
                  Email Address
                </Label>
                <Input type="email" value={form.email} onChange={set('email')}
                  placeholder="you@institute.com" required className="h-10 gc-input" />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.38)' }}>
                  Password
                </Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={set('password')} placeholder="Min 8 characters"
                    required minLength={8} className="h-10 pr-10 gc-input" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color:'rgba(255,255,255,.28)' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.65)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.28)'}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full mt-1 py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)', boxShadow:'0 4px 20px rgba(108,60,244,.45)' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow='0 6px 28px rgba(108,60,244,.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(108,60,244,.45)'; }}>
                {loading
                  ? <><div className="w-4 h-4 rounded-full animate-spin" style={{ border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff' }} /> Sending email OTP...</>
                  : <>Continue <ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-1 mt-5 text-xs">
            <span style={{ color:'rgba(255,255,255,.35)' }}>Already have an account?</span>
            <Link to="/login" className="font-semibold transition-colors"
              style={{ color:'#a78bfa' }}
              onMouseEnter={e => e.currentTarget.style.color='#c4b5fd'}
              onMouseLeave={e => e.currentTarget.style.color='#a78bfa'}>
              Sign in
            </Link>
          </div>

          <a href="https://wa.me/917488616782" target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 py-2.5 w-full rounded-[10px] text-xs font-medium transition-all duration-200"
            style={{ color:'rgba(255,255,255,.28)', border:'1px solid rgba(255,255,255,.07)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(37,211,102,.35)'; e.currentTarget.style.color='rgba(74,222,128,.80)'; e.currentTarget.style.background='rgba(37,211,102,.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.28)'; e.currentTarget.style.background='transparent'; }}>
            <MessageCircle size={13} /> Need help? WhatsApp us · 7488616782
          </a>
        </div>
      </div>
    </>
  );
}
