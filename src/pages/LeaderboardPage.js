import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/points/leaderboard').then(r => setLeaders(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🏆 Leaderboard</h1>
        <p className="section-subtitle">Top recyclers in Kigali</p>
      </div>

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 32, padding: 24 }}>
          {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = { 1: 100, 2: 80, 3: 65 };
            return (
              <div key={l.full_name} style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                <div style={{ fontSize: rank === 1 ? 40 : 32 }}>{medals[rank - 1]}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f0e6ff', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.full_name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#c084fc' }}>{l.total_points.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#7c5fa0' }}>pts</div>
                <div style={{
                  marginTop: 10, borderRadius: '8px 8px 0 0',
                  height: heights[rank], width: '100%',
                  background: rank === 1 ? 'linear-gradient(180deg, #fbbf24, #f59e0b)' : rank === 2 ? 'linear-gradient(180deg, #9ca3af, #6b7280)' : 'linear-gradient(180deg, #c084fc, #9333ea)',
                  boxShadow: rank === 1 ? '0 0 20px rgba(251,191,36,0.4)' : 'none'
                }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>District</th>
                <th>Points</th>
                <th>Weight</th>
                <th>Pickups</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l, i) => {
                const isMe = l.email === user?.email;
                return (
                  <tr key={i} style={{ background: isMe ? 'rgba(147,51,234,0.1)' : undefined }}>
                    <td style={{ fontWeight: 700, color: i < 3 ? '#c084fc' : '#7c5fa0' }}>
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </td>
                    <td style={{ fontWeight: isMe ? 700 : 500 }}>
                      {l.full_name} {isMe && <span style={{ fontSize: 11, color: '#9333ea', fontWeight: 700 }}>(You)</span>}
                    </td>
                    <td style={{ color: '#7c5fa0' }}>{l.district || '-'}</td>
                    <td style={{ color: '#c084fc', fontWeight: 700 }}>{l.total_points.toLocaleString()}</td>
                    <td style={{ color: '#4ade80' }}>{parseFloat(l.total_weight_kg || 0).toFixed(1)}kg</td>
                    <td style={{ color: '#22d3ee' }}>{l.total_pickups}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
