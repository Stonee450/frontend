import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('payments');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [reminderMsg, setReminderMsg] = useState('Please pay your monthly waste collection fee. 1,000 points = 50 RWF');
  const [sending, setSending] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [paymentsRes, usersRes] = await Promise.all([API.get('/payments/all'), API.get('/admin/users')]);
      setPayments(paymentsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const processPayment = async (id, status) => {
    setProcessingId(id);
    try {
      await API.put(`/payments/${id}/process`, { status });
      toast.success(`Payment ${status}`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessingId(null); }
  };

  const sendReminders = async () => {
    if (!selectedUsers.length) return toast.error('Select users first');
    setSending(true);
    try {
      await API.post('/payments/remind', { user_ids: selectedUsers, message: reminderMsg });
      toast.success(`Reminder sent to ${selectedUsers.length} users`);
      setSelectedUsers([]);
    } catch { toast.error('Failed to send reminders'); }
    finally { setSending(false); }
  };

  const blockUser = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await API.post(`/payments/unblock/${userId}`);
        toast.success('User unblocked');
      } else {
        await API.post(`/payments/block/${userId}`, { reason: 'Unpaid monthly fee' });
        toast.success('User blocked & points deducted');
      }
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleUserSelect = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const statusColor = { pending: '#fbbf24', confirmed: '#4ade80', rejected: '#f87171' };
  const paymentStatusColor = { paid: '#4ade80', unpaid: '#fbbf24', overdue: '#f87171' };

  const unpaidUsers = users.filter(u => u.role === 'household' && u.payment_status !== 'paid');

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">💳 Payment Management</h1>
        <p className="section-subtitle">Monitor payments, send reminders, block non-payers</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Payments', value: payments.length, color: '#22d3ee', icon: '💳' },
          { label: 'Pending Review', value: payments.filter(p => p.status === 'pending').length, color: '#fbbf24', icon: '⏳' },
          { label: 'Confirmed', value: payments.filter(p => p.status === 'confirmed').length, color: '#4ade80', icon: '✅' },
          { label: 'Unpaid Users', value: unpaidUsers.length, color: '#f87171', icon: '⚠️' },
          { label: 'Total Revenue', value: payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + Number(p.amount_rwf), 0).toLocaleString() + ' RWF', color: '#c084fc', icon: '💰' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ flex: 1, minWidth: 150 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 11, color: '#7c5fa0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</p>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'payments', label: '💳 Payments', count: payments.length },
          { id: 'users', label: '👥 Users & Reminders', count: unpaidUsers.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            border: tab === t.id ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.1)',
            background: tab === t.id ? 'rgba(147,51,234,0.2)' : 'rgba(255,255,255,0.04)',
            color: tab === t.id ? '#c084fc' : '#7c5fa0',
          }}>{t.label} {t.count > 0 && <span style={{ marginLeft: 6, background: 'rgba(147,51,234,0.3)', borderRadius: 10, padding: '2px 7px', fontSize: 11 }}>{t.count}</span>}</button>
        ))}
      </div>

      {tab === 'payments' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#7c5fa0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
              <p>No payments submitted yet</p>
            </div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr><th>User</th><th>Phone</th><th>Month</th><th>Amount</th><th>Method</th><th>Proof</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.user_name}</td>
                    <td style={{ fontSize: 12, color: '#7c5fa0' }}>{p.phone}</td>
                    <td style={{ color: '#22d3ee', fontWeight: 600 }}>{p.month_year}</td>
                    <td style={{ color: '#4ade80', fontWeight: 700 }}>{Number(p.amount_rwf).toLocaleString()} RWF</td>
                    <td style={{ fontSize: 12, color: '#b899d4', textTransform: 'capitalize' }}>{p.payment_method?.replace('_', ' ')}</td>
                    <td style={{ fontSize: 11, color: '#7c5fa0', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.payment_proof || '-'}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${statusColor[p.status]}20`, color: statusColor[p.status], border: `1px solid ${statusColor[p.status]}40` }}>
                        ● {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: '#7c5fa0' }}>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                    <td>
                      {p.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => processPayment(p.id, 'confirmed')} disabled={processingId === p.id}
                            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', cursor: 'pointer', fontWeight: 700 }}>
                            ✅ Confirm
                          </button>
                          <button onClick={() => processPayment(p.id, 'rejected')} disabled={processingId === p.id}
                            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          {/* Reminder message */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📢 Send Payment Reminder</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Message</label>
              <textarea className="input-glass" rows={3} value={reminderMsg} onChange={e => setReminderMsg(e.target.value)}
                style={{ resize: 'vertical', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn-purple" onClick={sendReminders} disabled={sending || !selectedUsers.length} style={{ padding: '10px 24px' }}>
                {sending ? '⏳ Sending...' : `📢 Send to ${selectedUsers.length} selected`}
              </button>
              <span style={{ fontSize: 13, color: '#7c5fa0' }}>Select users below to send reminders</span>
            </div>
          </div>

          {/* Users list */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => setSelectedUsers(e.target.checked ? users.filter(u => u.role === 'household').map(u => u.id) : [])} /></th>
                  <th>User</th><th>Phone</th><th>Payment Status</th><th>Points</th><th>Blocked</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'household').map(u => (
                  <tr key={u.id}>
                    <td><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleUserSelect(u.id)} /></td>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td style={{ fontSize: 12, color: '#7c5fa0' }}>{u.phone}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${paymentStatusColor[u.payment_status || 'unpaid']}20`, color: paymentStatusColor[u.payment_status || 'unpaid'], border: `1px solid ${paymentStatusColor[u.payment_status || 'unpaid']}40` }}>
                        ● {u.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td style={{ color: '#c084fc', fontWeight: 700 }}>{(u.total_points || 0).toLocaleString()}</td>
                    <td>
                      {u.is_blocked ? (
                        <span style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>🚫 Blocked</span>
                      ) : (
                        <span style={{ color: '#4ade80', fontSize: 12 }}>✅ Active</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => blockUser(u.id, u.is_blocked)}
                        style={{ padding: '5px 12px', fontSize: 11, borderRadius: 6, cursor: 'pointer', fontWeight: 700,
                          background: u.is_blocked ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                          border: u.is_blocked ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(248,113,113,0.3)',
                          color: u.is_blocked ? '#4ade80' : '#f87171' }}>
                        {u.is_blocked ? '🔓 Unblock' : '🚫 Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
