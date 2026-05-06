import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const CollectorHistoryPage = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/pickups/my?status=completed&limit=50').then(r => setPickups(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const totalWeight = pickups.reduce((s, p) => s + parseFloat(p.actual_weight_kg || 0), 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">📜 Collection History</h1>
        <p className="section-subtitle">{pickups.length} completed · {totalWeight.toFixed(1)}kg total</p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : pickups.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#7c5fa0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📜</div>
            <p>No completed pickups yet</p>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Date</th><th>User</th><th>Address</th><th>Weight</th><th>Points Given</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {pickups.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{new Date(p.scheduled_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ fontSize: 13 }}>{p.user_name || '-'}</td>
                  <td style={{ fontSize: 12, color: '#7c5fa0', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pickup_address}</td>
                  <td style={{ color: '#4ade80', fontWeight: 700 }}>{p.actual_weight_kg || 0}kg</td>
                  <td style={{ color: '#c084fc', fontWeight: 700 }}>+{p.points_awarded || 0}</td>
                  <td style={{ color: '#fbbf24' }}>{p.rating ? '⭐'.repeat(p.rating) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CollectorHistoryPage;
