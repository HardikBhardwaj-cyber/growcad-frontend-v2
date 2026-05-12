/**
 * src/pages/PaymentSuccessPage.js
 *
 * Shown immediately after a successful Razorpay payment.
 * Auto-redirects to slug.growcad.in/dashboard after 3 seconds.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { state } = useLocation();
  const { instituteSlug, plan, billing } = state || {};

  // Auto-redirect after 3 s
  useEffect(() => {
    if (!instituteSlug) return;
    const t = setTimeout(() => {
      window.location.href = `https://${instituteSlug}.growcad.in/dashboard`;
    }, 3000);
    return () => clearTimeout(t);
  }, [instituteSlug]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}
    >
      <div className="text-center max-w-sm">
        {/* Animated checkmark */}
        <div className="relative w-24 h-24 mx-auto mb-7">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#10b981,#34d399)', boxShadow:'0 0 50px rgba(16,185,129,0.45)' }}
          >
            <CheckCircle size={42} className="text-white" />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border:'1.5px solid rgba(52,211,153,0.35)',
                animationDelay:`${i * 0.5}s`,
                animationDuration:'2.5s',
              }}
            />
          ))}
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-sm text-white/45 mb-1">
          {plan && billing
            ? `${plan} plan (${billing}) is now active.`
            : 'Your plan is now active.'}
        </p>
        <p className="text-xs text-white/28 mb-8">
          Redirecting to your dashboard in 3 seconds…
        </p>

        {/* Detail pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {[
            { label: '✓ Payment verified' },
            { label: '✓ Institute activated' },
            { label: '✓ Subdomain ready' },
          ].map(({ label }) => (
            <span
              key={label}
              className="text-[10px] font-semibold px-3 py-1 rounded-full"
              style={{ background:'rgba(52,211,153,0.10)', color:'#34d399', border:'1px solid rgba(52,211,153,0.25)' }}
            >
              {label}
            </span>
          ))}
        </div>

        {instituteSlug && (
          <a
            href={`https://${instituteSlug}.growcad.in/dashboard`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold text-white transition-all"
            style={{ background:'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow:'0 4px 20px rgba(108,60,244,.45)' }}
          >
            Go to Dashboard <ArrowRight size={15} />
          </a>
        )}
      </div>
    </div>
  );
}
