import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}! 👋`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', zIndex: 1
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, #6b21a8, #9333ea, #c084fc)',
            borderRadius: 20, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: '0 8px 30px rgba(147,51,234,0.5)'
          }}>♻️</div>
          <h1 style={{
            fontSize: 32, fontWeight: 800,
            background: 'linear-gradient(135deg, #c084fc, #9333ea)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>SmartWaste</h1>
          <p style={{ color: '#7c5fa0', marginTop: 4 }}>Kigali Smart City Initiative</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: '#7c5fa0', fontSize: 14, marginBottom: 28 }}>Sign in to your account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Email Address</label>
              <input type="email" placeholder="you@example.com"
                className="input-glass"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••"
                className="input-glass"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required />
            </div>
            <button type="submit" className="btn-purple" disabled={loading}
              style={{ marginTop: 8, padding: '14px', fontSize: 16 }}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
            <span style={{ color: '#7c5fa0' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#c084fc', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
          </div>

          {/* Demo credentials */}
          <div style={{
            marginTop: 24, padding: 16, borderRadius: 10,
            background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)'
          }}>
            <p style={{ fontSize: 12, color: '#7c5fa0', fontWeight: 600, marginBottom: 8 }}>DEMO ACCOUNTS</p>
            {[
              ['Admin', 'admin@smartwaste.rw', 'Admin@2024'],
              ['Collector', 'collector1@smartwaste.rw', 'Collector@2024'],
              ['User', 'alice@example.com', 'User@2024'],
            ].map(([role, email, pass]) => (
              <div key={role} style={{ fontSize: 12, color: '#b899d4', marginBottom: 4, display: 'flex', gap: 8 }}>
                <span style={{ color: '#c084fc', fontWeight: 600, width: 60 }}>{role}:</span>
                <button onClick={() => setForm({ email, password: pass })}
                  style={{ background: 'none', border: 'none', color: '#b899d4', cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
                  {email}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
