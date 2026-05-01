import { useState, useEffect, useCallback } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Save, Check, Building2, User, Bell, BellRing, MessageSquare,
  Smartphone, ToggleLeft, ToggleRight, Clock, History, RefreshCw, ChevronDown, ChevronUp,
  Sliders
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [instituteForm, setInstituteForm] = useState({ name: '', address: '', phone: '', email: '', website: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingInst, setSavingInst] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedInst, setSavedInst] = useState(false);

  // Reminder state
  const [reminderSettings, setReminderSettings] = useState(null);
  const [savingReminders, setSavingReminders] = useState(false);
  const [savedReminders, setSavedReminders] = useState(false);
  const [reminderLogs, setReminderLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  // Feature flags state
  const [featureFlags, setFeatureFlags] = useState(null);
  const [savingFlags, setSavingFlags] = useState(false);
  const [savedFlags, setSavedFlags] = useState(false);

  // Plan state
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
    API.get('/settings/features').then(r => setFeatureFlags(r.data));
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
    if (newChannels.length === 0) return; // Must have at least one
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
    { key: 'fee_enabled', label: 'Fee Management', desc: 'Fee collection & tracking' },
    { key: 'reminders_enabled', label: 'Fee Reminders', desc: 'Automated fee reminders' },
    { key: 'communication_enabled', label: 'Communication Center', desc: 'Send messages to students' },
  ];

  const channelConfig = [
    { id: 'in_app', label: 'In-App', icon: Bell, desc: 'System notifications', alwaysAvailable: true },
    { id: 'sms', label: 'SMS', icon: Smartphone, desc: reminderSettings?.twilioStatus?.smsAvailable ? 'Twilio connected' : 'Add TWILIO env vars to enable' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, desc: reminderSettings?.twilioStatus?.whatsappAvailable ? 'Twilio connected' : 'Add TWILIO env vars to enable' },
  ];

  return (
    <div data-testid="settings-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your profile, institute and reminders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="profile-settings">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center"><User size={16} className="text-[#6C3CF4]" /></div>
            <div><h3 className="text-sm font-semibold text-[#1a1625]">Profile Settings</h3><p className="text-[10px] text-gray-400">Update your personal information</p></div>
          </div>
          <form onSubmit={saveProfile} className="space-y-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input data-testid="profile-name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input data-testid="profile-email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" /></div>
            <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-400"><span className="font-medium text-gray-500">Role:</span> <span className="capitalize">{user?.role}</span></div>
            <button data-testid="save-profile" type="submit" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${savedProfile ? 'bg-green-500 text-white' : 'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'}`}>
              {savingProfile ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : savedProfile ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Profile</>}
            </button>
          </form>
        </div>

        {/* Institute Settings */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="institute-settings">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 size={16} className="text-blue-600" /></div>
            <div><h3 className="text-sm font-semibold text-[#1a1625]">Institute Settings</h3><p className="text-[10px] text-gray-400">Update institute details</p></div>
          </div>
          <form onSubmit={saveInstitute} className="space-y-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Institute Name</label>
              <input data-testid="institute-name" value={instituteForm.name} onChange={e => setInstituteForm({...instituteForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
              <input data-testid="institute-address" value={instituteForm.address} onChange={e => setInstituteForm({...instituteForm, address: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input value={instituteForm.phone} onChange={e => setInstituteForm({...instituteForm, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input value={instituteForm.email} onChange={e => setInstituteForm({...instituteForm, email: e.target.value})} type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" /></div>
            </div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
              <input value={instituteForm.website} onChange={e => setInstituteForm({...instituteForm, website: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" /></div>
            <button data-testid="save-institute" type="submit" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${savedInst ? 'bg-green-500 text-white' : 'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'}`}>
              {savingInst ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : savedInst ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Institute</>}
            </button>
          </form>
        </div>
      </div>

      {/* Reminder Settings */}
      {/* Institute Plan */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-4" data-testid="plan-settings">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center"><Sliders size={16} className="text-indigo-600" /></div>
          <div><h3 className="text-sm font-semibold text-[#1a1625]">Institute Plan</h3><p className="text-[10px] text-gray-400">Manage subscription tier</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: 'base', label: 'Base', desc: 'Core ERP features', features: ['Student Management', 'Attendance', 'Fee Management', 'Tests & Reports'] },
            { id: 'starter', label: 'Starter', desc: 'Live classes included', features: ['Everything in Base', 'Live Classes via Google Meet', 'No Recording'] },
            { id: 'standard', label: 'Standard', desc: 'Full feature set', features: ['Everything in Starter', 'Class Recordings', 'Cloud Storage (R2)', 'Recording Pipeline'] },
          ].map(p => (
            <button key={p.id} data-testid={`plan-${p.id}`} onClick={async () => {
              setSavingPlan(true);
              await API.put('/institute/plan', { plan: p.id });
              setCurrentPlan(p.id);
              setSavingPlan(false);
            }} disabled={savingPlan}
              className={`p-3 rounded-lg border-2 text-left transition-all ${currentPlan === p.id ? 'border-[#6C3CF4] bg-[#6C3CF4]/5' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-xs font-bold ${currentPlan === p.id ? 'text-[#6C3CF4]' : 'text-gray-500'}`}>{p.label}</p>
                {currentPlan === p.id && <span className="text-[9px] px-1.5 py-0.5 bg-[#6C3CF4] text-white rounded-full font-bold">CURRENT</span>}
              </div>
              <p className="text-[10px] text-gray-400 mb-2">{p.desc}</p>
              <ul className="space-y-0.5">
                {p.features.map(f => <li key={f} className="text-[10px] text-gray-400">- {f}</li>)}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Reminder Settings */}
      {reminderSettings && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-4" data-testid="reminder-settings">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><BellRing size={16} className="text-amber-600" /></div>
              <div><h3 className="text-sm font-semibold text-[#1a1625]">Fee Reminder Settings</h3><p className="text-[10px] text-gray-400">Configure automatic fee reminders</p></div>
            </div>
            <button data-testid="reminder-toggle" onClick={() => setReminderSettings({...reminderSettings, enabled: !reminderSettings.enabled})}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors">
              {reminderSettings.enabled
                ? <><ToggleRight size={28} className="text-green-500" /><span className="text-green-600">Enabled</span></>
                : <><ToggleLeft size={28} className="text-gray-300" /><span className="text-gray-400">Disabled</span></>}
            </button>
          </div>

          {reminderSettings.enabled && (
            <div className="space-y-4">
              {/* Channels */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Notification Channels</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {channelConfig.map(ch => {
                    const active = reminderSettings.channels?.includes(ch.id);
                    return (
                      <button key={ch.id} data-testid={`channel-${ch.id}`} onClick={() => toggleChannel(ch.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-lg border-2 transition-all text-left ${active ? 'border-[#6C3CF4] bg-[#6C3CF4]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <ch.icon size={16} className={active ? 'text-[#6C3CF4]' : 'text-gray-300'} />
                        <div>
                          <p className={`text-xs font-semibold ${active ? 'text-[#6C3CF4]' : 'text-gray-400'}`}>{ch.label}</p>
                          <p className="text-[10px] text-gray-400">{ch.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Clock size={12} /> Reminder Timing</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-[10px] text-gray-400 font-medium block mb-1">Days Before Due</label>
                    <select data-testid="timing-days-before" value={reminderSettings.timing?.daysBefore || 1}
                      onChange={e => setReminderSettings({...reminderSettings, timing: {...reminderSettings.timing, daysBefore: parseInt(e.target.value)}})}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-[#6C3CF4]/20">
                      {[0, 1, 2, 3, 5, 7].map(d => <option key={d} value={d}>{d === 0 ? 'Disabled' : `${d} day${d > 1 ? 's' : ''}`}</option>)}
                    </select>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                    <input data-testid="timing-on-due" type="checkbox" checked={reminderSettings.timing?.onDueDate !== false}
                      onChange={e => setReminderSettings({...reminderSettings, timing: {...reminderSettings.timing, onDueDate: e.target.checked}})}
                      className="rounded border-gray-300 text-[#6C3CF4] focus:ring-[#6C3CF4]" />
                    <label className="text-xs text-gray-600 font-medium">Send on due date</label>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-[10px] text-gray-400 font-medium block mb-1">Days After (Overdue)</label>
                    <select data-testid="timing-days-after" value={reminderSettings.timing?.daysAfterOverdue || 3}
                      onChange={e => setReminderSettings({...reminderSettings, timing: {...reminderSettings.timing, daysAfterOverdue: parseInt(e.target.value)}})}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-[#6C3CF4]/20">
                      {[1, 2, 3, 5, 7, 14].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button data-testid="save-reminders" onClick={saveReminderSettings}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${savedReminders ? 'bg-green-500 text-white' : 'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'}`}>
                  {savingReminders ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : savedReminders ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
                </button>
                <button data-testid="run-reminder-check" onClick={runManualCheck} disabled={runningCheck}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50">
                  <RefreshCw size={13} className={runningCheck ? 'animate-spin' : ''} /> {runningCheck ? 'Running...' : 'Run Check Now'}
                </button>
                {checkResult && !checkResult.error && (
                  <span className="text-xs text-green-600 font-medium">{checkResult.sent} reminder{checkResult.sent !== 1 ? 's' : ''} sent</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reminder Logs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" data-testid="reminder-logs-section">
        <button data-testid="toggle-reminder-logs" onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <History size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-[#1a1625]">Reminder History</span>
            {logsTotal > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{logsTotal}</span>}
          </div>
          {showLogs ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showLogs && (
          <div className="border-t border-gray-100">
            {reminderLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="reminder-logs-table">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Channel</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Type</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Amount</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Due Date</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reminderLogs.map(log => (
                      <tr key={log.id} className="border-b border-gray-50">
                        <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{log.studentName}</td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            log.channel === 'in_app' ? 'bg-blue-50 text-blue-600' :
                            log.channel === 'sms' ? 'bg-green-50 text-green-600' :
                            'bg-emerald-50 text-emerald-600'}`}>
                            {log.channel === 'in_app' ? 'In-App' : log.channel === 'sms' ? 'SMS' : 'WhatsApp'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            log.reminderType === 'overdue' ? 'bg-red-50 text-red-500' :
                            log.reminderType === 'due_today' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-500'}`}>
                            {log.reminderType === 'overdue' ? 'Overdue' : log.reminderType === 'due_today' ? 'Due Today' : log.reminderType === 'upcoming' ? 'Upcoming' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600">Rs.{log.amount?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{log.dueDate}</td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            log.status === 'sent' ? 'bg-green-50 text-green-600' :
                            log.status === 'failed' ? 'bg-red-50 text-red-500' :
                            'bg-gray-100 text-gray-400'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[10px] text-gray-400">{log.timestamp?.slice(0, 16).replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-xs text-gray-400">No reminder logs yet</div>
            )}
          </div>
        )}
      </div>

      {/* Feature Flags */}
      {featureFlags && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mt-4" data-testid="feature-flags-section">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><Sliders size={16} className="text-[#6C3CF4]" /></div>
            <div><h3 className="text-sm font-semibold text-[#1a1625]">Feature Toggles</h3><p className="text-[10px] text-gray-400">Enable or disable modules</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {featureFlagConfig.map(ff => (
              <button key={ff.key} data-testid={`flag-${ff.key}`}
                onClick={() => setFeatureFlags({ ...featureFlags, [ff.key]: !featureFlags[ff.key] })}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${featureFlags[ff.key] ? 'border-green-200 bg-green-50/50' : 'border-gray-100 bg-gray-50/30'}`}>
                <div>
                  <p className={`text-xs font-semibold ${featureFlags[ff.key] ? 'text-green-700' : 'text-gray-400'}`}>{ff.label}</p>
                  <p className="text-[10px] text-gray-400">{ff.desc}</p>
                </div>
                {featureFlags[ff.key]
                  ? <ToggleRight size={24} className="text-green-500 shrink-0" />
                  : <ToggleLeft size={24} className="text-gray-300 shrink-0" />}
              </button>
            ))}
          </div>
          <button data-testid="save-features" onClick={saveFeatureFlags}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${savedFlags ? 'bg-green-500 text-white' : 'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'}`}>
            {savingFlags ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : savedFlags ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Features</>}
          </button>
        </div>
      )}
    </div>
  );
}
