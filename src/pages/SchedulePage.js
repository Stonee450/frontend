 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { getUnreadCount } from '../utils/notifications';



const SchedulePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [wastePhotos, setWastePhotos] = useState({});
  const [form, setForm] = useState({
    scheduled_date: '',
    scheduled_time_slot: 'morning',
    pickup_address: '',
    special_instructions: '',
  });

  useEffect(() => {
    Promise.all([API.get('/categories'), API.get('/zones')])
      .then(([cats, zns]) => { setCategories(cats.data.data); setZones(zns.data.data); })
      .catch(() => {});
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategories(prev => {
      const updated = { ...prev };
      if (updated[id]) delete updated[id];
      else updated[id] = { category_id: id, estimated_weight_kg: 1 };
      return updated;
    });
  };

  const setWeight = (id, weight) => {
    setSelectedCategories(prev => ({ ...prev, [id]: { ...prev[id], estimated_weight_kg: parseFloat(weight) || 0 } }));
  };

  const totalEstimatedPoints = () => {
    return Object.values(selectedCategories).reduce((sum, item) => {
      const cat = categories.find(c => c.id === item.category_id);
      return sum + Math.floor((item.estimated_weight_kg || 0) * (cat?.points_per_kg || 5));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedCategories).length === 0) {
      toast.error('Please select at least one waste type');
      return;
    }
    setLoading(true);
    try {
      const waste_items = Object.values(selectedCategories);
      await API.post('/pickups', { ...form, waste_items });
      toast.success('Pickup scheduled successfully! 🎉');

      // Ensure admin/collector notification badge updates after a new pickup is created.
      // Layout badge reads /notifications, so we just pre-warm it by refetching.
      try {
        await getUnreadCount();
      } catch {}

      navigate('/pickups');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {

      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">📅 Schedule a Pickup</h1>
        <p className="section-subtitle">Fill in the details to schedule your waste collection</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Date & time */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🗓️</span> Pickup Schedule
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Date *</label>
              <input type="date" className="input-glass" min={minDate}
                value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Time Slot *</label>
              <select className="input-glass" value={form.scheduled_time_slot} onChange={e => setForm(f => ({ ...f, scheduled_time_slot: e.target.value }))}>
                <option value="morning">🌅 Morning (6AM – 12PM)</option>
                <option value="afternoon">☀️ Afternoon (12PM – 6PM)</option>
                <option value="evening">🌙 Evening (6PM – 9PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📍</span> Pickup Location
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Full Address *</label>
              <input className="input-glass" placeholder="KG 15 Ave, Gasabo, Kigali" value={form.pickup_address} onChange={e => setForm(f => ({ ...f, pickup_address: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Special Instructions (optional)</label>
              <textarea className="input-glass" rows={3} placeholder="E.g. Ring the gate bell, call before arriving..."
                value={form.special_instructions} onChange={e => setForm(f => ({ ...f, special_instructions: e.target.value }))}
                style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
          </div>
        </div>

        {/* Waste types */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>♻️</span> Waste Types
          </h3>
          <p style={{ fontSize: 13, color: '#7c5fa0', marginBottom: 16 }}>Select the types of waste you have and estimate weight</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {categories.map(cat => {
              const selected = !!selectedCategories[cat.id];
              return (
                <div key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: 16, borderRadius: 12, cursor: 'pointer',
                    border: selected ? `1px solid ${cat.color_code}` : '1px solid rgba(255,255,255,0.08)',
                    background: selected ? `${cat.color_code}15` : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</span>
                    <span style={{
                      width: 20, height: 20, borderRadius: 5,
                      background: selected ? cat.color_code : 'transparent',
                      border: `2px solid ${selected ? cat.color_code : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11
                    }}>{selected ? '✓' : ''}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#7c5fa0', marginBottom: 8 }}>{cat.points_per_kg} pts/kg</div>
                  {selected && (
                    <div onClick={e => e.stopPropagation()}>
                      <input type="number" className="input-glass" placeholder="kg" min="0.1" step="0.1"
                        value={selectedCategories[cat.id]?.estimated_weight_kg || ''}
                        onChange={e => setWeight(cat.id, e.target.value)}
                        style={{ padding: '6px 10px', fontSize: 13, marginBottom: 8 }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 6 }}>
                        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => setWastePhotos(p => ({ ...p, [cat.id]: reader.result }));
                            reader.readAsDataURL(file);
                          }} />
                        <span style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#b899d4', fontWeight: 600 }}>
                          {wastePhotos[cat.id] ? '📷 Photo added ✓' : '📷 Add Photo (optional)'}
                        </span>
                      </label>
                      {wastePhotos[cat.id] && (
                        <img src={wastePhotos[cat.id]} alt="waste" style={{ marginTop: 6, width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, border: `1px solid ${cat.color_code}50` }} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated points */}
        {Object.keys(selectedCategories).length > 0 && (
          <div style={{
            padding: 20, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(107,33,168,0.2), rgba(147,51,234,0.1))',
            border: '1px solid rgba(147,51,234,0.3)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#7c5fa0' }}>Estimated points to earn</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#c084fc' }}>+{totalEstimatedPoints()} pts</div>
              <div style={{ fontSize: 12, color: '#7c5fa0' }}>≈ {totalEstimatedPoints()} RWF</div>
            </div>
            <span style={{ fontSize: 48 }}>🏆</span>
          </div>
        )}

        <button type="submit" className="btn-purple" disabled={loading} style={{ padding: '16px', fontSize: 16 }}>
          {loading ? '⏳ Scheduling...' : '📅 Schedule Pickup'}
        </button>
      </form>
    </div>
  );
};

export default SchedulePage;
