import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, statusBreakdown, wasteByCategory, recentPickups } = data;


  const statCards = [
    { icon: '👥', label: 'Total Users', value: stats.total_users, color: '#22d3ee' },
    { icon: '🚛', label: 'Collectors', value: stats.total_collectors, color: '#c084fc' },
    { icon: '⏳', label: 'Pending Pickups', value: stats.pending_pickups, color: '#fbbf24' },
    { icon: '✅', label: 'Completed Today', value: stats.completed_today, color: '#4ade80' },
    { icon: '⚖️', label: 'Total Weight', value: `${parseFloat(stats.total_weight_kg || 0).toFixed(0)}kg`, color: '#f472b6' },
    { icon: '🏆', label: 'Points Awarded', value: stats.total_points_awarded?.toLocaleString(), color: '#fb923c' },
  ];

  const totalWaste = wasteByCategory.reduce((s, c) => s + parseFloat(c.total_kg || 0), 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">⚡ Admin Dashboard</h1>
        <p className="section-subtitle">Smart Waste Kigali · System Overview</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Status breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📊 Pickup Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statusBreakdown.map(s => (
              <div key={s.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ textTransform: 'capitalize', fontSize: 14, color: '#b899d4' }}>{s.status}</span>
                  <span style={{ fontWeight: 700 }}>{s.count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${Math.min(100, (s.count / Math.max(...statusBreakdown.map(x => x.count), 1)) * 100)}%`,
                    background: s.status === 'completed' ? '#4ade80' : s.status === 'pending' ? '#fbbf24' : s.status === 'cancelled' ? '#f87171' : '#9333ea',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waste by category */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>♻️ Waste by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {wasteByCategory.filter(c => parseFloat(c.total_kg) > 0).map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: c.color_code }}>{c.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{parseFloat(c.total_kg).toFixed(1)}kg</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${totalWaste > 0 ? (parseFloat(c.total_kg) / totalWaste * 100) : 0}%`,
                    background: c.color_code, transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
            {wasteByCategory.every(c => parseFloat(c.total_kg) === 0) && (
              <p style={{ color: '#7c5fa0', textAlign: 'center', padding: 20 }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent pickups */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📦 Recent Pickups</h3>
        <table className="glass-table">
          <thead>
            <tr><th>Date</th><th>User</th><th>Collector</th><th>Address</th><th>Status</th><th>Weight</th><th>Points</th></tr>
          </thead>
          <tbody>
            {recentPickups.map(p => (
              <tr key={p.id}>
                <td style={{ fontSize: 13 }}>{new Date(p.scheduled_date).toLocaleDateString('en-GB')}</td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{p.user_name || '-'}</td>
                <td style={{ fontSize: 13, color: '#7c5fa0' }}>{p.collector_name || 'Unassigned'}</td>
                <td style={{ fontSize: 12, color: '#7c5fa0', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pickup_address}</td>
                <td><span className={`badge badge-${p.status}`} style={{ fontSize: 10 }}>● {p.status}</span></td>
                <td style={{ color: '#4ade80', fontSize: 13 }}>{p.actual_weight_kg ? `${p.actual_weight_kg}kg` : '-'}</td>
                <td style={{ color: '#c084fc', fontWeight: 700, fontSize: 13 }}>{p.points_awarded || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
