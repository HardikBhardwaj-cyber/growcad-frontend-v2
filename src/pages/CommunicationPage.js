import { useState, useEffect } from 'react';
import API from '@/api';
import { Send, MessageSquare, History, Users, User, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div data-testid="communication-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">Communication Center</h1>
        <p className="text-xs text-gray-400 mt-0.5">Send messages to students and batches</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-4" data-testid="send-message-form">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-[#6C3CF4]" />
          <h3 className="text-sm font-semibold text-[#1a1625]">Send Message</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Target Type */}
          <div>
            <label className="block text-[10px] text-gray-400 font-medium mb-1">Send To</label>
            <div className="flex gap-1.5">
              <button data-testid="target-student" onClick={() => { setTargetType('student'); setTargetId(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${targetType === 'student' ? 'border-[#6C3CF4] bg-[#6C3CF4]/5 text-[#6C3CF4]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                <User size={13} /> Student
              </button>
              <button data-testid="target-batch" onClick={() => { setTargetType('batch'); setTargetId(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${targetType === 'batch' ? 'border-[#6C3CF4] bg-[#6C3CF4]/5 text-[#6C3CF4]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                <Users size={13} /> Batch
              </button>
            </div>
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-[10px] text-gray-400 font-medium mb-1">
              {targetType === 'student' ? 'Select Student' : 'Select Batch'}
            </label>
            <select data-testid="target-select" value={targetId} onChange={e => setTargetId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
              <option value="">Choose...</option>
              {targetType === 'student'
                ? filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                : batches.map(b => <option key={b.id} value={b.id}>{b.batchName} ({b.studentCount || 0} students)</option>)
              }
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-[10px] text-gray-400 font-medium mb-1">Channel</label>
            <select data-testid="channel-select" value={channel} onChange={e => setChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
              <option value="in_app">In-App Notification</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="block text-[10px] text-gray-400 font-medium mb-1">Message</label>
          <textarea data-testid="message-input" value={message} onChange={e => setMessage(e.target.value)}
            rows={3} placeholder="Type your message here..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none resize-none" />
        </div>

        <div className="flex items-center gap-3">
          <button data-testid="send-message-btn" onClick={handleSend} disabled={sending || !message.trim() || !targetId}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {sending ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send size={14} /> Send Message</>}
          </button>
          {result && !result.error && (
            <span className="text-xs text-green-600 font-medium" data-testid="send-result">Sent to {result.sent} recipient{result.sent !== 1 ? 's' : ''}{result.skipped > 0 ? `, ${result.skipped} skipped` : ''}</span>
          )}
          {result?.error && <span className="text-xs text-red-500 font-medium">{result.error}</span>}
        </div>
      </div>

      {/* Message History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" data-testid="message-history-section">
        <button data-testid="toggle-message-history" onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <History size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-[#1a1625]">Message History</span>
            {historyTotal > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{historyTotal}</span>}
          </div>
          {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showHistory && (
          <div className="border-t border-gray-100">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="message-history-table">
                  <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Channel</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Message</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Sent</th>
                  </tr></thead>
                  <tbody>
                    {history.map(log => (
                      <tr key={log.id} className="border-b border-gray-50">
                        <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{log.studentName}</td>
                        <td className="px-4 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${log.channel === 'in_app' ? 'bg-blue-50 text-blue-600' : log.channel === 'sms' ? 'bg-green-50 text-green-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.channel === 'in_app' ? 'In-App' : log.channel === 'sms' ? 'SMS' : 'WhatsApp'}</span></td>
                        <td className="px-4 py-2 text-xs text-gray-500 max-w-xs truncate">{log.message}</td>
                        <td className="px-4 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${log.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{log.status}</span></td>
                        <td className="px-4 py-2 text-[10px] text-gray-400">{log.timestamp?.slice(0, 16).replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="px-5 py-8 text-center text-xs text-gray-400">No messages sent yet</div>}
          </div>
        )}
      </div>
    </div>
  );
}
