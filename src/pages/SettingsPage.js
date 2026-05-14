import { useState, useEffect, useCallback } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Save, Check, Building2, User, Bell, BellRing, MessageSquare,
  Smartphone, ToggleLeft, ToggleRight, Clock, History, RefreshCw, ChevronDown, ChevronUp,
  Sliders, Users, BookOpen
} from 'lucide-react';

const GLASS = {
  background:           'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border:               '1px solid rgba(255,255,255,0.09)',
  borderRadius:         '18px',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const SOFT_GLASS = {
  background:   'rgba(255,255,255,0.045)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
};

const T = {
  primary:   'rgba(255,255,255,0.92)',
  secondary: 'rgba(255,255,255,0.65)',
  muted:     'rgba(255,255,255,0.45)',
  label:     'rgba(255,255,255,0.38)',
};

const INPUT = {
  background:   'rgba(255,255,255,0.06)',
  border:       '1px solid rgba(255,255,255,0.10)',
  color:        'rgba(255,255,255,0.9)',
  borderRadius: '12px',
  outline:      'none',
  padding:      '10px 12px',
  fontSize:     '13px',
  width:        '100%',
  transition:   'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
};

const LABEL = {
  display:       'block',
  fontSize:      10,
  fontWeight:    800,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         T.label,
  marginBottom:  6,
};

const BTN_PRIMARY = {
  background: 'linear-gradient(135deg, #6C3CF4, #8b5cf6)',
  color:      '#fff',
  boxShadow:  '0 10px 24px rgba(108,60,244,0.26)',
};

const BTN_SAVED = {
  background: 'linear-gradient(135deg, #10b981, #34d399)',
  color:      '#07120e',
  boxShadow:  '0 10px 24px rgba(16,185,129,0.18)',
};

const focusInput = e => {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.68)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,60,244,0.16)';
  e.currentTarget.style.background = 'rgba(255,255,255,0.075)';
};

const blurInput = e => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
};

function Field({ label, children }) {
  return (
    <div>
      {label && <label style={LABEL}>{label}</label>}
      {children}
    </div>
  );
}

function DarkInput({ style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{ ...INPUT, ...style }}
      onFocus={focusInput}
      onBlur={blurInput}
    />
  );
}

function DarkSelect({ style = {}, children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        style={{ ...INPUT, appearance: 'none', cursor: 'pointer', paddingRight: 36, ...style }}
        onFocus={focusInput}
        onBlur={blurInput}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: T.muted }}
      />
    </div>
  );
}

function IconBubble({ icon: Icon, tone = 'purple' }) {
  const tones = {
    purple: ['rgba(108,60,244,0.15)', 'rgba(167,139,250,0.30)', '#c4b5fd'],
    blue:   ['rgba(59,130,246,0.13)', 'rgba(96,165,250,0.24)', '#93c5fd'],
    amber:  ['rgba(245,158,11,0.13)', 'rgba(251,191,36,0.24)', '#fbbf24'],
    green:  ['rgba(16,185,129,0.13)', 'rgba(52,211,153,0.24)', '#34d399'],
    slate:  ['rgba(148,163,184,0.10)', 'rgba(148,163,184,0.18)', '#cbd5e1'],
  };
  const [bg, border, color] = tones[tone] || tones.purple;

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <Icon size={18} />
    </div>
  );
}

function CardHeader({ icon, tone, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <IconBubble icon={icon} tone={tone} />
        <div>
          <h3 className="text-sm font-bold" style={{ color: T.primary }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: T.muted }}>{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function SaveButton({ testId, type = 'button', saving, saved, label, savedLabel = 'Saved!', onClick }) {
  return (
    <button
      data-testid={testId}
      type={type}
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={saved ? BTN_SAVED : BTN_PRIMARY}
      onMouseEnter={e => {
        if (!saving) e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {saving ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </>
      ) : saved ? (
        <>
          <Check size={14} />
          {savedLabel}
        </>
      ) : (
        <>
          <Save size={14} />
          {label}
        </>
      )}
    </button>
  );
}

function ToggleSwitch({ enabled }) {
  return (
    <span
      className="relative inline-flex w-11 h-6 rounded-full transition-all shrink-0"
      style={{
        background: enabled ? 'rgba(16,185,129,0.22)' : 'rgba(148,163,184,0.16)',
        border:     enabled ? '1px solid rgba(52,211,153,0.34)' : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full transition-all"
        style={{
          left:       enabled ? '22px' : '4px',
          background: enabled ? '#34d399' : 'rgba(255,255,255,0.72)',
          boxShadow:  enabled ? '0 0 14px rgba(52,211,153,0.36)' : 'none',
        }}
      />
    </span>
  );
}

function Pill({ children, tone = 'purple' }) {
  const tones = {
    purple:  ['rgba(108,60,244,0.14)', 'rgba(167,139,250,0.26)', '#c4b5fd'],
    green:   ['rgba(16,185,129,0.14)', 'rgba(52,211,153,0.26)', '#34d399'],
    blue:    ['rgba(59,130,246,0.14)', 'rgba(96,165,250,0.24)', '#93c5fd'],
    amber:   ['rgba(245,158,11,0.14)', 'rgba(251,191,36,0.24)', '#fbbf24'],
    red:     ['rgba(239,68,68,0.13)', 'rgba(248,113,113,0.24)', '#f87171'],
    slate:   ['rgba(148,163,184,0.11)', 'rgba(148,163,184,0.18)', '#cbd5e1'],
    emerald: ['rgba(5,150,105,0.14)', 'rgba(52,211,153,0.24)', '#6ee7b7'],
  };
  const [bg, border, color] = tones[tone] || tones.purple;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {children}
    </span>
  );
}

function ChannelBadge({ channel }) {
  const tone = channel === 'in_app' ? 'blue' : channel === 'sms' ? 'green' : 'emerald';
  const label = channel === 'in_app' ? 'In-App' : channel === 'sms' ? 'SMS' : 'WhatsApp';
  return <Pill tone={tone}>{label}</Pill>;
}

function ReminderTypeBadge({ type }) {
  const tone =
    type === 'overdue' ? 'red' :
    type === 'due_today' ? 'amber' :
    type === 'upcoming' ? 'blue' :
    'purple';
  const label =
    type === 'overdue' ? 'Overdue' :
    type === 'due_today' ? 'Due Today' :
    type === 'upcoming' ? 'Upcoming' :
    'Manual';
  return <Pill tone={tone}>{label}</Pill>;
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();
  const tone = normalized === 'sent' ? 'green' : normalized === 'failed' ? 'red' : 'slate';
  return <Pill tone={tone}>{status || 'unknown'}</Pill>;
}

function formatTimestamp(value) {
  return value ? String(value).slice(0, 16).replace('T', ' ') : '';
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [instituteForm, setInstituteForm] = useState({ name: '', address: '', phone: '', email: '', website: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingInst, setSavingInst] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedInst, setSavedInst] = useState(false);

  const [reminderSettings, setReminderSettings] = useState(null);
  const [savingReminders, setSavingReminders] = useState(false);
  const [savedReminders, setSavedReminders] = useState(false);
  const [reminderLogs, setReminderLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const [featureFlags, setFeatureFlags] = useState(null);
  const [savingFlags, setSavingFlags] = useState(false);
  const [savedFlags, setSavedFlags] = useState(false);

  const [currentPlan, setCurrentPlan] = useState('standard');
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    API.get('/settings').then(r => {
      setSettings(r.data);
      if (r.data.user) setProfileForm({ name: r.data.user.name || '', email: r.data.user.email || '' });
      if (r.data.institute) setInstituteForm({
        name: r.data.institute.name || '', address: r.data.institute.address || '',
        phone: r.data.institute.phone || '', email: r.data.institute.email || '',
        website: r.data.institute.website || '',
      });
    });
    API.get('/settings/reminders').then(r => setReminderSettings(r.data));
    API.get('/settings/features').then(r => setFeatureFlags({
      multi_teacher_batches_enabled: false,
      multi_subject_batches_enabled: false,
      ...(r.data || {}),
    }));
    API.get('/institute/plan').then(r => setCurrentPlan(r.data.plan));
  }, []);

  const fetchLogs = useCallback(() => {
    API.get('/reminder-logs?limit=20').then(r => {
      setReminderLogs(r.data.logs || []);
      setLogsTotal(r.data.total || 0);
    });
  }, []);

  useEffect(() => { if (showLogs) fetchLogs(); }, [showLogs, fetchLogs]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await API.put('/settings/profile', profileForm);
    setSavingProfile(false);
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
  };

  const saveInstitute = async (e) => {
    e.preventDefault();
    setSavingInst(true);
    await API.put('/settings/institute', instituteForm);
    setSavingInst(false);
    setSavedInst(true);
    setTimeout(() => setSavedInst(false), 2000);
  };

  const saveReminderSettings = async () => {
    if (!reminderSettings) return;
    setSavingReminders(true);
    await API.put('/settings/reminders', {
      enabled: reminderSettings.enabled,
      channels: reminderSettings.channels,
      timing: reminderSettings.timing,
    });
    setSavingReminders(false);
    setSavedReminders(true);
    setTimeout(() => setSavedReminders(false), 2000);
  };

  const toggleChannel = (ch) => {
    if (!reminderSettings) return;
    const channels = reminderSettings.channels || [];
    const newChannels = channels.includes(ch)
      ? channels.filter(c => c !== ch)
      : [...channels, ch];
    if (newChannels.length === 0) return;
    setReminderSettings({ ...reminderSettings, channels: newChannels });
  };

  const runManualCheck = async () => {
    setRunningCheck(true);
    setCheckResult(null);
    try {
      const r = await API.post('/reminders/run-check');
      setCheckResult(r.data);
      if (showLogs) fetchLogs();
    } catch { setCheckResult({ error: true }); }
    setRunningCheck(false);
  };

  const saveFeatureFlags = async () => {
    if (!featureFlags) return;
    setSavingFlags(true);
    await API.put('/settings/features', featureFlags);
    setSavingFlags(false);
    setSavedFlags(true);
    setTimeout(() => setSavedFlags(false), 2000);
  };

  const featureFlagConfig = [
    { key: 'attendance_enabled', label: 'Attendance Module', desc: 'Track student attendance' },
    { key: 'fee_enabled', label: 'Fee Management', desc: 'Fee collection and tracking' },
    { key: 'reminders_enabled', label: 'Fee Reminders', desc: 'Automated fee reminders' },
    { key: 'communication_enabled', label: 'Communication Center', desc: 'Send messages to students' },
    { key: 'multi_teacher_batches_enabled', label: 'Multi-Teacher Batches', desc: 'Assign multiple teachers to one batch', icon: Users },
    { key: 'multi_subject_batches_enabled', label: 'Multi-Subject Batches', desc: 'Add multiple subjects to one batch', icon: BookOpen },
  ];

  const channelConfig = [
    { id: 'in_app', label: 'In-App', icon: Bell, desc: 'System notifications', alwaysAvailable: true },
    { id: 'sms', label: 'SMS', icon: Smartphone, desc: reminderSettings?.twilioStatus?.smsAvailable ? 'Twilio connected' : 'Add TWILIO env vars to enable' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, desc: reminderSettings?.twilioStatus?.whatsappAvailable ? 'Twilio connected' : 'Add TWILIO env vars to enable' },
  ];

  const plans = [
    { id: 'base', label: 'Base', desc: 'Core ERP features', features: ['Student Management', 'Attendance', 'Fee Management', 'Tests and Reports'], tone: 'slate' },
    { id: 'starter', label: 'Starter', desc: 'Live classes included', features: ['Everything in Base', 'Live Classes via Google Meet', 'No Recording'], tone: 'blue' },
    { id: 'standard', label: 'Standard', desc: 'Full feature set', features: ['Everything in Starter', 'Class Recordings', 'Cloud Storage (R2)', 'Recording Pipeline'], tone: 'purple' },
  ];

  const profileRole = settings?.user?.role || user?.role || '';

  return (
    <div data-testid="settings-page" className="relative animate-fade-in">
      <div
        className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-3 pt-4 mb-5"
        style={{
          background:           'rgba(14,12,23,0.88)',
          backdropFilter:       'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom:         '1px solid rgba(255,255,255,0.08)',
          boxShadow:            '0 4px 20px rgba(0,0,0,0.24)',
        }}
      >
        <h1 className="text-[1.2rem] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: T.secondary }}>Manage your profile, institute and reminders</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <section style={GLASS} className="p-5" data-testid="profile-settings">
          <CardHeader
            icon={User}
            tone="purple"
            title="Profile Settings"
            subtitle="Update your personal information"
          />

          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Name">
              <DarkInput
                data-testid="profile-name"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name"
              />
            </Field>

            <Field label="Email">
              <DarkInput
                data-testid="profile-email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                type="email"
                placeholder="you@example.com"
              />
            </Field>

            <div className="flex items-center justify-between gap-3 px-3 py-3" style={SOFT_GLASS}>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: T.label }}>Role</span>
              <Pill tone="purple">{profileRole || 'Admin'}</Pill>
            </div>

            <SaveButton
              testId="save-profile"
              type="submit"
              saving={savingProfile}
              saved={savedProfile}
              label="Save Profile"
            />
          </form>
        </section>

        <section style={GLASS} className="p-5" data-testid="institute-settings">
          <CardHeader
            icon={Building2}
            tone="blue"
            title="Institute Settings"
            subtitle="Update institute details"
          />

          <form onSubmit={saveInstitute} className="space-y-4">
            <Field label="Institute Name">
              <DarkInput
                data-testid="institute-name"
                value={instituteForm.name}
                onChange={e => setInstituteForm({ ...instituteForm, name: e.target.value })}
                placeholder="Institute name"
              />
            </Field>

            <Field label="Address">
              <DarkInput
                data-testid="institute-address"
                value={instituteForm.address}
                onChange={e => setInstituteForm({ ...instituteForm, address: e.target.value })}
                placeholder="Institute address"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Phone">
                <DarkInput
                  value={instituteForm.phone}
                  onChange={e => setInstituteForm({ ...instituteForm, phone: e.target.value })}
                  placeholder="+91..."
                />
              </Field>
              <Field label="Email">
                <DarkInput
                  value={instituteForm.email}
                  onChange={e => setInstituteForm({ ...instituteForm, email: e.target.value })}
                  type="email"
                  placeholder="info@example.com"
                />
              </Field>
            </div>

            <Field label="Website">
              <DarkInput
                value={instituteForm.website}
                onChange={e => setInstituteForm({ ...instituteForm, website: e.target.value })}
                placeholder="https://..."
              />
            </Field>

            <SaveButton
              testId="save-institute"
              type="submit"
              saving={savingInst}
              saved={savedInst}
              label="Save Institute"
            />
          </form>
        </section>
      </div>

      <section style={GLASS} className="p-5 mb-4" data-testid="plan-settings">
        <CardHeader
          icon={Sliders}
          tone="purple"
          title="Institute Plan"
          subtitle="Manage subscription tier"
          right={savingPlan && (
            <span className="inline-flex items-center gap-2 text-xs" style={{ color: T.muted }}>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-violet-400/20 border-t-violet-400 animate-spin" />
              Updating
            </span>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map(plan => {
            const active = currentPlan === plan.id;

            return (
              <button
                key={plan.id}
                data-testid={`plan-${plan.id}`}
                onClick={async () => {
                  setSavingPlan(true);
                  await API.put('/institute/plan', { plan: plan.id });
                  setCurrentPlan(plan.id);
                  setSavingPlan(false);
                }}
                disabled={savingPlan}
                className="p-4 rounded-2xl text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: active ? 'rgba(108,60,244,0.13)' : 'rgba(255,255,255,0.04)',
                  border:     active ? '1px solid rgba(167,139,250,0.42)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow:  active ? '0 14px 34px rgba(108,60,244,0.18), inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-bold" style={{ color: active ? '#c4b5fd' : T.primary }}>{plan.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: T.muted }}>{plan.desc}</p>
                  </div>
                  {active && <Pill tone="purple">Current</Pill>}
                </div>
                <ul className="space-y-2 mt-4">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-xs" style={{ color: T.secondary }}>
                      <Check size={13} style={{ color: active ? '#a78bfa' : T.muted }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {reminderSettings && (
        <section style={GLASS} className="p-5 mb-4" data-testid="reminder-settings">
          <CardHeader
            icon={BellRing}
            tone="amber"
            title="Fee Reminder Settings"
            subtitle="Configure automatic fee reminders"
            right={(
              <button
                data-testid="reminder-toggle"
                onClick={() => setReminderSettings({ ...reminderSettings, enabled: !reminderSettings.enabled })}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all"
                style={{
                  background: reminderSettings.enabled ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.045)',
                  border:     reminderSettings.enabled ? '1px solid rgba(52,211,153,0.26)' : '1px solid rgba(255,255,255,0.08)',
                  color:      reminderSettings.enabled ? '#34d399' : T.muted,
                }}
              >
                <ToggleSwitch enabled={reminderSettings.enabled} />
                {reminderSettings.enabled ? 'Enabled' : 'Disabled'}
              </button>
            )}
          />

          {reminderSettings.enabled && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] mb-2" style={{ color: T.label }}>
                  Notification Channels
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {channelConfig.map(ch => {
                    const active = reminderSettings.channels?.includes(ch.id);
                    const ChannelIcon = ch.icon;

                    return (
                      <button
                        key={ch.id}
                        data-testid={`channel-${ch.id}`}
                        onClick={() => toggleChannel(ch.id)}
                        className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                        style={{
                          background: active ? 'rgba(108,60,244,0.13)' : 'rgba(255,255,255,0.04)',
                          border:     active ? '1px solid rgba(167,139,250,0.38)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow:  active ? '0 10px 28px rgba(108,60,244,0.14)' : 'none',
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: active ? 'rgba(108,60,244,0.16)' : 'rgba(255,255,255,0.045)',
                            border:     active ? '1px solid rgba(167,139,250,0.28)' : '1px solid rgba(255,255,255,0.08)',
                            color:      active ? '#c4b5fd' : T.muted,
                          }}
                        >
                          <ChannelIcon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: active ? '#c4b5fd' : T.primary }}>{ch.label}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>{ch.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] mb-2 flex items-center gap-1.5" style={{ color: T.label }}>
                  <Clock size={13} />
                  Reminder Timing
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4" style={SOFT_GLASS}>
                    <Field label="Days Before Due">
                      <DarkSelect
                        data-testid="timing-days-before"
                        value={reminderSettings.timing?.daysBefore || 1}
                        onChange={e => setReminderSettings({ ...reminderSettings, timing: { ...reminderSettings.timing, daysBefore: parseInt(e.target.value) } })}
                      >
                        {[0, 1, 2, 3, 5, 7].map(d => (
                          <option key={d} value={d} style={{ background: '#171326', color: 'rgba(255,255,255,0.9)' }}>
                            {d === 0 ? 'Disabled' : `${d} day${d > 1 ? 's' : ''}`}
                          </option>
                        ))}
                      </DarkSelect>
                    </Field>
                  </div>

                  <label className="p-4 flex items-center justify-between gap-3 cursor-pointer" style={SOFT_GLASS}>
                    <input
                      data-testid="timing-on-due"
                      type="checkbox"
                      checked={reminderSettings.timing?.onDueDate !== false}
                      onChange={e => setReminderSettings({ ...reminderSettings, timing: { ...reminderSettings.timing, onDueDate: e.target.checked } })}
                      className="sr-only"
                    />
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: T.label }}>Due Date</p>
                      <p className="text-xs font-bold mt-1" style={{ color: T.primary }}>Send on due date</p>
                    </div>
                    <ToggleSwitch enabled={reminderSettings.timing?.onDueDate !== false} />
                  </label>

                  <div className="p-4" style={SOFT_GLASS}>
                    <Field label="Days After Overdue">
                      <DarkSelect
                        data-testid="timing-days-after"
                        value={reminderSettings.timing?.daysAfterOverdue || 3}
                        onChange={e => setReminderSettings({ ...reminderSettings, timing: { ...reminderSettings.timing, daysAfterOverdue: parseInt(e.target.value) } })}
                      >
                        {[1, 2, 3, 5, 7, 14].map(d => (
                          <option key={d} value={d} style={{ background: '#171326', color: 'rgba(255,255,255,0.9)' }}>
                            {d} day{d > 1 ? 's' : ''}
                          </option>
                        ))}
                      </DarkSelect>
                    </Field>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <SaveButton
                  testId="save-reminders"
                  saving={savingReminders}
                  saved={savedReminders}
                  label="Save Settings"
                  onClick={saveReminderSettings}
                />
                <button
                  data-testid="run-reminder-check"
                  onClick={runManualCheck}
                  disabled={runningCheck}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-60"
                  style={{
                    background: 'rgba(245,158,11,0.13)',
                    border:     '1px solid rgba(251,191,36,0.24)',
                    color:      '#fbbf24',
                  }}
                >
                  <RefreshCw size={14} className={runningCheck ? 'animate-spin' : ''} />
                  {runningCheck ? 'Running...' : 'Run Check Now'}
                </button>
                {checkResult && !checkResult.error && (
                  <span className="text-xs font-bold" style={{ color: '#34d399' }}>
                    {checkResult.sent} reminder{checkResult.sent !== 1 ? 's' : ''} sent
                  </span>
                )}
                {checkResult?.error && (
                  <span className="text-xs font-bold" style={{ color: '#f87171' }}>
                    Reminder check failed
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section style={GLASS} className="mb-4 overflow-hidden" data-testid="reminder-logs-section">
        <button
          data-testid="toggle-reminder-logs"
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 transition-all hover:bg-white/[0.035]"
        >
          <div className="flex items-center gap-3">
            <IconBubble icon={History} tone="slate" />
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: T.primary }}>Reminder History</p>
              <p className="text-xs mt-0.5" style={{ color: T.muted }}>Recently sent fee reminders</p>
            </div>
            {logsTotal > 0 && <Pill tone="purple">{logsTotal}</Pill>}
          </div>
          {showLogs ? <ChevronUp size={18} style={{ color: T.muted }} /> : <ChevronDown size={18} style={{ color: T.muted }} />}
        </button>

        {showLogs && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {reminderLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px]" data-testid="reminder-logs-table">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.035)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Student', 'Channel', 'Type', 'Amount', 'Due Date', 'Status', 'Sent At'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ color: T.label }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reminderLogs.map(log => (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-violet-500/[0.055]"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
                      >
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: T.primary }}>{log.studentName}</td>
                        <td className="px-4 py-3"><ChannelBadge channel={log.channel} /></td>
                        <td className="px-4 py-3"><ReminderTypeBadge type={log.reminderType} /></td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.secondary }}>Rs.{log.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.secondary }}>{log.dueDate}</td>
                        <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                        <td className="px-4 py-3 text-[11px]" style={{ color: T.muted }}>{formatTimestamp(log.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(167,139,250,0.24)', color: '#c4b5fd' }}
                >
                  <History size={20} />
                </div>
                <p className="text-sm font-bold" style={{ color: T.primary }}>No reminder logs yet</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Run a reminder check to see delivery history here.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {featureFlags && (
        <section style={GLASS} className="p-5" data-testid="feature-flags-section">
          <CardHeader
            icon={Sliders}
            tone="green"
            title="Feature Toggles"
            subtitle="Enable or disable modules"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {featureFlagConfig.map(flag => {
              const enabled = Boolean(featureFlags[flag.key]);

              return (
                <button
                  key={flag.key}
                  data-testid={`flag-${flag.key}`}
                  onClick={() => setFeatureFlags({ ...featureFlags, [flag.key]: !featureFlags[flag.key] })}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: enabled ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.04)',
                    border:     enabled ? '1px solid rgba(52,211,153,0.28)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow:  enabled ? '0 10px 28px rgba(16,185,129,0.11)' : 'none',
                  }}
                >
                  <div>
                    <p className="text-xs font-bold" style={{ color: enabled ? '#34d399' : T.primary }}>{flag.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>{flag.desc}</p>
                  </div>
                  {enabled
                    ? <ToggleRight size={28} className="shrink-0" style={{ color: '#34d399' }} />
                    : <ToggleLeft size={28} className="shrink-0" style={{ color: T.muted }} />}
                </button>
              );
            })}
          </div>

          <SaveButton
            testId="save-features"
            saving={savingFlags}
            saved={savedFlags}
            label="Save Features"
            onClick={saveFeatureFlags}
          />
        </section>
      )}
    </div>
  );
}
