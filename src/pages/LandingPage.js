import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const particlesRef = useRef(null);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'collector') navigate('/collector/queue', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    const particles = [];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = (Math.random() * 3 + 1) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (Math.random() * 15 + 10) + 's';
      p.style.animationDelay = (Math.random() * 15) + 's';
      p.style.opacity = Math.random() * 0.5;
      container.appendChild(p);
      particles.push(p);
    }
    return () => particles.forEach(p => p.remove());
  }, []);

  const features = [
    { icon: '📅', title: 'Schedule Pickups', desc: 'Book a waste collection at your doorstep in seconds. Choose your date, time, and waste type.' },
    { icon: '⚖️', title: 'Smart Weighing', desc: 'Your waste is digitally weighed and sorted by collectors using our smart tracking system.' },
    { icon: '🏆', title: 'Earn Points', desc: 'Get reward points for every kilogram collected. Redeem them as MTN or Airtel mobile money.' },
    { icon: '📊', title: 'Track Progress', desc: 'Monitor your environmental impact, pickup history, and rewards on your personal dashboard.' },
    { icon: '🚛', title: 'Verified Collectors', desc: 'All collectors are trained and verified. Get real-time status updates on your pickup.' },
    { icon: '🌍', title: 'Cleaner Kigali', desc: 'Join thousands of households making Kigali a cleaner, greener smart city together.' },
  ];

  const steps = [
    { num: '01', icon: '📝', title: 'Register', desc: 'Create your free account in under 2 minutes' },
    { num: '02', icon: '📅', title: 'Schedule', desc: 'Request a pickup at your convenience' },
    { num: '03', icon: '🚛', title: 'Collection', desc: 'A verified collector comes to your door' },
    { num: '04', icon: '💰', title: 'Get Rewarded', desc: 'Earn points, redeem as mobile money' },
  ];

  const stats = [
    { value: '2,400+', label: 'Households' },
    { value: '18,000kg', label: 'Waste Collected' },
    { value: '96%', label: 'Satisfaction Rate' },
    { value: '3', label: 'Districts Covered' },
  ];

  return (
    <div className="page-content" style={{ overflowX: 'hidden' }}>
      {/* Animated background */}
      <div className="app-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="particles" ref={particlesRef} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(147,51,234,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(147,51,234,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 60px',
        background: 'rgba(10,5,16,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(147,51,234,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>♻️</span>
          <span style={{
            fontSize: 22, fontWeight: 800,
            background: 'linear-gradient(135deg, #c084fc, #9333ea)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>SmartWaste</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', fontSize: 14 }}>
            Sign In
          </button>
          <button className="btn-purple" onClick={() => navigate('/register')}
            style={{ padding: '10px 24px', fontSize: 14 }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.3)',
          borderRadius: 50, padding: '8px 20px', marginBottom: 32,
          fontSize: 13, color: '#c084fc', fontWeight: 600,
        }}>
          <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
          Kigali Smart City Initiative — Now Live
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.1,
          marginBottom: 24, maxWidth: 900,
        }}>
          Turn Your Waste Into{' '}
          <span style={{
            background: 'linear-gradient(135deg, #c084fc, #9333ea, #22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Mobile Money</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#b899d4',
          maxWidth: 620, marginBottom: 48, lineHeight: 1.7,
        }}>
          Rwanda's smartest waste management platform. Schedule pickups, track collection,
          and earn rewards for keeping Kigali clean.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-purple" onClick={() => navigate('/register')}
            style={{ padding: '16px 36px', fontSize: 17, borderRadius: 14 }}>
            🚀 Start Earning Today
          </button>
          <button className="btn-outline" onClick={() => navigate('/login')}
            style={{ padding: '16px 36px', fontSize: 17, borderRadius: 14 }}>
            Sign In →
          </button>
        </div>

        {/* Hero stats */}
        <div style={{
          display: 'flex', gap: 48, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#c084fc' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#7c5fa0', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll arrow */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          color: '#7c5fa0', fontSize: 24, animation: 'bounce 2s ease-in-out infinite',
        }}>↓</div>
        <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }`}</style>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#9333ea', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>Four steps to a reward</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={s.num} className="glass-card" style={{ padding: 32, textAlign: 'center', position: 'relative' }}>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
                  color: '#6b21a8', fontSize: 20, zIndex: 2, display: 'none',
                }}>→</div>
              )}
              <div style={{ fontSize: 11, color: '#9333ea', fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>STEP {s.num}</div>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
                background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
              }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#7c5fa0', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#9333ea', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>FEATURES</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>Everything you need</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} className="glass-card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#7c5fa0', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 60px', textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div className="glass-card" style={{
          maxWidth: 700, margin: '0 auto', padding: '64px 48px',
          background: 'linear-gradient(145deg, rgba(107,33,168,0.2), rgba(147,51,234,0.08))',
          border: '1px solid rgba(147,51,234,0.3)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>♻️</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
            Join the green movement
          </h2>
          <p style={{ fontSize: 16, color: '#b899d4', marginBottom: 36, lineHeight: 1.7 }}>
            Thousands of Kigali households are already earning rewards. Sign up free today and start turning waste into value.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-purple" onClick={() => navigate('/register')}
              style={{ padding: '16px 40px', fontSize: 17, borderRadius: 14 }}>
              🚀 Create Free Account
            </button>
            <button className="btn-outline" onClick={() => navigate('/login')}
              style={{ padding: '16px 32px', fontSize: 17, borderRadius: 14 }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 60px', position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(147,51,234,0.15)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>♻️</span>
          <span style={{ fontWeight: 700, color: '#c084fc' }}>SmartWaste</span>
          <span style={{ color: '#7c5fa0', fontSize: 14, marginLeft: 8 }}>— Kigali Smart City Initiative</span>
        </div>
        <p style={{ color: '#7c5fa0', fontSize: 13 }}>© {new Date().getFullYear()} SmartWaste Rwanda. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
