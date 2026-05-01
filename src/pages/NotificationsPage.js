import { useState, useEffect } from 'react';
import API from '@/api';
import { Bell, Check, CheckCheck, CreditCard, Users, ClipboardCheck, FileText, Settings } from 'lucide-react';

const typeIcons = {
  fee: CreditCard,
  teacher: Users,
  attendance: ClipboardCheck,
  test: FileText,
  system: Settings,
};

const typeColors = {
  fee: 'bg-green-50 text-green-600',
  teacher: 'bg-blue-50 text-blue-600',
  attendance: 'bg-yellow-50 text-yellow-600',
  test: 'bg-purple-50 text-purple-600',
  system: 'bg-gray-50 text-gray-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications').then(r => { setNotifications(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div data-testid="notifications-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Notifications</h1>
          <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button data-testid="mark-all-read" onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = typeIcons[n.type] || Bell;
          const colorClass = typeColors[n.type] || typeColors.system;
          return (
            <div
              key={n.id}
              data-testid={`notification-${n.id}`}
              className={`bg-white rounded-xl p-4 border shadow-sm flex items-start gap-3 transition-all ${
                n.read ? 'border-gray-100 opacity-70' : 'border-[#6C3CF4]/20 border-l-2 border-l-[#6C3CF4]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-xs font-semibold ${n.read ? 'text-gray-500' : 'text-[#1a1625]'}`}>{n.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      data-testid={`mark-read-${n.id}`}
                      className="p-1 hover:bg-gray-100 rounded-md shrink-0"
                      title="Mark as read"
                    >
                      <Check size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium capitalize ${colorClass}`}>{n.type}</span>
                  <span className="text-[10px] text-gray-300">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
        {!notifications.length && !loading && (
          <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <Bell size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
