/**
 * src/pages/PlanSelectionPage.js
 * Step 4 of 4 — Select base plan, add-ons, billing cycle → simulated payment.
 *
 * WHAT CHANGED vs uploaded version:
 *   1. Reads `institute_id` (snake_case) from navigation state to match
 *      OnboardingPage output AND the backend SelectPlanReq model.
 *   2. Token is no longer passed through navigation state — AuthContext
 *      stored it during createInstitute() in OnboardingPage.
 *   3. `/institute/select-plan` body key renamed from `instituteId` (camelCase)
 *      to `institute_id` (snake_case) to match the Pydantic model on the backend.
 *   4. Redirect guard no longer checks for token in state.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Plus, ArrowRight } from 'lucide-react';
import { StepBar } from './SignupPage';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Pricing data ─────────────────────────────────────────────────────────────
const BASE_PLANS = [
  { strength: '0-150',    monthly: 3000,  label: 'Starter',    students: 150  },
  { strength: '150-250',  monthly: 5000,  label: 'Growth',     students: 250  },
  { strength: '250-500',  monthly: 10000, label: 'Scale',      students: 500  },
  { strength: '500-750',  monthly: 15000, label: 'Pro',        students: 750  },
  { strength: '750-1000', monthly: 20000, label: 'Enterprise', students: 1000 },
];

const ADDONS = [
  { id: 'live_classes',       label: 'Live Classes',             monthly: 999,  yearly: null, desc: 'Google Meet integration for live sessions' },
  { id: 'live_recording',     label: 'Live Classes + Recording', monthly: 2499, yearly: null, desc: 'Live classes with auto-recorded sessions (R2 storage)' },
  { id: 'personal_domain',    label: 'Personal Domain',          monthly: null, yearly: 1999, desc: 'yoursite.com — custom branded domain, billed yearly' },
  { id: 'whatsapp_marketing', label: 'WhatsApp Marketing',       monthly: 2000, yearly: null, desc: 'Broadcast campaigns, ₹1k–₹3k/month (avg ₹2k)' },
  { id: 'whatsapp_utility',   label: 'WhatsApp Utility',         monthly: 1250, yearly: null, desc: 'Transactional messages, ₹1k–₹1.5k/month (avg ₹1.25k)' },
  { id: 'sms_utility',        label: 'SMS Utility',              monthly: 1000, yearly: null, desc: 'Automated SMS reminders and notifications' },
  { id: 'email_utility',      label: 'Email Utility',            monthly: 1000, yearly: null, desc: 'Transactional email via Resend' },
  { id: 'branding',           label: 'Personalised Branding',    monthly: 4999, yearly: null, desc: 'Custom logo, colours, and white-label experience' },
];

const YEARLY_DISCOUNT = 0.16;

function fmt(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Addon card ───────────────────────────────────────────────────────────────
function AddonCard({ addon, selected, onToggle, yearly }) {
  const price =
    addon.id === 'personal_domain'
      ? yearly
        ? addon.yearly
        : Math.round(addon.yearly / 12)
      : yearly
        ? Math.round(addon.monthly * (1 - YEARLY_DISCOUNT))
        : addon.monthly;

  return (
    <div
      onClick={onToggle}
      className="p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none"
      style={{
        background: selected ? 'linear-gradient(145deg,rgba(108,60,244,0.30),rgba(59,130,246,0.10))' : 'rgba(255,255,255,0.075)',
        border:     selected ? '1.5px solid rgba(196,181,253,0.72)' : '1px solid rgba(255,255,255,0.16)',
        boxShadow:  selected ? '0 0 24px rgba(108,60,244,0.24)' : '0 1px 0 rgba(255,255,255,.05) inset',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: '#fff' }}>{addon.label}</p>
          <p className="text-[10.5px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,.58)' }}>{addon.desc}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <div
            className="px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }}
          >
            <p className="text-[12px] font-bold" style={{ color: selected ? '#ddd6fe' : 'rgba(255,255,255,0.82)' }}>
              {fmt(price)}
              <span className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,.50)' }}>
                {addon.id === 'personal_domain' ? (yearly ? '/yr' : '/mo*') : '/mo'}
              </span>
            </p>
          </div>
          <div
            className="h-6 rounded-full flex items-center justify-center gap-1.5 px-2 transition-all"
            style={{
              background: selected ? '#6C3CF4' : 'rgba(255,255,255,0.08)',
              border:     selected ? 'none'    : '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {selected
              ? <Check size={11} className="text-white" />
              : <Plus  size={10} className="text-white/40" />}
            <span className="text-[9px] font-bold" style={{ color: selected ? '#fff' : 'rgba(255,255,255,.55)' }}>
              {selected ? 'Added' : 'Add'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlanSelectionPage() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { institute, user } = useAuth();

  // Key changed: institute_id (snake_case) — matches OnboardingPage output
  // and backend SelectPlanReq model
  const {
    institute_id: stateInstituteId,
    instituteSlug: stateInstituteSlug,
    totalStrength: stateTotalStrength,
    adminName: stateAdminName = '',
    adminEmail: stateAdminEmail = '',
  } = state || {};

  const institute_id = stateInstituteId || institute?.id;
  const instituteSlug = stateInstituteSlug || institute?.slug;
  const totalStrength = stateTotalStrength || institute?.totalStrength || '0-150';
  const adminName = stateAdminName || user?.name || '';
  const adminEmail = stateAdminEmail || user?.email || '';

  const [yearly,  setYearly]  = useState(false);
  const [addons,  setAddons]  = useState(new Set());
  const [paymentMode, setPaymentMode] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Guard ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Token is already in localStorage from AuthContext.createInstitute()
    if (!institute_id) navigate('/signup', { replace: true });
  }, [institute_id, navigate]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const basePlan = useMemo(
    () => BASE_PLANS.find((p) => p.strength === totalStrength) ?? BASE_PLANS[0],
    [totalStrength],
  );

  const basePrice = useMemo(
    () => yearly ? Math.round(basePlan.monthly * 12 * (1 - YEARLY_DISCOUNT)) : basePlan.monthly,
    [basePlan, yearly],
  );

  const addonsTotal = useMemo(() => {
    let sum = 0;
    for (const id of addons) {
      const a = ADDONS.find((x) => x.id === id);
      if (!a) continue;
      if (a.id === 'personal_domain') {
        sum += yearly ? (a.yearly ?? 0) : Math.round((a.yearly ?? 0) / 12);
      } else {
        sum += yearly ? Math.round(a.monthly * (1 - YEARLY_DISCOUNT)) : a.monthly;
      }
    }
    return sum;
  }, [addons, yearly]);

  const totalPrice = basePrice + addonsTotal;

  const toggleAddon = (id) => {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (id === 'live_recording') next.delete('live_classes');
        if (id === 'live_classes')   next.delete('live_recording');
        next.add(id);
      }
      return next;
    });
  };

  // ── Payment + plan save ────────────────────────────────────────────────────
  const planPayload = {
    institute_id,
    plan_type: basePlan.label.toLowerCase(),
    addons: [...addons],
    billing_cycle: yearly ? 'yearly' : 'monthly',
    amount: totalPrice,
  };

  const submitCashPlan = async () => {
    const { data } = await API.post('/institute/select-plan', {
      ...planPayload,
      payment_mode: 'cash',
    });

    navigate('/pending-approval', {
      replace: true,
      state: {
        instituteSlug: data.institute?.slug || instituteSlug,
        plan: basePlan.label,
        amount: totalPrice,
      },
    });
  };

  const submitRazorpayPlan = async () => {
    const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!key) {
      throw new Error('Razorpay key is missing. Add REACT_APP_RAZORPAY_KEY_ID in frontend env.');
    }

    const ready = await loadRazorpayScript();
    if (!ready) {
      throw new Error('Could not load Razorpay checkout. Please try again.');
    }

    const { data: order } = await API.post('/payments/create-order', {
      ...planPayload,
      currency: 'INR',
    });

    await new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Growcad',
        description: `${basePlan.label} plan (${yearly ? 'yearly' : 'monthly'})`,
        order_id: order.id,
        prefill: {
          name: adminName,
          email: adminEmail,
        },
        theme: {
          color: '#6C3CF4',
        },
        handler: async (response) => {
          try {
            const { data } = await API.post('/institute/select-plan', {
              ...planPayload,
              payment_mode: 'razorpay',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            navigate('/payment-success', {
              replace: true,
              state: {
                instituteSlug: data.institute?.slug || instituteSlug,
                plan: basePlan.label,
                billing: yearly ? 'yearly' : 'monthly',
              },
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled.')),
        },
      });

      checkout.open();
    });
  };

  const handlePayment = async () => {
    setError('');
    setLoading(true);
    try {
      if (paymentMode === 'cash') {
        await submitCashPlan();
      } else {
        await submitRazorpayPlan();
      }
    } catch (err) {
      setError(err.message || 'Plan activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (process.env.REACT_APP_SHOW_LEGACY_SUCCESS === 'true') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          fontFamily: "'DM Sans',sans-serif",
          background: 'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)',
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 0 40px rgba(16,185,129,0.50)' }}
          >
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
          <p className="text-sm text-white/45 mb-6">
            Your institute{' '}
            <strong className="text-violet-400">{instituteSlug}.growcad.in</strong> is now live.
          </p>
          <a
            href={`https://${instituteSlug}.growcad.in/dashboard`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow: '0 4px 20px rgba(108,60,244,.45)' }}
          >
            Go to Dashboard <ArrowRight size={15} />
          </a>
        </div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-12 relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans',sans-serif",
        background: 'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)',
      }}
    >
      <div className="fixed pointer-events-none" style={{ top: '-8%', left: '-5%', width: 520, height: 520, background: 'radial-gradient(circle,rgba(108,60,244,.18) 0%,transparent 65%)', filter: 'blur(50px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-12%', right: '-6%', width: 480, height: 480, background: 'radial-gradient(circle,rgba(168,85,247,.14) 0%,transparent 65%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-[520px]">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow: '0 6px 22px rgba(108,60,244,0.55)' }}>
            <span className="text-white font-bold text-[16px]">G</span>
          </div>
          <span className="text-[19px] font-bold text-white tracking-tight">Growcad</span>
        </div>

        <StepBar current={3} />

        <div style={{
          background: 'rgba(255,255,255,0.075)', backdropFilter: 'blur(26px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '28px',
          boxShadow: '0 4px 30px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.08) inset',
        }}>
          <h2 className="text-[1.35rem] font-bold text-white tracking-tight mb-1">Choose your plan</h2>
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,.40)' }}>
            Selected plan for <strong className="text-violet-400">{basePlan.label}</strong> ({basePlan.students} students)
          </p>

          {/* Billing toggle */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-medium" style={{ color: yearly ? 'rgba(255,255,255,.40)' : '#a78bfa' }}>Monthly</span>
            <button
              onClick={() => setYearly((y) => !y)}
              className="relative w-10 h-5 rounded-full transition-all duration-200"
              style={{ background: yearly ? '#6C3CF4' : 'rgba(255,255,255,0.12)' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: yearly ? '22px' : '2px' }}
              />
            </button>
            <span className="text-xs font-medium" style={{ color: yearly ? '#a78bfa' : 'rgba(255,255,255,.40)' }}>
              Yearly <span className="text-emerald-400 font-bold">−16%</span>
            </span>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)', color: '#fca5a5' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
            </div>
          )}

          {/* Base plan */}
          <div className="p-4 rounded-2xl mb-4"
            style={{ background: 'rgba(108,60,244,0.10)', border: '1.5px solid rgba(108,60,244,0.40)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{basePlan.label} Plan</p>
                <p className="text-[10px] text-white/40 mt-0.5">Up to {basePlan.students} students</p>
              </div>
              <p className="text-lg font-bold text-violet-400">
                {fmt(basePrice)}<span className="text-[10px] font-medium text-white/40">{yearly ? '/yr' : '/mo'}</span>
              </p>
            </div>
          </div>

          {/* Add-ons */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Add-ons (optional)</p>
            <span className="text-[10px] font-bold rounded-full px-2 py-1" style={{ color: '#c4b5fd', background: 'rgba(108,60,244,.16)' }}>
              {addons.size} selected
            </span>
          </div>
          <div className="space-y-2 mb-5">
            {ADDONS.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                selected={addons.has(addon.id)}
                onToggle={() => toggleAddon(addon.id)}
                yearly={yearly}
              />
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm font-semibold text-white/70">Total</span>
            <span className="text-xl font-bold text-white">
              {fmt(totalPrice)}<span className="text-[11px] font-medium text-white/40">{yearly ? '/yr' : '/mo'}</span>
            </span>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Payment method</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { id: 'razorpay', title: 'Pay Online', desc: 'Instant activation' },
              { id: 'cash', title: 'Cash / Bank', desc: 'Manual approval' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPaymentMode(option.id)}
                className="text-left p-3 rounded-2xl transition-all"
                style={{
                  background: paymentMode === option.id ? 'rgba(108,60,244,0.14)' : 'rgba(255,255,255,0.04)',
                  border: paymentMode === option.id ? '1.5px solid rgba(108,60,244,0.50)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="block text-[12px] font-bold text-white">{option.title}</span>
                <span className="block text-[10px] text-white/35 mt-0.5">{option.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)', boxShadow: '0 4px 20px rgba(108,60,244,.45)' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff' }} />
                Processing…
              </>
            ) : (
              <>{paymentMode === 'cash' ? 'Submit for Approval' : 'Pay & Activate'} <ArrowRight size={15} /></>
            )}
          </button>

          <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(255,255,255,.22)' }}>
            {paymentMode === 'cash'
              ? 'Cash and bank payments activate after super-admin approval'
              : 'Secure checkout powered by Razorpay'}
          </p>
        </div>
      </div>
    </div>
  );
}
