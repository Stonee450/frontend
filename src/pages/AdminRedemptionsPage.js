import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminRedemptionsPage = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/redemptions'); setRedemptions(data.data || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const process = async (id, status) => {
    const txId = status === 'completed' ? `TXN${Date.now()}` : null;
    try {
      await API.put(`/admin/redemptions/${id}/process`, { status, transaction_id: txId });
      toast.success(`Redemption marked as ${status}`);
      fetch();
    } catch { toast.error('Failed'); }
  };

  const total = redemptions.reduce((s, r) => s + (r.status === 'completed' ? parseFloat(r.amount_rwf) : 0), 0);
  const pending = redemptions.filter(r => r.status === 'pending').length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">💰 Redemptions</h1>
        <p className="section-subtitle">{pending} pending · {total.toLocaleString()} RWF paid out</p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : redemptions.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#7c5fa0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
            <p>No redemptions yet</p>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>User</th><th>Points</th><th>Amount (RWF)</th><th>Provider</th><th>Phone</th><th>Status</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {redemptions.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.full_name}</td>
                  <td style={{ color: '#c084fc', fontWeight: 700 }}>{r.points_used}</td>
                  <td style={{ color: '#4ade80', fontWeight: 700 }}>{parseFloat(r.amount_rwf).toLocaleString()}</td>
                  <td style={{ color: '#22d3ee' }}>{r.provider}</td>
                  <td style={{ fontSize: 13, color: '#7c5fa0' }}>{r.phone_number}</td>
                  <td><span className={`badge badge-${r.status}`}>● {r.status}</span></td>
                  <td style={{ fontSize: 12, color: '#7c5fa0' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => process(r.id, 'completed')}
                          style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>✅ Approve</button>
                        <button onClick={() => process(r.id, 'failed')}
                          style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>❌ Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRedemptionsPage;
