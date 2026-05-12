/**
 * src/pages/OTPVerificationPage.js
 * Step 2 of 4 — Verify mobile OTP + email OTP independently.
 * Both must be verified before continuing to /onboarding.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Check, RefreshCw } from 'lucide-react';
import { StepBar } from './SignupPage';
import API from '@/api';

// ─── 6-digit split OTP input ──────────────────────────────────────────────────

function OTPInput({ value, onChange, disabled }) {
  const refs = useRef([]);

  // Normalise value to exactly 6 chars, padding with spaces
  const digits = (value.padEnd(6, ' ')).slice(0, 6).split('');

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (digits[i].trim()) {
        next[i] = ' ';
      } else if (i > 0) {
        next[i - 1] = ' ';
        refs.current[i - 1]?.focus();
      }
      onChange(next.join('').trimEnd());
      return;
    }
    if (e.key === 'ArrowLeft')  { refs.current[i - 1]?.focus(); return; }
    if (e.key === 'ArrowRight') { refs.current[i + 1]?.focus(); return; }
    if (!/^\d$/.test(e.key)) return;

    const next = [...digits];
    next[i] = e.key;
    onChange(next.join('').trimEnd());
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-6 gap-2 w-full">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onChange={() => {}} // controlled via onKeyDown
          disabled={disabled}
          className="w-full min-w-0 h-11 text-center text-lg font-bold rounded-xl outline-none transition-all duration-200 disabled:opacity-40"
          style={{
            background:   'rgba(255,255,255,0.07)',
            border:       d.trim()
              ? '1.5px solid rgba(108,60,244,0.70)'
              : '1px solid rgba(255,255,255,0.12)',
            color:        'rgba(255,255,255,0.92)',
            boxShadow:    d.trim() ? '0 0 10px rgba(108,60,244,0.28)' : 'none',
            caretColor:   '#a78bfa',
          }}
        />
      ))}
    </div>
  );
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(initial = 60) {
  const [secs, setSecs] = useState(initial);
  const reset = (n = initial) => setSecs(n);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  return [secs, reset];
}

// ─── Single channel verify block ─────────────────────────────────────────────

function VerifyBlock({ channel, target, label, Icon, verified, onVerified, globalLoading, setGlobalLoading, setGlobalError }) {
  const [otp, setOtp]       = useState('');
  const [cDown, resetCDown] = useCountdown(60);

  const maskedTarget = channel === 'mobile'
    ? `${target.slice(0, 2)}****${target.slice(-2)}`
    : `${target.slice(0, 3)}***@${target.split('@')[1] ?? ''}`;

  const resend = async () => {
    if (cDown > 0) return;
    try {
      await API.post('/auth/send-otp', { target, channel });
      resetCDown();
      setOtp('');
    } catch (err) {
      setGlobalError(err.message || 'Failed to resend OTP.');
    }
  };

  const verify = async () => {
    if (otp.trim().length < 6) { setGlobalError(`Enter all 6 digits for the ${label} OTP.`); return; }
    setGlobalLoading(true);
    setGlobalError('');
    try {
      await API.post('/auth/verify-otp', { target, otp: otp.trim(), channel });
      onVerified();
    } catch (err) {
      setGlobalError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl transition-all duration-200" style={{
      background: verified ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
      border:     verified ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: verified ? '#34d399' : '#a78bfa' }} />
          <span className="text-xs font-semibold text-white/75">{label} OTP</span>
          <span className="text-[10px] text-white/35">{maskedTarget}</span>
        </div>
        {verified ? (
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <Check size={11} /> Verified
          </span>
        ) : (
          <button onClick={resend} disabled={cDown > 0}
            className="text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-full transition-all disabled:cursor-not-allowed"
            style={{
              color: cDown > 0 ? 'rgba(255,255,255,.30)' : '#c4b5fd',
              background: cDown > 0 ? 'rgba(255,255,255,.04)' : 'rgba(108,60,244,.18)',
              border: cDown > 0 ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(167,139,250,.28)',
            }}>
            <RefreshCw size={10} />
            {cDown > 0 ? `${cDown}s` : 'Resend code'}
          </button>
        )}
      </div>

      {/* OTP entry */}
      {!verified && (
        <>
          <OTPInput value={otp} onChange={setOtp} disabled={globalLoading} />
          <button onClick={verify} disabled={globalLoading || otp.trim().length < 6}
            className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)', boxShadow:'0 2px 12px rgba(108,60,244,0.35)' }}>
            {globalLoading
              ? <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full animate-spin" style={{ border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff' }} />
                  Verifying…
                </span>
              : `Verify ${label}`}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OTPVerificationPage() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { mobile, email } = state || {};

  const [emailVerified,  setEmailVerified]  = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  // Redirect if arrived without context
  useEffect(() => {
    if (!mobile || !email) navigate('/signup', { replace: true });
  }, [mobile, email, navigate]);

  const handleContinue = () => {
    if (!emailVerified) {
      setError('Please verify your email before continuing.');
      return;
    }
    navigate('/onboarding', { state: { mobile, email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}>

      <div className="fixed pointer-events-none" style={{ top:'-8%',left:'-5%',width:500,height:500,background:'radial-gradient(circle,rgba(108,60,244,.18) 0%,transparent 65%)',filter:'blur(50px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom:'-12%',right:'-6%',width:460,height:460,background:'radial-gradient(circle,rgba(168,85,247,.14) 0%,transparent 65%)',filter:'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-[430px]">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow:'0 6px 22px rgba(108,60,244,0.55)' }}>
            <span className="text-white font-bold text-[16px]">G</span>
          </div>
          <span className="text-[19px] font-bold text-white tracking-tight">Growcad</span>
        </div>

        <StepBar current={1} />

        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold rounded-full px-3 py-2 transition-all"
          style={{ color:'#c4b5fd', background:'rgba(108,60,244,.12)', border:'1px solid rgba(167,139,250,.20)' }}
        >
          <ArrowLeft size={13} /> Back to account
        </button>

        <div style={{
          background:'rgba(255,255,255,0.075)', backdropFilter:'blur(26px)',
          border:'1px solid rgba(255,255,255,0.12)', borderRadius:'22px', padding:'30px',
          boxShadow:'0 4px 30px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.08) inset',
        }}>
          <h2 className="text-[1.45rem] font-bold text-white tracking-tight mb-1">Verify your identity</h2>
          <p className="text-xs mb-6" style={{ color:'rgba(255,255,255,.40)' }}>
            Enter the 6-digit code sent to your email
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
              style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.28)', color:'#fca5a5' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-3">
            <VerifyBlock
              channel="email" target={email} label="Email" Icon={Mail}
              verified={emailVerified} onVerified={() => setEmailVerified(true)}
              globalLoading={loading} setGlobalLoading={setLoading} setGlobalError={setError}
            />
          </div>

          <button onClick={handleContinue} disabled={!emailVerified}
            className="mt-5 w-full py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)', boxShadow:'0 4px 20px rgba(108,60,244,.42)' }}>
            Continue to Onboarding →
          </button>
        </div>
      </div>
    </div>
  );
}
