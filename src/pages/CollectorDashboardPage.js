import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CollectorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/collector/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  const stats = data || {};

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          Welcome back, {user?.full_name?.split(' ')[0]} 🚛
        </h1>
        <p style={{ color: '#7c5fa0', marginTop: 4 }}>Your collection performance overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { icon: '✅', label: 'Total Completed', value: stats.totalCompleted || 0, color: '#4ade80' },
          { icon: '⏳', label: 'Pending Pickups', value: stats.pendingPickups || 0, color: '#fbbf24' },
          { icon: '⚖️', label: 'Total Collected', value: `${parseFloat(stats.totalWeight || 0).toFixed(1)}kg`, color: '#22d3ee' },
          { icon: '⭐', label: 'Your Rating', value: stats.rating || '5.0', color: '#c084fc' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 12, color: '#7c5fa0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</p>
              </div>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button className="btn-purple" onClick={() => navigate('/collector/queue')} style={{ padding: '14px 28px', fontSize: 15 }}>
          📋 View My Queue
        </button>
        <button className="btn-outline" onClick={() => navigate('/collector/history')} style={{ padding: '14px 28px', fontSize: 15 }}>
          📜 Collection History
        </button>
      </div>

      {/* Recent pickups */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📦 Recent Activity</h3>
        {!stats.recentPickups?.length ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#7c5fa0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚛</div>
            <p>No recent pickups yet</p>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Date</th><th>User</th><th>Address</th><th>Status</th><th>Weight</th><th>Points Given</th></tr>
            </thead>
            <tbody>
              {stats.recentPickups.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/collector/queue`)}>
                  <td style={{ fontSize: 13 }}>{new Date(p.scheduled_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{p.user_name}</td>
                  <td style={{ fontSize: 12, color: '#7c5fa0', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pickup_address}</td>
                  <td><span className={`badge badge-${p.status}`} style={{ fontSize: 10 }}>● {p.status}</span></td>
                  <td style={{ color: '#4ade80', fontWeight: 700 }}>{p.actual_weight_kg || 0}kg</td>
                  <td style={{ color: '#c084fc', fontWeight: 700 }}>+{p.points_awarded || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CollectorDashboardPage;
