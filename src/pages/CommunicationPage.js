import { useState, useEffect } from 'react';
import API from '@/api';
import { Send, MessageSquare, History, Users, User, ChevronDown, ChevronUp } from 'lucide-react';

const GLASS = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '18px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const INPUT = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'rgba(255,255,255,0.88)',
  borderRadius: '12px',
  outline: 'none',
  width: '100%',
  padding: '11px 13px',
  fontSize: '13px',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
};

const LABEL = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.38)',
  marginBottom: 7,
};

const btnPrimary = {
  background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
  boxShadow: '0 3px 14px rgba(108,60,244,0.42)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
};

const focusInput = e => {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,60,244,0.14)';
  e.currentTarget.style.background = 'rgba(255,255,255,0.075)';
};

const blurInput = e => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
};

function channelLabel(channel) {
  if (channel === 'in_app') return 'In-App';
  if (channel === 'email') return 'Email';
  if (channel === 'sms') return 'SMS';
  if (channel === 'whatsapp') return 'WhatsApp';
  return channel || 'Unknown';
}

function channelStyle(channel) {
  if (channel === 'email') {
    return {
      background: 'rgba(59,130,246,0.13)',
      color: '#93c5fd',
      border: '1px solid rgba(96,165,250,0.24)',
    };
  }
  if (channel === 'sms') {
    return {
      background: 'rgba(16,185,129,0.12)',
      color: '#34d399',
      border: '1px solid rgba(16,185,129,0.24)',
    };
  }
  if (channel === 'whatsapp') {
    return {
      background: 'rgba(5,150,105,0.14)',
      color: '#6ee7b7',
      border: '1px solid rgba(5,150,105,0.26)',
    };
  }
  return {
    background: 'rgba(108,60,244,0.14)',
    color: '#c4b5fd',
    border: '1px solid rgba(108,60,244,0.26)',
  };
}

function statusStyle(status) {
  if (status === 'sent') {
    return {
      background: 'rgba(16,185,129,0.12)',
      color: '#34d399',
      border: '1px solid rgba(16,185,129,0.24)',
    };
  }
  if (status === 'failed') {
    return {
      background: 'rgba(239,68,68,0.12)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.24)',
    };
  }
  return {
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.58)',
    border: '1px solid rgba(255,255,255,0.12)',
  };
}

function targetButtonStyle(active) {
  return {
    background: active
      ? 'linear-gradient(135deg, rgba(108,60,244,0.22), rgba(139,92,246,0.12))'
      : 'rgba(255,255,255,0.045)',
    border: active ? '1px solid rgba(167,139,250,0.70)' : '1px solid rgba(255,255,255,0.09)',
    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.55)',
    boxShadow: active ? '0 0 0 3px rgba(108,60,244,0.10), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
    transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
  };
}

export default function CommunicationPage() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [targetType, setTargetType] = useState('student');
  const [targetId, setTargetId] = useState('');
  const [channel, setChannel] = useState('in_app');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data));
    API.get('/students').then(r => setStudents(r.data));
  }, []);

  const fetchHistory = () => {
    API.get('/messages/history?limit=20').then(r => { setHistory(r.data.logs || []); setHistoryTotal(r.data.total || 0); });
  };

  useEffect(() => { if (showHistory) fetchHistory(); }, [showHistory]);

  const handleSend = async () => {
    if (!message.trim() || !targetId) return;
    setSending(true); setResult(null);
    try {
      const res = await API.post('/messages/send', { targetType, targetId, message: message.trim(), channel });
      setResult(res.data);
      setMessage('');
      if (showHistory) fetchHistory();
    } catch (err) {
      setResult({ error: err.response?.data?.detail || 'Send failed' });
    }
    setSending(false);
  };

  const filteredStudents = targetType === 'student' ? students : [];

  return (
    <div data-testid="communication-page" className="relative animate-fade-in">
      <div
        className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-3 pt-4"
        style={{
          background: 'rgba(14,12,23,0.88)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
        }}
      >
        <div>
          <h1 className="text-[1.2rem] font-bold tracking-tight leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Communication Center
          </h1>
          <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Send messages to students and batches
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div style={{ ...GLASS, padding: '22px' }} data-testid="send-message-form">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(108,60,244,0.15)',
                border: '1px solid rgba(108,60,244,0.28)',
              }}
            >
              <MessageSquare size={18} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>
                Send Message
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Choose a recipient, channel, and message body
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr_1.2fr] gap-3.5 mb-4">
            <div>
              <label style={LABEL}>Send To</label>
              <div
                className="grid grid-cols-2 gap-1.5 rounded-[14px] p-1"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <button
                  data-testid="target-student"
                  onClick={() => { setTargetType('student'); setTargetId(''); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-[11px] text-xs font-bold"
                  style={targetButtonStyle(targetType === 'student')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                  <User size={13} />
                  Student
                </button>
                <button
                  data-testid="target-batch"
                  onClick={() => { setTargetType('batch'); setTargetId(''); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-[11px] text-xs font-bold"
                  style={targetButtonStyle(targetType === 'batch')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                  <Users size={13} />
                  Batch
                </button>
              </div>
            </div>

            <div>
              <label style={LABEL}>
                {targetType === 'student' ? 'Select Student' : 'Select Batch'}
              </label>
              <div className="relative">
                <select
                  data-testid="target-select"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  style={{ ...INPUT, appearance: 'none', cursor: 'pointer', paddingRight: 34 }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                >
                  <option value="" style={{ background: '#1a1625' }}>Choose...</option>
                  {targetType === 'student'
                    ? filteredStudents.map(s => <option key={s.id} value={s.id} style={{ background: '#1a1625' }}>{s.name}</option>)
                    : batches.map(b => <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName} ({b.studentCount || 0} students)</option>)
                  }
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                />
              </div>
            </div>

            <div>
              <label style={LABEL}>Channel</label>
              <div className="relative">
                <select
                  data-testid="channel-select"
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  style={{ ...INPUT, appearance: 'none', cursor: 'pointer', paddingRight: 34 }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                >
                  <option value="in_app" style={{ background: '#1a1625' }}>In-App Notification</option>
                  <option value="email" style={{ background: '#1a1625' }}>Email</option>
                  <option value="whatsapp" style={{ background: '#1a1625' }}>WhatsApp</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label style={LABEL}>Message</label>
            <textarea
              data-testid="message-input"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your message here..."
              style={{ ...INPUT, resize: 'none', lineHeight: 1.6, minHeight: 112 }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              data-testid="send-message-btn"
              onClick={handleSend}
              disabled={sending || !message.trim() || !targetId}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[11px] text-xs font-bold text-white shrink-0"
              style={{
                ...btnPrimary,
                opacity: (sending || !message.trim() || !targetId) ? 0.52 : 1,
                cursor: (sending || !message.trim() || !targetId) ? 'not-allowed' : 'pointer',
                boxShadow: (sending || !message.trim() || !targetId) ? 'none' : btnPrimary.boxShadow,
              }}
              onMouseEnter={e => {
                if (!sending && message.trim() && targetId) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(108,60,244,0.55)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = (!sending && message.trim() && targetId) ? btnPrimary.boxShadow : 'none';
              }}
            >
              {sending ? (
                <>
                  <span
                    className="w-3.5 h-3.5 rounded-full animate-spin"
                    style={{ border: '2px solid rgba(255,255,255,0.28)', borderTopColor: '#fff' }}
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send Message
                </>
              )}
            </button>

            {result && !result.error && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.24)',
                }}
                data-testid="send-result"
              >
                Sent to {result.sent} recipient{result.sent !== 1 ? 's' : ''}{result.skipped > 0 ? `, ${result.skipped} skipped` : ''}
              </span>
            )}
            {result?.error && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.24)',
                }}
                data-testid="send-result"
              >
                {result.error}
              </span>
            )}
          </div>
        </div>

        <div style={{ ...GLASS, overflow: 'hidden' }} data-testid="message-history-section">
          <button
            data-testid="toggle-message-history"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-5 py-4 transition-colors"
            style={{ color: 'rgba(255,255,255,0.92)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-[11px] flex items-center justify-center"
                style={{
                  background: 'rgba(108,60,244,0.13)',
                  border: '1px solid rgba(108,60,244,0.25)',
                }}
              >
                <History size={15} style={{ color: '#a78bfa' }} />
              </div>
              <span className="text-sm font-bold">Message History</span>
              {historyTotal > 0 && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: 'rgba(108,60,244,0.16)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(108,60,244,0.24)',
                  }}
                >
                  {historyTotal}
                </span>
              )}
            </div>
            {showHistory ? (
              <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.45)' }} />
            ) : (
              <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.45)' }} />
            )}
          </button>

          {showHistory && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]" data-testid="message-history-table">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.035)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em]" style={{ color: 'rgba(255,255,255,0.38)' }}>Student</th>
                        <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em]" style={{ color: 'rgba(255,255,255,0.38)' }}>Channel</th>
                        <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em]" style={{ color: 'rgba(255,255,255,0.38)' }}>Message</th>
                        <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em]" style={{ color: 'rgba(255,255,255,0.38)' }}>Status</th>
                        <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em]" style={{ color: 'rgba(255,255,255,0.38)' }}>Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(log => (
                        <tr
                          key={log.id}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.055)', transition: 'background 0.15s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.075)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td className="px-5 py-3 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.86)' }}>{log.studentName}</td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={channelStyle(log.channel)}>
                              {channelLabel(log.channel)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs max-w-xs truncate" style={{ color: 'rgba(255,255,255,0.58)' }}>{log.message}</td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={statusStyle(log.status)}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.42)' }}>{log.timestamp?.slice(0, 16).replace('T', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <div
                    className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.24)' }}
                  >
                    <MessageSquare size={24} style={{ color: '#a78bfa' }} />
                  </div>
                  <p className="text-[13px] font-semibold mt-3" style={{ color: 'rgba(255,255,255,0.62)' }}>
                    No messages sent yet
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.36)' }}>
                    Sent messages will appear here with delivery status.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
