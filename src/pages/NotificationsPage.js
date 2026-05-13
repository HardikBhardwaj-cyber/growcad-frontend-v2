import { useState, useEffect } from 'react';
import API from '@/api';
import { Bell, Check, CheckCheck, CreditCard, Users, ClipboardCheck, FileText, Settings } from 'lucide-react';

const GLASS = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '18px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const T = {
  primary: 'rgba(255,255,255,0.92)',
  title: 'rgba(255,255,255,0.95)',
  secondary: 'rgba(255,255,255,0.65)',
  muted: 'rgba(255,255,255,0.45)',
  label: 'rgba(255,255,255,0.38)',
};

const TYPE_STYLES = {
  fee: {
    icon: CreditCard,
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(52,211,153,0.24)',
    color: '#34d399',
  },
  teacher: {
    icon: Users,
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(96,165,250,0.23)',
    color: '#93c5fd',
  },
  attendance: {
    icon: ClipboardCheck,
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(251,191,36,0.24)',
    color: '#fbbf24',
  },
  test: {
    icon: FileText,
    bg: 'rgba(108,60,244,0.14)',
    border: 'rgba(167,139,250,0.25)',
    color: '#c4b5fd',
  },
  system: {
    icon: Settings,
    bg: 'rgba(148,163,184,0.10)',
    border: 'rgba(148,163,184,0.18)',
    color: 'rgba(203,213,225,0.78)',
  },
};

function getTypeKey(type = '') {
  const t = type.toLowerCase();
  if (t.includes('fee')) return 'fee';
  if (t.includes('teacher')) return 'teacher';
  if (t.includes('attendance') || t.includes('absent')) return 'attendance';
  if (t.includes('test') || t.includes('marks')) return 'test';
  return TYPE_STYLES[t] ? t : 'system';
}

function formatType(type = 'system') {
  return type.replace(/_/g, ' ');
}

function LoadingState() {
  return (
    <div data-testid="notifications-page" className="relative animate-fade-in">
      <div className="flex h-48 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 rounded-full animate-spin"
            style={{ border: '2px solid rgba(108,60,244,0.22)', borderTopColor: '#7c4ff5' }}
          />
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Loading notifications...
          </p>
        </div>
      </div>
    </div>
  );
}

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

  if (loading) return <LoadingState />;

  return (
    <div data-testid="notifications-page" className="relative animate-fade-in">
      <div
        className="sticky top-0 z-20 -mx-4 mb-5 px-4 pb-3 pt-4 lg:-mx-7 lg:px-7"
        style={{
          background: 'rgba(14,12,23,0.88)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[1.2rem] font-bold tracking-tight" style={{ color: T.title }}>
              Notifications
            </h1>
            <p className="mt-0.5 text-[11.5px]" style={{ color: T.muted }}>
              {unreadCount} unread notifications
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              data-testid="mark-all-read"
              onClick={markAllRead}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-[12px] font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: T.secondary,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg,#6C3CF4,#8b5cf6)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.38)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = T.secondary;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map(n => {
          const typeKey = getTypeKey(n.type);
          const style = TYPE_STYLES[typeKey];
          const Icon = style.icon || Bell;
          const unread = !n.read;

          return (
            <div
              key={n.id}
              data-testid={`notification-${n.id}`}
              className="relative flex items-start gap-3 overflow-hidden p-4 transition-all"
              style={{
                ...GLASS,
                opacity: unread ? 1 : 0.74,
                borderColor: unread ? 'rgba(167,139,250,0.22)' : 'rgba(255,255,255,0.075)',
                boxShadow: unread
                  ? '0 8px 28px rgba(108,60,244,0.10), 0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 3px 18px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = unread ? 'rgba(167,139,250,0.22)' : 'rgba(255,255,255,0.075)';
              }}
            >
              {unread && (
                <div
                  className="absolute bottom-0 left-0 top-0 w-[3px]"
                  style={{
                    background: 'linear-gradient(180deg,#8b5cf6,#6C3CF4)',
                    boxShadow: '0 0 16px rgba(108,60,244,0.65)',
                  }}
                />
              )}

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  color: style.color,
                  boxShadow: unread ? `0 0 24px ${style.bg}` : 'none',
                }}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold" style={{ color: unread ? T.primary : T.secondary }}>
                      {n.title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-5" style={{ color: unread ? T.secondary : T.muted }}>
                      {n.message}
                    </p>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      data-testid={`mark-read-${n.id}`}
                      className="shrink-0 rounded-xl p-2 transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: T.muted,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(52,211,153,0.26)';
                        e.currentTarget.style.color = '#34d399';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = T.muted;
                      }}
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold capitalize"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      color: style.color,
                    }}
                  >
                    {formatType(n.type)}
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: T.label }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {!notifications.length && (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center" style={GLASS}>
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: 'rgba(108,60,244,0.14)',
                border: '1px solid rgba(167,139,250,0.24)',
                color: '#c4b5fd',
                boxShadow: '0 0 30px rgba(108,60,244,0.18)',
              }}
            >
              <Bell size={24} />
            </div>
            <p className="text-sm font-bold" style={{ color: T.title }}>No notifications yet</p>
            <p className="mt-1 text-xs" style={{ color: T.muted }}>
              Updates, reminders, and system alerts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
