import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PickupsPage = () => {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter) params.set('status', filter);
      const { data } = await API.get(`/pickups/my?${params}`);
      setPickups(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPickups(); }, [filter, page]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this pickup?')) return;
    try {
      await API.put(`/pickups/${id}/cancel`);
      toast.success('Pickup cancelled');
      fetchPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const statusFilters = [
    { label: 'All', value: '' },
    { label: '⏳ Pending', value: 'pending' },
    { label: '✅ Assigned', value: 'assigned' },
    { label: '🚛 In Progress', value: 'in_progress' },
    { label: '🎉 Completed', value: 'completed' },
    { label: '❌ Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">My Pickups</h1>
          <p className="section-subtitle">{total} total requests</p>
        </div>
        <button className="btn-purple" onClick={() => navigate('/schedule')}>+ Schedule New</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {statusFilters.map(f => (
          <button key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            style={{
              padding: '8px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: filter === f.value ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.1)',
              background: filter === f.value ? 'rgba(147,51,234,0.2)' : 'rgba(255,255,255,0.04)',
              color: filter === f.value ? '#c084fc' : '#7c5fa0',
              transition: 'all 0.2s'
            }}>{f.label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : pickups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#7c5fa0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📦</div>
            <p style={{ fontSize: 16 }}>No pickups found</p>
            <button className="btn-purple" onClick={() => navigate('/schedule')} style={{ marginTop: 16 }}>Schedule Now</button>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Address</th>
                <th>Status</th>
                <th>Weight</th>
                <th>Points</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{new Date(p.scheduled_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ textTransform: 'capitalize', color: '#7c5fa0' }}>{p.scheduled_time_slot}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.pickup_address}
                  </td>
                  <td><span className={`badge badge-${p.status}`}>● {p.status}</span></td>
                  <td style={{ color: '#4ade80' }}>{p.actual_weight_kg ? `${p.actual_weight_kg}kg` : p.estimated_weight_kg ? `~${p.estimated_weight_kg}kg` : '-'}</td>
                  <td style={{ color: '#c084fc', fontWeight: 700 }}>{p.points_awarded > 0 ? `+${p.points_awarded}` : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-outline" onClick={() => navigate(`/pickups/${p.id}`)}
                        style={{ padding: '6px 12px', fontSize: 12 }}>View</button>
                      {['pending', 'assigned'].includes(p.status) && (
                        <button onClick={() => cancel(p.id)}
                          style={{
                            padding: '6px 12px', fontSize: 12, borderRadius: 8,
                            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                            color: '#f87171', cursor: 'pointer', fontWeight: 600
                          }}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 20px' }}>← Prev</button>
          <span style={{ color: '#7c5fa0', padding: '8px 16px' }}>Page {page} of {Math.ceil(total / 10)}</span>
          <button className="btn-outline" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)} style={{ padding: '8px 20px' }}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default PickupsPage;
