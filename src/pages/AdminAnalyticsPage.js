import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    API.get(`/admin/analytics?period=${period}`).then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!data) return null;

  const { monthlyData, recyclingRates, zonePerformance } = data;
  const totalKg = recyclingRates.reduce((s, r) => s + parseFloat(r.kg || 0), 0);
  const maxMonthly = Math.max(...monthlyData.map(m => m.pickups || 0), 1);
  const maxZone = Math.max(...zonePerformance.map(z => parseFloat(z.total_kg || 0)), 1);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">📊 Analytics</h1>
          <p className="section-subtitle">Waste management performance metrics</p>
        </div>
        <select className="input-glass" value={period} onChange={e => setPeriod(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Monthly trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📈 Pickup Trend</h3>
          {monthlyData.length === 0 ? (
            <p style={{ color: '#7c5fa0', textAlign: 'center', padding: 30 }}>No data for this period</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingBottom: 8 }}>
              {monthlyData.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#c084fc', fontWeight: 700 }}>{m.pickups}</span>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    background: 'linear-gradient(180deg, #9333ea, #6b21a8)',
                    height: `${(m.pickups / maxMonthly) * 120}px`,
                    minHeight: 4,
                    boxShadow: '0 0 10px rgba(147,51,234,0.4)',
                    transition: 'height 0.5s ease'
                  }} />
                  <span style={{ fontSize: 9, color: '#7c5fa0', writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: 40 }}>
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recycling rates */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>♻️ Recycling by Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recyclingRates.map(r => {
              const pct = totalKg > 0 ? ((parseFloat(r.kg) / totalKg) * 100).toFixed(1) : 0;
              return (
                <div key={r.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: r.color_code, fontWeight: 600 }}>● {r.name}</span>
                    <span style={{ fontSize: 13, color: '#b899d4', fontWeight: 600 }}>{parseFloat(r.kg).toFixed(1)}kg · {pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, background: r.color_code,
                      width: `${pct}%`, transition: 'width 0.6s ease',
                      boxShadow: `0 0 8px ${r.color_code}60`
                    }} />
                  </div>
                </div>
              );
            })}
            {totalKg === 0 && <p style={{ color: '#7c5fa0', textAlign: 'center', padding: 20 }}>No completed pickups yet</p>}
          </div>
        </div>
      </div>

      {/* Zone performance */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🗺️ Zone Performance (by District)</h3>
        {zonePerformance.length === 0 ? (
          <p style={{ color: '#7c5fa0', textAlign: 'center', padding: 30 }}>No data yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {zonePerformance.map((z, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 18, width: 30 }}>{['🥇','🥈','🥉'][i] || `${i+1}.`}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{z.district}</span>
                    <span style={{ fontSize: 13, color: '#b899d4' }}>{parseFloat(z.total_kg).toFixed(1)}kg · {z.pickups} pickups</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: 'linear-gradient(90deg, #7c3aed, #9333ea)',
                      width: `${(parseFloat(z.total_kg) / maxZone) * 100}%`,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
