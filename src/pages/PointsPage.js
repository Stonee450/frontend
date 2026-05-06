import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PointsPage = () => {
  const { user, refreshUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('history');
  const [redeemForm, setRedeemForm] = useState({ points: 500, provider: 'MTN', phone_number: user?.mobile_money_number || '', redemption_type: 'mobile_money' });
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    Promise.all([API.get('/points/history'), API.get('/points/redemptions')])
      .then(([h, r]) => { setHistory(h.data.data || []); setRedemptions(r.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeeming(true);
    try {
      await API.post('/points/redeem', redeemForm);
      toast.success(`🎉 ${redeemForm.points} points redeemed! Processing ${redeemForm.points} RWF to ${redeemForm.phone_number}`);
      refreshUser();
      const r = await API.get('/points/redemptions');
      setRedemptions(r.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  const typeColor = { earned: '#4ade80', redeemed: '#f87171', bonus: '#fbbf24', referral: '#22d3ee' };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🏆 Points & Rewards</h1>
        <p className="section-subtitle">Earn points by recycling, redeem for mobile money</p>
      </div>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95, #6b21a8, #7c3aed)',
        borderRadius: 20, padding: 32, marginBottom: 32,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 40px rgba(107,33,168,0.5)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 150, height: 150, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 }}>Current Balance</p>
          <p style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1 }}>{user?.total_points?.toLocaleString() || 0}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>points · ≈ {user?.total_points || 0} RWF</p>
        </div>
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Total Collected</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{parseFloat(user?.total_weight_kg || 0).toFixed(1)} kg</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 }}>Min. redeem</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>500 pts</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* History / Redemptions */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[['history', '📜 History'], ['redemptions', '💰 Redemptions']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{
                  padding: '8px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  border: tab === key ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.1)',
                  background: tab === key ? 'rgba(147,51,234,0.2)' : 'transparent',
                  color: tab === key ? '#c084fc' : '#7c5fa0',
                }}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
          ) : tab === 'history' ? (
            history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#7c5fa0' }}>No transactions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)'
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{tx.description}</p>
                      <p style={{ fontSize: 12, color: '#7c5fa0' }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: typeColor[tx.transaction_type] || '#f0e6ff' }}>
                        {tx.points > 0 ? '+' : ''}{tx.points} pts
                      </p>
                      <p style={{ fontSize: 11, color: '#7c5fa0' }}>Balance: {tx.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            redemptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#7c5fa0' }}>No redemptions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {redemptions.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)'
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{r.provider} · {r.phone_number}</p>
                      <p style={{ fontSize: 12, color: '#7c5fa0' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>{r.amount_rwf} RWF</p>
                      <span className={`badge badge-${r.status}`} style={{ fontSize: 10 }}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Redeem form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>💰 Redeem Points</h3>
          <p style={{ fontSize: 13, color: '#7c5fa0', marginBottom: 20 }}>Convert points to mobile money</p>

          <form onSubmit={handleRedeem} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Points to Redeem</label>
              <input type="number" className="input-glass" min="500" step="100"
                value={redeemForm.points} onChange={e => setRedeemForm(f => ({ ...f, points: parseInt(e.target.value) }))} />
              <p style={{ fontSize: 12, color: '#7c5fa0', marginTop: 4 }}>= {redeemForm.points} RWF · Available: {user?.total_points || 0} pts</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Provider</label>
              <select className="input-glass" value={redeemForm.provider} onChange={e => setRedeemForm(f => ({ ...f, provider: e.target.value }))}>
                <option value="MTN">MTN Mobile Money</option>
                <option value="Airtel">Airtel Money</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
              <input className="input-glass" placeholder="+250788..." value={redeemForm.phone_number} onChange={e => setRedeemForm(f => ({ ...f, phone_number: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-purple" disabled={redeeming || (user?.total_points || 0) < redeemForm.points} style={{ padding: '14px' }}>
              {redeeming ? '⏳ Processing...' : '💸 Redeem Now'}
            </button>
          </form>

          {/* Points rates */}
          <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: 12, color: '#7c5fa0', fontWeight: 600, marginBottom: 10 }}>EARNING RATES</p>
            {[['Plastic', 10, '#3B82F6'], ['Organic', 5, '#10B981'], ['Metal', 15, '#F59E0B'], ['Glass', 8, '#8B5CF6'], ['Paper', 6, '#EC4899'], ['E-Waste', 20, '#EF4444']].map(([name, pts, color]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: color }}>● {name}</span>
                <span style={{ color: '#b899d4', fontWeight: 600 }}>{pts} pts/kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsPage;
