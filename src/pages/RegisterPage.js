import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const districts = ['Gasabo', 'Kicukiro', 'Nyarugenge'];

const RegisterPage = () => {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', district: '', address: '', mobile_money_number: '', mobile_money_provider: 'MTN' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created! Welcome to SmartWaste 🎉');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'collector') navigate('/collector/queue');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', zIndex: 1
    }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: 'linear-gradient(135deg, #6b21a8, #9333ea)',
            borderRadius: 18, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, boxShadow: '0 8px 30px rgba(147,51,234,0.5)'
          }}>♻️</div>
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, #c084fc, #9333ea)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Join SmartWaste</h1>
          <p style={{ color: '#7c5fa0', fontSize: 14, marginTop: 4 }}>Start earning rewards for recycling</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Full Name *</label>
                <input className="input-glass" placeholder="Jean Mukamana" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Email *</label>
                <input type="email" className="input-glass" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Phone *</label>
                <input className="input-glass" placeholder="+250788..." value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Password *</label>
                <input type="password" className="input-glass" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>District</label>
                <select className="input-glass" value={form.district} onChange={e => set('district', e.target.value)}>
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Address</label>
                <input className="input-glass" placeholder="Your street address" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Mobile Money Number</label>
                <input className="input-glass" placeholder="+250788..." value={form.mobile_money_number} onChange={e => set('mobile_money_number', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Provider</label>
                <select className="input-glass" value={form.mobile_money_provider} onChange={e => set('mobile_money_provider', e.target.value)}>
                  <option value="MTN">MTN Rwanda</option>
                  <option value="Airtel">Airtel Rwanda</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-purple" disabled={loading} style={{ padding: '14px', fontSize: 16, marginTop: 8 }}>
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7c5fa0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#c084fc', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
