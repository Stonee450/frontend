import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card" style={{ flex: 1, minWidth: 180 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13, color: '#7c5fa0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: color || '#f0e6ff', marginTop: 4 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: '#7c5fa0', marginTop: 4 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 32 }}>{icon}</span>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/pickups/my?limit=5').then(r => setPickups(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completed = pickups.filter(p => p.status === 'completed').length;
  const pending = pickups.filter(p => ['pending','assigned','in_progress'].includes(p.status)).length;

  const statusColor = { pending: '#fbbf24', assigned: '#22d3ee', in_progress: '#c084fc', completed: '#4ade80', cancelled: '#f87171' };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#7c5fa0', marginTop: 4 }}>Here's your waste management summary</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard icon="🏆" label="Total Points" value={user?.total_points?.toLocaleString() || 0} sub={`≈ ${user?.total_points || 0} RWF`} color="#c084fc" />
        <StatCard icon="⚖️" label="Waste Collected" value={`${parseFloat(user?.total_weight_kg || 0).toFixed(1)}kg`} sub="All time" color="#4ade80" />
        <StatCard icon="✅" label="Completed" value={completed} sub="Pickups" color="#22d3ee" />
        <StatCard icon="⏳" label="Pending" value={pending} sub="Active requests" color="#fbbf24" />
      </div>

      {/* Quick action */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button className="btn-purple" onClick={() => navigate('/schedule')} style={{ padding: '14px 28px', fontSize: 15 }}>
          📅 Schedule New Pickup
        </button>
        <button className="btn-outline" onClick={() => navigate('/points')} style={{ padding: '14px 28px', fontSize: 15 }}>
          💰 Redeem Points
        </button>
      </div>

      {/* How it works */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { step: '01', icon: '📅', title: 'Schedule Pickup', desc: 'Request a waste pickup at your convenience' },
          { step: '02', icon: '🚛', title: 'Collector Arrives', desc: 'A collector is assigned and comes to you' },
          { step: '03', icon: '⚖️', title: 'Waste Weighed', desc: 'Waste is sorted and weighed digitally' },
          { step: '04', icon: '💰', title: 'Earn Rewards', desc: 'Get points redeemable as mobile money' },
        ].map(item => (
          <div key={item.step} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#9333ea', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>STEP {item.step}</div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: '#7c5fa0' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Recent pickups */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Recent Pickups</h3>
          <button className="btn-outline" onClick={() => navigate('/pickups')} style={{ padding: '8px 16px', fontSize: 13 }}>View All</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : pickups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#7c5fa0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p>No pickups yet. Schedule your first one!</p>
            <button className="btn-purple" onClick={() => navigate('/schedule')} style={{ marginTop: 16 }}>Schedule Now</button>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Address</th>
                <th>Status</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/pickups/${p.id}`)}>
                  <td>{new Date(p.scheduled_date).toLocaleDateString()}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pickup_address}</td>
                  <td><span className={`badge badge-${p.status}`}>● {p.status}</span></td>
                  <td style={{ color: '#c084fc', fontWeight: 600 }}>+{p.points_awarded || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
