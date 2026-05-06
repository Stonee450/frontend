import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    API.get('/notifications').then(r => setUnread(r.data.unread_count || 0)).catch(() => {});
  }, [location.pathname]);

  const householdLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/pickups', label: 'My Pickups', icon: '📦' },
    { path: '/schedule', label: 'Schedule Pickup', icon: '📅' },
    { path: '/payments', label: 'My Payments', icon: '💳' },
    { path: '/points', label: 'My Points', icon: '🏆' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🥇' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', badge: unread },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const collectorLinks = [
    { path: '/collector/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/collector/queue', label: 'My Queue', icon: '📋' },
    { path: '/collector/history', label: 'History', icon: '📜' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', badge: unread },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/pickups', label: 'All Pickups', icon: '📦' },
    { path: '/admin/payments', label: 'Payments', icon: '💳' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
    { path: '/admin/collectors', label: 'Collectors', icon: '🚛' },
    { path: '/admin/redemptions', label: 'Redemptions', icon: '💰' },
    { path: '/admin/api-keys', label: 'API Keys', icon: '🔑' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'collector' ? collectorLinks : householdLinks;

  // Blocked user banner
  const isBlocked = user?.is_blocked;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      <aside style={{
        width: 240, flexShrink: 0,
        background: 'rgba(13,7,24,0.8)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', padding: '24px 12px',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
        transform: sidebarOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>♻️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#f0e6ff' }}>SmartWaste</div>
              <div style={{ fontSize: 11, color: '#7c5fa0' }}>Kigali, Rwanda</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: 12, padding: '12px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f0e6ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</div>
          <div style={{ fontSize: 12, color: '#9333ea', textTransform: 'capitalize', marginTop: 2 }}>{user?.role} · {user?.total_points || 0} pts</div>
          {isBlocked && <div style={{ fontSize: 11, color: '#f87171', marginTop: 4, fontWeight: 700 }}>🚫 Account Blocked</div>}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(link => (
            <button key={link.path}
              onClick={() => { navigate(link.path); setSidebarOpen(false); }}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span style={{ fontSize: 18 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.badge > 0 && (
                <span style={{ background: '#9333ea', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', width: '100%', fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, marginTop: 8 }}>
          <span>🚪</span> Sign Out
        </button>
      </aside>

      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'rgba(13,7,24,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#f0e6ff', fontSize: 24, cursor: 'pointer' }}>☰</button>
          <div style={{ fontSize: 14, color: '#7c5fa0' }}>
            {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isBlocked && (
              <div style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 50, padding: '6px 14px', fontSize: 12, color: '#f87171', fontWeight: 600 }}>
                🚫 Account Blocked — Please pay your fee
              </div>
            )}
            <div style={{ background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', borderRadius: 50, padding: '6px 14px', fontSize: 13, color: '#c084fc', fontWeight: 600 }}>
              🏆 {user?.total_points || 0} pts
            </div>
          </div>
        </header>

        {/* Blocked banner */}
        {isBlocked && (
          <div style={{ background: 'rgba(248,113,113,0.1)', borderBottom: '1px solid rgba(248,113,113,0.2)', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ color: '#f87171' }}>🚫 Your account is blocked due to unpaid monthly fees.</strong>
              <span style={{ color: '#b899d4', marginLeft: 8, fontSize: 13 }}>Pickup scheduling is disabled until you pay.</span>
            </div>
            <button className="btn-purple" onClick={() => navigate('/payments')} style={{ padding: '8px 20px', fontSize: 13 }}>
              💳 Pay Now
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
