import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '', phone: user?.phone || '',
    address: user?.address || '', district: user?.district || '',
    sector: user?.sector || '', cell: user?.cell || '',
    mobile_money_number: user?.mobile_money_number || '',
    mobile_money_provider: user?.mobile_money_provider || 'MTN',
  });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/auth/update-profile', form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) return toast.error('Passwords do not match');
    setChangingPw(true);
    try {
      await API.put('/auth/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setChangingPw(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">👤 Profile</h1>
        <p className="section-subtitle">Manage your account details</p>
      </div>

      {/* Avatar */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6b21a8, #9333ea)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, boxShadow: '0 4px 20px rgba(147,51,234,0.4)', flexShrink: 0
        }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 20 }}>{user?.full_name}</p>
          <p style={{ color: '#7c5fa0', fontSize: 14 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span style={{
              padding: '3px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
              background: 'rgba(147,51,234,0.15)', color: '#c084fc', border: '1px solid rgba(147,51,234,0.3)',
              textTransform: 'capitalize'
            }}>{user?.role}</span>
            <span style={{
              padding: '3px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
              background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)'
            }}>🏆 {user?.total_points || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
        <form onSubmit={saveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            ['Full Name', 'full_name', 'text', '1/-1'],
            ['Phone', 'phone', 'text', null],
            ['District', 'district', 'text', null],
            ['Sector', 'sector', 'text', null],
            ['Cell', 'cell', 'text', null],
            ['Address', 'address', 'text', '1/-1'],
            ['Mobile Money Number', 'mobile_money_number', 'text', null],
          ].map(([label, key, type, col]) => (
            <div key={key} style={{ gridColumn: col || undefined }}>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>{label}</label>
              <input type={type} className="input-glass" value={form[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Provider</label>
            <select className="input-glass" value={form.mobile_money_provider} onChange={e => set('mobile_money_provider', e.target.value)}>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <button type="submit" className="btn-purple" disabled={saving} style={{ padding: '13px 28px' }}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🔒 Change Password</h3>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['Current Password', 'current_password'], ['New Password', 'new_password'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>{label}</label>
              <input type="password" className="input-glass" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" className="btn-purple" disabled={changingPw} style={{ padding: '13px' }}>
            {changingPw ? '⏳ Changing...' : '🔑 Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
