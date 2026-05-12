/**
 * src/pages/SubdomainLoginPage.js
 * OTP-based login for students and teachers on slug.growcad.in
 * Two steps: enter mobile → receive OTP → verify → redirect to dashboard
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import API from '@/api';

// ─── 6-digit OTP split input ──────────────────────────────────────────────────

function OTPInput({ value, onChange, disabled }) {
  const refs   = useRef([]);
  const digits = (value.padEnd(6, ' ')).slice(0, 6).split('');

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (digits[i].trim()) { next[i] = ' '; }
      else if (i > 0) { next[i - 1] = ' '; refs.current[i - 1]?.focus(); }
      onChange(next.join('').trimEnd());
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits]; next[i] = e.key;
    onChange(next.join('').trimEnd());
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0, 6);
    if (p) { onChange(p); refs.current[Math.min(p.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2">
      {digits.map((d, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={d.trim()} onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste} onChange={() => {}} disabled={disabled}
          className="flex-1 h-12 text-center text-lg font-bold rounded-xl outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border:     d.trim() ? '1.5px solid rgba(108,60,244,0.70)' : '1px solid rgba(255,255,255,0.12)',
            color:      'rgba(255,255,255,0.92)',
            boxShadow:  d.trim() ? '0 0 10px rgba(108,60,244,0.28)' : 'none',
            caretColor: '#a78bfa',
          }}
        />
      ))}
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(n = 60) {
  const [s, setS] = useState(n);
  const reset = (x = n) => setS(x);
  useEffect(() => {
    if (s <= 0) return;
    const t = setTimeout(() => setS(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [s]);
  return [s, reset];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubdomainLoginPage() {
  const navigate = useNavigate();
  const { subdomainLogin, isAuthenticated, isSubdomain, subdomain } = useAuth();

  const [step,    setStep]    = useState('mobile'); // 'mobile' | 'otp'
  const [mobile,  setMobile]  = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [cDown,   resetCDown] = useCountdown(60);

  // Redirect if authenticated or wrong domain
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
    if (!isSubdomain)    navigate('/login',     { replace: true });
  }, [isAuthenticated, isSubdomain, navigate]);

  // Step 1: request OTP
  const requestOtp = async (e) => {
    e.preventDefault();
    setError('');
    const m = mobile.replace(/\D/g, '');
    if (m.length < 10) { setError('Enter a valid 10-digit mobile number.'); return; }

    setLoading(true);
    try {
      await API.post('/auth/send-otp', { target: m, channel: 'mobile' });
      setMobile(m);
      setStep('otp');
      resetCDown();
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP and log in
  const verifyOtp = async () => {
    if (otp.trim().length < 6) { setError('Enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      await subdomainLogin(mobile, otp.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cDown > 0) return;
    setError('');
    try {
      await API.post('/auth/send-otp', { target: mobile, channel: 'mobile' });
      resetCDown();
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}>

      <div className="fixed pointer-events-none" style={{ top:'-8%',left:'-5%',width:500,height:500,background:'radial-gradient(circle,rgba(108,60,244,.18) 0%,transparent 65%)',filter:'blur(50px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom:'-12%',right:'-6%',width:460,height:460,background:'radial-gradient(circle,rgba(168,85,247,.14) 0%,transparent 65%)',filter:'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow:'0 6px 22px rgba(108,60,244,0.55)' }}>
            <span className="text-white font-bold text-[16px]">G</span>
          </div>
          <div>
            <span className="text-[19px] font-bold text-white tracking-tight">Growcad</span>
            {subdomain && (
              <p className="text-[10px] font-medium capitalize" style={{ color:'rgba(255,255,255,.38)' }}>
                {subdomain}
              </p>
            )}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.075)', backdropFilter:'blur(26px)',
          border:'1px solid rgba(255,255,255,0.12)', borderRadius:'22px', padding:'28px',
          boxShadow:'0 4px 30px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.08) inset',
        }}>

          {step === 'mobile' ? (
            <>
              <div className="flex items-center gap-2.5 mb-1">
                <Smartphone size={18} className="text-violet-400" />
                <h2 className="text-[1.35rem] font-bold text-white tracking-tight">Sign in</h2>
              </div>
              <p className="text-xs mb-6" style={{ color:'rgba(255,255,255,.40)' }}>
                Enter your registered mobile number
              </p>

              {error && (
                <div className="mb-4 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
                  style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.28)', color:'#fca5a5' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
                </div>
              )}

              <form onSubmit={requestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.38)' }}>
                    Mobile Number
                  </Label>
                  <Input value={mobile} onChange={e => setMobile(e.target.value)}
                    placeholder="9876543210" required type="tel"
                    className="h-10"
                    style={{ background:'rgba(255,255,255,0.07)', borderColor:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.92)' }} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)', boxShadow:'0 4px 20px rgba(108,60,244,.45)' }}>
                  {loading
                    ? <><div className="w-4 h-4 rounded-full animate-spin" style={{ border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff' }} /> Sending OTP…</>
                    : <>Get OTP <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[1.35rem] font-bold text-white tracking-tight mb-1">Enter OTP</h2>
              <p className="text-xs mb-6" style={{ color:'rgba(255,255,255,.40)' }}>
                Sent to <span className="text-white/70">+91 {mobile.slice(-10).replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
              </p>

              {error && (
                <div className="mb-4 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
                  style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.28)', color:'#fca5a5' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
                </div>
              )}

              <OTPInput value={otp} onChange={setOtp} disabled={loading} />

              <button onClick={verifyOtp} disabled={loading || otp.trim().length < 6}
                className="mt-4 w-full py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40"
                style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)', boxShadow:'0 4px 20px rgba(108,60,244,.45)' }}>
                {loading
                  ? <><div className="w-4 h-4 rounded-full animate-spin" style={{ border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff' }} /> Verifying…</>
                  : <>Verify &amp; Sign In <ArrowRight size={15} /></>}
              </button>

              <div className="flex items-center justify-between mt-4">
                <button onClick={() => { setStep('mobile'); setOtp(''); setError(''); }}
                  className="text-[11px] text-white/35 hover:text-white/65 transition-colors">
                  ← Change number
                </button>
                <button onClick={resend} disabled={cDown > 0}
                  className="text-[11px] flex items-center gap-1 transition-colors"
                  style={{ color: cDown > 0 ? 'rgba(255,255,255,.22)' : '#a78bfa' }}>
                  <RefreshCw size={10} /> {cDown > 0 ? `Resend in ${cDown}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
