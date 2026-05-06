import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.data || []);
      setUnread(data.unread_count || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAll = async () => {
    await API.put('/notifications/read-all');
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
    setUnread(0);
    toast.success('All marked as read');
  };

  const typeIcon = { pickup: '📦', points: '🏆', system: '⚙️', alert: '🚨', promotion: '🎉' };
  const typeColor = { pickup: '#22d3ee', points: '#c084fc', system: '#7c5fa0', alert: '#f87171', promotion: '#fbbf24' };

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">🔔 Notifications</h1>
          <p className="section-subtitle">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn-outline" onClick={markAll} style={{ padding: '8px 20px', fontSize: 13 }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: '#7c5fa0' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔔</div>
          <p style={{ fontSize: 16 }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(n => (
            <div key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              style={{
                padding: 20, borderRadius: 14, cursor: n.is_read ? 'default' : 'pointer',
                background: n.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(147,51,234,0.08)',
                border: n.is_read ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(147,51,234,0.25)',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'all 0.2s'
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${typeColor[n.type] || '#7c5fa0'}20`,
                border: `1px solid ${typeColor[n.type] || '#7c5fa0'}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>{typeIcon[n.type] || '🔔'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: n.is_read ? '#b899d4' : '#f0e6ff' }}>{n.title}</p>
                  {!n.is_read && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9333ea', flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#7c5fa0', marginTop: 4 }}>{n.message}</p>
                <p style={{ fontSize: 12, color: '#7c5fa0', marginTop: 8 }}>
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
