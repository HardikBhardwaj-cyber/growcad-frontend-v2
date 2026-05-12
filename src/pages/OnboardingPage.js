/**
 * src/pages/OnboardingPage.js
 * Step 3 of 4 — Institute name, slug, address, strength.
 *
 * WHAT CHANGED vs uploaded version:
 *   1. Calls createInstitute() from AuthContext instead of calling API directly.
 *      AuthContext.createInstitute() stores the returned token + user so the
 *      next step (PlanSelectionPage) has a valid session automatically.
 *   2. Navigation state to /pricing now passes institute_id (snake_case) to
 *      match the backend SelectPlanReq model AND the key PlanSelectionPage reads.
 *   3. isMainDomain guard moved inside the useEffect so the component renders
 *      before redirecting (avoids a React render-order warning).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, X, Loader2, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepBar } from './SignupPage';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/api';

// ─── Strength options ─────────────────────────────────────────────────────────
const STRENGTHS = [
  { value: '0-150',    label: '0 – 150 students'               },
  { value: '150-250',  label: '150 – 250 students'             },
  { value: '250-500',  label: '250 – 500 students'             },
  { value: '500-750',  label: '500 – 750 students'             },
  { value: '750-1000', label: '750 – 1000 students'            },
  { value: '1000+',    label: '1000+ students (Contact Sales)' },
];

// ─── Slug generator ───────────────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

const INPUT_STYLE = {
  background:  'rgba(255,255,255,0.07)',
  borderColor: 'rgba(255,255,255,0.12)',
  color:       'rgba(255,255,255,0.92)',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate              = useNavigate();
  const { state }             = useLocation();
  const { isMainDomain, createInstitute } = useAuth();
  const { mobile, email }     = state || {};

  const [form, setForm] = useState({
    instituteName: '', instituteSlug: '', instituteAddress: '', totalStrength: '0-150',
  });
  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken | error
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const slugTimer = useRef(null);

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mobile || !email) { navigate('/signup',  { replace: true }); return; }
    if (!isMainDomain)     { navigate('/login',   { replace: true }); return; }
  }, [mobile, email, isMainDomain, navigate]);

  // ── Slug check ────────────────────────────────────────────────────────────
  const triggerSlugCheck = useCallback((slug) => {
    clearTimeout(slugTimer.current);
    if (!slug || slug.length < 3) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    slugTimer.current = setTimeout(async () => {
      try {
        const { data } = await API.get(`/institute/check-slug?slug=${encodeURIComponent(slug)}`);
        setSlugStatus(data.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('error');
      }
    }, 500);
  }, []);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = toSlug(name);
    setForm((p) => ({ ...p, instituteName: name, instituteSlug: slug }));
    triggerSlugCheck(slug);
  };

  const handleSlugChange = (e) => {
    const slug = toSlug(e.target.value);
    setForm((p) => ({ ...p, instituteSlug: slug }));
    triggerSlugCheck(slug);
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (slugStatus !== 'available') {
      setError('Please choose a unique, available slug.');
      return;
    }
    if (form.totalStrength === '1000+') {
      window.open('https://wa.me/917488616782?text=I%20need%20an%20enterprise%20plan%20for%20Growcad', '_blank');
      return;
    }

    setLoading(true);
    try {
      // createInstitute() stores the returned token + user in AuthContext
      const data = await createInstitute({
        mobile,
        email,
        institute_name:    form.instituteName.trim(),
        institute_slug:    form.instituteSlug,
        institute_address: form.instituteAddress.trim(),
        total_strength:    form.totalStrength,
      });

      // Navigate to pricing — pass what PlanSelectionPage needs
      navigate('/pricing', {
        state: {
          institute_id:  data.institute.id,      // ← snake_case to match backend SelectPlanReq
          instituteSlug: data.institute.slug,
          totalStrength: form.totalStrength,
          adminName:     data.user?.name  ?? '',   // for Razorpay prefill
          adminEmail:    data.user?.email ?? '',   // for Razorpay prefill
        },
      });

          // No need to pass token — AuthContext already stored it

    } catch (err) {
      setError(err.message || 'Failed to create institute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Slug indicator ────────────────────────────────────────────────────────
  const SlugIndicator = () => {
    if (slugStatus === 'checking')  return <Loader2 size={13} className="animate-spin text-white/40" />;
    if (slugStatus === 'available') return <Check   size={13} className="text-emerald-400" />;
    if (slugStatus === 'taken')     return <X       size={13} className="text-red-400" />;
    return null;
  };

  const slugMsg = {
    available: 'This slug is available',
    taken:     'Already taken — choose another',
    error:     'Could not check availability',
  }[slugStatus] ?? '';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans',sans-serif",
        background: 'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)',
      }}
    >
      <div className="fixed pointer-events-none" style={{ top: '-8%', left: '-5%', width: 520, height: 520, background: 'radial-gradient(circle,rgba(108,60,244,.18) 0%,transparent 65%)', filter: 'blur(50px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-12%', right: '-6%', width: 480, height: 480, background: 'radial-gradient(circle,rgba(168,85,247,.14) 0%,transparent 65%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-[430px]">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6C3CF4,#a855f7)', boxShadow: '0 6px 22px rgba(108,60,244,0.55)' }}>
            <span className="text-white font-bold text-[16px]">G</span>
          </div>
          <span className="text-[19px] font-bold text-white tracking-tight">Growcad</span>
        </div>

        <StepBar current={2} />

        <div style={{
          background: 'rgba(255,255,255,0.075)', backdropFilter: 'blur(26px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '30px',
          boxShadow: '0 4px 30px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.08) inset',
        }}>
          <div className="flex items-center gap-2.5 mb-1">
            <Building2 size={18} className="text-violet-400" />
            <h2 className="text-[1.45rem] font-bold text-white tracking-tight">Set up your institute</h2>
          </div>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,.40)' }}>
            Tell us about your coaching institute
          </p>

          {error && (
            <div className="mb-5 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)', color: '#fca5a5' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Institute name */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.38)' }}>
                Institute Name
              </Label>
              <Input value={form.instituteName} onChange={handleNameChange}
                placeholder="Sharma Academy" required className="h-10" style={INPUT_STYLE} />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.38)' }}>
                Institute URL
              </Label>
              <div className="relative">
                <Input value={form.instituteSlug} onChange={handleSlugChange}
                  placeholder="sharma-academy" required minLength={3} className="h-10 pr-24"
                  style={{
                    ...INPUT_STYLE,
                    borderColor: slugStatus === 'available' ? 'rgba(52,211,153,0.55)'
                               : slugStatus === 'taken'     ? 'rgba(239,68,68,0.55)'
                               : 'rgba(255,255,255,0.12)',
                  }} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <SlugIndicator />
                  <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,.30)' }}>
                    .growcad.in
                  </span>
                </div>
              </div>
              {slugMsg && (
                <p className="text-[10px] mt-0.5"
                  style={{ color: slugStatus === 'available' ? '#34d399' : '#f87171' }}>
                  {slugMsg}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.38)' }}>
                Institute Address
              </Label>
              <Input value={form.instituteAddress} onChange={set('instituteAddress')}
                placeholder="123 MG Road, Patna, Bihar" className="h-10" style={INPUT_STYLE} />
            </div>

            {/* Strength */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.38)' }}>
                Total Student Strength
              </Label>
              <select
                value={form.totalStrength}
                onChange={(e) => setForm((p) => ({ ...p, totalStrength: e.target.value }))}
                className="w-full h-10 rounded-[10px] px-3 text-sm outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)', appearance: 'none' }}
              >
                {STRENGTHS.map((s) => (
                  <option key={s.value} value={s.value} style={{ background: '#1a1625', color: '#fff' }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || (slugStatus !== 'available' && form.totalStrength !== '1000+')}
              className="w-full mt-1 py-3 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)', boxShadow: '0 4px 20px rgba(108,60,244,.42)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff' }} />
                  Creating Institute…
                </>
              ) : form.totalStrength === '1000+' ? (
                'Contact Sales →'
              ) : (
                'Continue to Pricing →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
