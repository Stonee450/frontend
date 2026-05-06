import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const months = () => {
  const result = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ label, val });
  }
  return result;
};

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount_rwf: 5000, month_year: months()[0].val, payment_method: 'mobile_money', payment_proof: '', notes: '' });

  const fetchPayments = () => {
    API.get('/payments/my').then(r => setPayments(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPayments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/payments', form);
      toast.success('Payment submitted! Admin will confirm soon.');
      setShowForm(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally { setSubmitting(false); }
  };

  const statusColor = { pending: '#fbbf24', confirmed: '#4ade80', rejected: '#f87171' };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">💳 Monthly Payments</h1>
          <p className="section-subtitle">Pay your monthly waste collection fee • 1,000 pts = 50 RWF</p>
        </div>
        <button className="btn-purple" onClick={() => setShowForm(s => !s)}>+ Pay Now</button>
      </div>

      {/* Info card */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24, background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28 }}>ℹ️</span>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>How Payments Work</p>
            <p style={{ fontSize: 13, color: '#b899d4', lineHeight: 1.6 }}>
              Pay your monthly fee via Mobile Money (MTN/Airtel) or other methods. Submit your payment proof here — admin will confirm within 24 hours.
              <strong style={{ color: '#c084fc' }}> Non-payment may result in account suspension and point deductions.</strong>
              <br />Exchange rate: <strong style={{ color: '#4ade80' }}>1,000 points = 50 RWF</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Payment form */}
      {showForm && (
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Submit Payment</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Month *</label>
                <select className="input-glass" value={form.month_year} onChange={e => setForm(f => ({ ...f, month_year: e.target.value }))}>
                  {months().map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Amount (RWF) *</label>
                <input type="number" className="input-glass" value={form.amount_rwf} min={100}
                  onChange={e => setForm(f => ({ ...f, amount_rwf: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Payment Method</label>
                <select className="input-glass" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                  <option value="mobile_money">Mobile Money (MTN/Airtel)</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Transaction Ref / Proof</label>
                <input className="input-glass" placeholder="e.g. MTN-TXN123456" value={form.payment_proof}
                  onChange={e => setForm(f => ({ ...f, payment_proof: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Notes (optional)</label>
                <input className="input-glass" placeholder="Any additional info..." value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-purple" disabled={submitting} style={{ padding: '12px 28px' }}>
                {submitting ? '⏳ Submitting...' : '💳 Submit Payment'}
              </button>
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)} style={{ padding: '12px 28px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Payment history */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#7c5fa0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>💳</div>
            <p style={{ fontSize: 16 }}>No payments yet</p>
            <button className="btn-purple" onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>Make First Payment</button>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Month</th><th>Amount</th><th>Method</th><th>Proof</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.month_year}</td>
                  <td style={{ color: '#4ade80', fontWeight: 700 }}>{Number(p.amount_rwf).toLocaleString()} RWF</td>
                  <td style={{ textTransform: 'capitalize', color: '#7c5fa0', fontSize: 13 }}>{p.payment_method?.replace('_', ' ')}</td>
                  <td style={{ fontSize: 12, color: '#b899d4' }}>{p.payment_proof || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${statusColor[p.status]}20`, color: statusColor[p.status],
                      border: `1px solid ${statusColor[p.status]}40`
                    }}>● {p.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: '#7c5fa0' }}>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
