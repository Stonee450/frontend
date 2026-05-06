import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminApiKeysPage = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ key_name: '', permissions: ['read'], expires_at: '' });
  const [newKey, setNewKey] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/api-keys'); setKeys(data.data || []); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/admin/api-keys', form);
      setNewKey(data.data.api_key);
      toast.success('API key created!');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const revoke = async (id) => {
    if (!window.confirm('Revoke this API key?')) return;
    try { await API.delete(`/admin/api-keys/${id}`); toast.success('Key revoked'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">🔑 API Keys</h1>
          <p className="section-subtitle">Manage external API access</p>
        </div>
        <button className="btn-purple" onClick={() => setShowForm(!showForm)} style={{ padding: '12px 20px' }}>
          {showForm ? '✕ Cancel' : '+ New API Key'}
        </button>
      </div>

      {newKey && (
        <div style={{ padding: 20, borderRadius: 12, marginBottom: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
          <p style={{ color: '#4ade80', fontWeight: 700, marginBottom: 8 }}>✅ New API Key Created — copy it now, it won't be shown again!</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: 8, fontSize: 13, color: '#f0e6ff', flex: 1, wordBreak: 'break-all' }}>{newKey}</code>
            <button className="btn-purple" onClick={() => copy(newKey)} style={{ padding: '8px 16px', flexShrink: 0 }}>Copy</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Create API Key</h3>
          <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Key Name</label>
              <input className="input-glass" placeholder="e.g. Mobile App v2" value={form.key_name} onChange={e => setForm(f => ({ ...f, key_name: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Expires At (optional)</label>
              <input type="date" className="input-glass" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <button type="submit" className="btn-purple" style={{ padding: '12px', maxWidth: 200 }}>Generate Key</button>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Name</th><th>Key (partial)</th><th>Status</th><th>Last Used</th><th>Expires</th><th>Action</th></tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 600 }}>{k.key_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#c084fc' }}>
                        {k.api_key.substring(0, 20)}...
                      </code>
                      <button onClick={() => copy(k.api_key)} style={{ background: 'none', border: 'none', color: '#7c5fa0', cursor: 'pointer', fontSize: 14 }}>📋</button>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                      background: k.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                      color: k.is_active ? '#4ade80' : '#f87171'
                    }}>{k.is_active ? 'Active' : 'Revoked'}</span>
                  </td>
                  <td style={{ fontSize: 12, color: '#7c5fa0' }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}</td>
                  <td style={{ fontSize: 12, color: '#7c5fa0' }}>{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td>
                    {k.is_active && (
                      <button onClick={() => revoke(k.id)}
                        style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
                        Revoke
                      </button>
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

export default AdminApiKeysPage;
