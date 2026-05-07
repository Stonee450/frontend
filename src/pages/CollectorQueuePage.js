import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CollectorQueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [weights, setWeights] = useState({});
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', waste_condition: 'good' });
  const [voiceModal, setVoiceModal] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [voiceMessages, setVoiceMessages] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const fetchQueue = async () => {
    try {
      const { data } = await API.get('/pickups/collector/queue');
      setQueue(data.data || []);
    } catch { toast.error('Failed to load queue'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const startPickup = async (id) => {
    try {
      await API.put(`/pickups/${id}/start`);
      toast.success('Pickup started!');
      fetchQueue();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const completePickup = async (pickup) => {
    setCompleting(pickup.id);
    try {
      const items = pickup.waste_items || [];
      // IMPORTANT:
      // - Bind parameters must not contain undefined.
      // - To pass SQL NULL, use JS null (not undefined).
      const waste_items = items.map(item => {
        const key = `${pickup.id}_${item.category}`;
        const category_id = item.category_id ?? item.id;
        const rawWeight = weights[key];
        const parsedWeight = rawWeight === undefined || rawWeight === ''
          ? (item.estimated_kg ?? null)
          : Number(rawWeight);

        return {
          category_id: category_id ?? null,
          actual_weight_kg: parsedWeight === undefined ? null : parsedWeight,
        };
      });
      const { data } = await API.put(`/pickups/${pickup.id}/complete`, { waste_items });
      toast.success(`✅ Pickup complete! User earned ${data.data.total_points} points`);
      fetchQueue();
      setFeedbackModal(pickup);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCompleting(null); }
  };

  const submitFeedback = async () => {
    if (!feedback.message.trim()) return toast.error('Please enter a feedback message');
    try {
      await API.post(`/collector/feedback/${feedbackModal.id}`, feedback);
      toast.success('Feedback sent to user and admin');
      setFeedbackModal(null);
      setFeedback({ message: '', waste_condition: 'good' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openVoice = async (pickup) => {
    setVoiceModal(pickup);
    setAudioBlob(null);
    try {
      const { data } = await API.get(`/collector/voice/${pickup.id}`);
      setVoiceMessages(data.data || []);
    } catch { setVoiceMessages([]); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch { toast.error('Microphone access denied'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return toast.error('Record a message first');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        await API.post('/collector/voice', {
          pickup_id: voiceModal.id,
          audio_data: base64,
          duration_seconds: 0
        });
        toast.success('Voice message sent!');
        setAudioBlob(null);
        openVoice(voiceModal);
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) { toast.error('Failed to send voice message'); }
  };

  const timeSlotBadge = { morning: { label: '🌅 Morning', color: '#fbbf24' }, afternoon: { label: '☀️ Afternoon', color: '#f97316' }, evening: { label: '🌙 Evening', color: '#8b5cf6' } };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🚛 Pickup Queue</h1>
        <p className="section-subtitle">{queue.length} active assignments</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : queue.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: '#7c5fa0' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Queue is clear!</p>
          <p style={{ marginTop: 8 }}>No pickups assigned to you right now</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {queue.map(p => {
            const slot = timeSlotBadge[p.scheduled_time_slot] || {};
            const items = (() => { try { return typeof p.waste_items === 'string' ? JSON.parse(p.waste_items) : p.waste_items || []; } catch { return []; } })();
            return (
              <div key={p.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span className={`badge badge-${p.status}`}>● {p.status}</span>
                      <span style={{ fontSize: 13, color: slot.color, fontWeight: 600 }}>{slot.label}</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{p.user_name}</p>
                    <p style={{ color: '#7c5fa0', fontSize: 13 }}>📞 {p.user_phone}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{new Date(p.scheduled_date).toLocaleDateString('en-GB')}</p>
                    <p style={{ fontSize: 12, color: '#7c5fa0', marginTop: 4 }}>Est. {p.estimated_weight_kg}kg</p>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 16, fontSize: 14, color: '#b899d4' }}>
                  📍 {p.pickup_address}
                </div>

                {p.special_instructions && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 16, fontSize: 13, color: '#fbbf24' }}>
                    ⚠️ {p.special_instructions}
                  </div>
                )}

                {p.status === 'in_progress' && items.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#7c5fa0', fontWeight: 600, marginBottom: 10 }}>ENTER ACTUAL WEIGHTS</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${item.color || '#7c5fa0'}30` }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: item.color || '#b899d4', marginBottom: 6 }}>{item.category}</p>
                          <input type="number" className="input-glass" placeholder={`${item.estimated_kg || 1}kg`}
                            step="0.1" min="0"
                            value={weights[`${p.id}_${item.category}`] || ''}
                            onChange={e => setWeights(w => ({ ...w, [`${p.id}_${item.category}`]: e.target.value }))}
                            style={{ padding: '6px 10px', fontSize: 13 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {p.status === 'assigned' && (
                    <button className="btn-purple" onClick={() => startPickup(p.id)} style={{ padding: '10px 20px' }}>
                      🚛 Start Pickup
                    </button>
                  )}
                  {p.status === 'in_progress' && (
                    <button className="btn-purple" onClick={() => completePickup(p)} disabled={completing === p.id}
                      style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #065f46, #059669)' }}>
                      {completing === p.id ? '⏳ Completing...' : '✅ Mark Complete'}
                    </button>
                  )}
                  <button className="btn-outline" onClick={() => openVoice(p)} style={{ padding: '10px 20px' }}>
                    🎙️ Voice Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback modal */}
      {feedbackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="glass-card" style={{ padding: 32, width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>📝 Give Feedback</h3>
            <p style={{ color: '#7c5fa0', fontSize: 13, marginBottom: 20 }}>This will be sent to the user and admin to confirm collection</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Waste Condition</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['good', 'acceptable', 'poor'].map(c => (
                  <button key={c} onClick={() => setFeedback(f => ({ ...f, waste_condition: c }))}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      border: feedback.waste_condition === c ? '1px solid #9333ea' : '1px solid rgba(255,255,255,0.1)',
                      background: feedback.waste_condition === c ? 'rgba(147,51,234,0.2)' : 'rgba(255,255,255,0.04)',
                      color: feedback.waste_condition === c ? '#c084fc' : '#7c5fa0' }}>
                    {c === 'good' ? '✅' : c === 'acceptable' ? '⚠️' : '❌'} {c}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 6 }}>Message *</label>
              <textarea className="input-glass" rows={4} placeholder="e.g. Pickup completed successfully. Waste was well-sorted..."
                value={feedback.message} onChange={e => setFeedback(f => ({ ...f, message: e.target.value }))}
                style={{ resize: 'vertical', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-purple" onClick={submitFeedback} style={{ flex: 1, padding: '12px' }}>📤 Send Feedback</button>
              <button className="btn-outline" onClick={() => setFeedbackModal(null)} style={{ padding: '12px 20px' }}>Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* Voice message modal */}
      {voiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="glass-card" style={{ padding: 32, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>🎙️ Voice Messages</h3>
              <button onClick={() => setVoiceModal(null)} style={{ background: 'none', border: 'none', color: '#7c5fa0', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <p style={{ color: '#7c5fa0', fontSize: 13, marginBottom: 16 }}>Send a voice message to the user for pickup: <strong>{voiceModal.pickup_address?.slice(0, 40)}...</strong></p>

            {/* Existing messages */}
            {voiceMessages.length > 0 && (
              <div style={{ marginBottom: 20, maxHeight: 200, overflowY: 'auto' }}>
                <p style={{ fontSize: 12, color: '#7c5fa0', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Previous Messages</p>
                {voiceMessages.map(m => (
                  <div key={m.id} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#c084fc' }}>{m.sender_name}</span>
                      <span style={{ fontSize: 11, color: '#7c5fa0' }}>{new Date(m.created_at).toLocaleTimeString()}</span>
                    </div>
                    <audio controls src={`data:audio/webm;base64,${m.audio_data}`} style={{ width: '100%', height: 36 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Record new */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#b899d4', fontWeight: 600, marginBottom: 12 }}>Record New Message</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={recording ? stopRecording : startRecording}
                  style={{ padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                    background: recording ? 'rgba(248,113,113,0.2)' : 'rgba(147,51,234,0.2)',
                    border: recording ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(147,51,234,0.4)',
                    color: recording ? '#f87171' : '#c084fc' }}>
                  {recording ? '⏹️ Stop Recording' : '🔴 Start Recording'}
                </button>
                {recording && <span style={{ color: '#f87171', fontSize: 13, animation: 'pulse 1s infinite' }}>● Recording...</span>}
              </div>
              {audioBlob && (
                <div style={{ marginTop: 12 }}>
                  <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%', height: 36 }} />
                  <button className="btn-purple" onClick={sendVoiceMessage} style={{ marginTop: 10, width: '100%', padding: '12px' }}>
                    📤 Send Voice Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorQueuePage;
