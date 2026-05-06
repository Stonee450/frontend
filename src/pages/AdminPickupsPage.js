import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminPickupsPage = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (status) params.set('status', status);
      const { data } = await API.get(`/pickups/all?${params}`);
      setPickups(data.data || []);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [status]);

  const statFilters = ['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">📦 All Pickups</h1>
        <p className="section-subtitle">System-wide pickup requests</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statFilters.map(f => (
          <button key={f} onClick={() => setStatus(f)}
            style={{
              padding: '8px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: status === f ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.1)',
              background: status === f ? 'rgba(147,51,234,0.2)' : 'rgba(255,255,255,0.04)',
              color: status === f ? '#c084fc' : '#7c5fa0'
            }}>{f || 'All'}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Date</th><th>User</th><th>Collector</th><th>Slot</th><th>Address</th><th>Status</th><th>Weight</th><th>Points</th></tr>
            </thead>
            <tbody>
              {pickups.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{new Date(p.scheduled_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ fontSize: 13 }}>{p.user_name || '-'}</td>
                  <td style={{ fontSize: 13, color: '#7c5fa0' }}>{p.collector_name || 'Unassigned'}</td>
                  <td style={{ fontSize: 12, color: '#7c5fa0', textTransform: 'capitalize' }}>{p.scheduled_time_slot}</td>
                  <td style={{ fontSize: 12, color: '#7c5fa0', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pickup_address}</td>
                  <td><span className={`badge badge-${p.status}`} style={{ fontSize: 10 }}>● {p.status}</span></td>
                  <td style={{ color: '#4ade80', fontSize: 13 }}>{p.actual_weight_kg ? `${p.actual_weight_kg}kg` : p.estimated_weight_kg ? `~${p.estimated_weight_kg}kg` : '-'}</td>
                  <td style={{ color: '#c084fc', fontWeight: 700, fontSize: 13 }}>{p.points_awarded || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPickupsPage;
