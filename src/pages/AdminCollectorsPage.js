import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminCollectorsPage = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: 'Collector@2024', vehicle_number: '', vehicle_type: 'truck', zone_assigned: '', license_number: '' });
  const [saving, setSaving] = useState(false);

  const fetchCollectors = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users?role=collector&limit=50');
      setCollectors(data.data || []);
    } catch { toast.error('Failed to load collectors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCollectors(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/admin/collectors', form);
      toast.success('Collector created!');
      setShowForm(false);
      setForm({ full_name: '', email: '', phone: '', password: 'Collector@2024', vehicle_number: '', vehicle_type: 'truck', zone_assigned: '', license_number: '' });
      fetchCollectors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">🚛 Collectors</h1>
          <p className="section-subtitle">{collectors.length} registered collectors</p>
        </div>
        <button className="btn-purple" onClick={() => setShowForm(!showForm)} style={{ padding: '12px 20px' }}>
          {showForm ? '✕ Cancel' : '+ Add Collector'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>➕ New Collector</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Full Name','full_name','text'],['Email','email','email'],['Phone','phone','text'],['Password','password','text'],['Vehicle Number','vehicle_number','text'],['License Number','license_number','text'],['Zone Assigned','zone_assigned','text']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>{label}</label>
                <input type={type} className="input-glass" value={form[key]} onChange={e => set(key, e.target.value)} required={['full_name','email','phone'].includes(key)} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Vehicle Type</label>
              <select className="input-glass" value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)}>
                <option value="truck">Truck</option>
                <option value="pickup">Pickup</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" className="btn-purple" disabled={saving} style={{ padding: '13px 28px' }}>
                {saving ? '⏳ Creating...' : '✅ Create Collector'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : collectors.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#7c5fa0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚛</div>
            <p>No collectors yet. Add one above.</p>
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>District</th><th>Points</th><th>Status</th></tr>
            </thead>
            <tbody>
              {collectors.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                  <td style={{ fontSize: 13, color: '#7c5fa0' }}>{c.email}</td>
                  <td style={{ fontSize: 13 }}>{c.phone}</td>
                  <td style={{ color: '#7c5fa0', fontSize: 13 }}>{c.district || '-'}</td>
                  <td style={{ color: '#c084fc', fontWeight: 700 }}>{c.total_points}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                      background: c.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                      color: c.is_active ? '#4ade80' : '#f87171'
                    }}>{c.is_active ? 'Active' : 'Inactive'}</span>
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

export default AdminCollectorsPage;
