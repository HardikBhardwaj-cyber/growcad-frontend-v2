/**
 * src/pages/PendingApprovalPage.js
 *
 * Shown after a cash/bank-transfer payment is submitted.
 * The super admin reviews it in their panel and either approves or rejects.
 * This page polls GET /institute/status every 30s and auto-redirects on approval.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/api';

export default function PendingApprovalPage() {
  const navigate        = useNavigate();
  const { state }       = useLocation();
  const { instituteSlug, plan, amount } = state || {};
  const { user }        = useAuth();

  const [status,       setStatus]       = useState('pending_approval'); // 'pending_approval' | 'active' | 'rejected'
  const [secondsLeft,  setSecondsLeft]  = useState(30);
  const [checkCount,   setCheckCount]   = useState(0);
  const intervalRef = useRef(null);

  // ── Poll for approval ──────────────────────────────────────────────────────

  const checkStatus = async () => {
    if (!user?.instituteId) return;
    try {
      const { data } = await API.get(`/institute/by-id/${user.instituteId}`);
      const s = data?.subscriptionStatus;
      setStatus(s ?? 'pending_approval');
      setCheckCount((c) => c + 1);
      if (s === 'active') {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          window.location.href = `https://${instituteSlug || data.slug}.growcad.in/dashboard`;
        }, 2500);
      }
    } catch {}
  };

  useEffect(() => {
    checkStatus(); // immediate check on mount
    // Countdown timer
    const countdown = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          checkStatus();
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    intervalRef.current = countdown;
    return () => clearInterval(countdown);
  }, []); // eslint-disable-line

  const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  // ── Approved ───────────────────────────────────────────────────────────────

  if (status === 'active') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background:'linear-gradient(135deg,#10b981,#34d399)', boxShadow:'0 0 50px rgba(16,185,129,0.50)' }}
          >
            <CheckCircle size={38} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Approved! 🎉</h2>
          <p className="text-sm text-white/45 mb-1">Your institute is now active.</p>
          <p className="text-xs text-white/30 mb-6">Redirecting to your dashboard…</p>
          <div className="w-6 h-6 rounded-full animate-spin mx-auto"
            style={{ border:'2px solid rgba(255,255,255,.15)', borderTopColor:'#6C3CF4' }} />
        </div>
      </div>
    );
  }

  // ── Rejected ───────────────────────────────────────────────────────────────

  if (status === 'rejected') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)' }}
          >
            <span className="text-3xl">✗</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Payment Not Approved</h2>
          <p className="text-sm text-white/40 mb-6">
            Your payment submission was not approved. Please contact support.
          </p>
          <a
            href="https://wa.me/917488616782"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all"
            style={{ background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.30)', color:'rgba(74,222,128,.85)' }}
          >
            <MessageCircle size={14} /> Contact Support
          </a>
        </div>
      </div>
    );
  }

  // ── Pending ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}
    >
      {/* Orbs */}
      <div className="fixed pointer-events-none" style={{ top:'-8%',left:'-5%',width:500,height:500,background:'radial-gradient(circle,rgba(108,60,244,.14) 0%,transparent 65%)',filter:'blur(50px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom:'-12%',right:'-6%',width:460,height:460,background:'radial-gradient(circle,rgba(168,85,247,.10) 0%,transparent 65%)',filter:'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-[400px] text-center">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)' }}>
            <span className="text-white font-bold text-[14px]">G</span>
          </div>
          <span className="text-[17px] font-bold text-white tracking-tight">Growcad</span>
        </div>

        {/* Clock animation */}
        <div className="relative w-24 h-24 mx-auto mb-7">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background:'rgba(108,60,244,0.12)', border:'2px solid rgba(108,60,244,0.30)' }}
          >
            <Clock size={36} className="text-violet-400" />
          </div>
          {/* Pulse rings */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border:'1.5px solid rgba(108,60,244,0.25)',
                animationDelay:`${i * 0.4}s`,
                animationDuration:'2s',
              }}
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Awaiting Approval</h2>
        <p className="text-sm text-white/45 mb-1">
          Your cash payment of <strong className="text-violet-400">{amount ? fmt(amount) : '—'}</strong> has been recorded.
        </p>
        <p className="text-xs text-white/30 mb-8">
          Our team will verify and activate your <strong className="text-white/45">{plan ?? ''}</strong> plan shortly.
          You'll receive a confirmation on your registered email and WhatsApp.
        </p>

        {/* Detail card */}
        <div
          className="p-5 rounded-2xl mb-8 text-left space-y-3"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
        >
          {[
            { label: 'Institute',  value: instituteSlug ? `${instituteSlug}.growcad.in` : '—' },
            { label: 'Plan',       value: plan    ?? '—' },
            { label: 'Amount',     value: amount  ? fmt(amount) : '—' },
            { label: 'Status',     value: 'Pending Super-Admin Review' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px] text-white/35">{label}</span>
              <span className="text-[11px] font-semibold text-white/70">{value}</span>
            </div>
          ))}
        </div>

        {/* Auto-check indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <RefreshCw size={11} className="text-white/25 animate-spin" style={{ animationDuration:'3s' }} />
          <span className="text-[10px] text-white/25">
            Checking status in {secondsLeft}s · Check #{checkCount}
          </span>
        </div>

        {/* Manual refresh */}
        <button
          onClick={() => { checkStatus(); setSecondsLeft(30); }}
          className="text-[11px] font-semibold px-4 py-2 rounded-lg transition-all"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.45)' }}
        >
          Check Now
        </button>

        {/* WhatsApp support */}
        <div className="mt-8">
          <a
            href="https://wa.me/917488616782?text=Hi%2C+my+cash+payment+is+pending+for+Growcad+institute+approval."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs transition-all"
            style={{ color:'rgba(255,255,255,.28)' }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(74,222,128,.75)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.28)'}
          >
            <MessageCircle size={12} /> Need help? WhatsApp us
          </a>
        </div>

      </div>
    </div>
  );
}
