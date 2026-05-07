import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      const { data } = await API.get(`/admin/users?${params}`);
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, role, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUser = async (id, name) => {

    try {
      await API.put(`/admin/users/${id}/toggle`);
      toast.success(`User ${name} status toggled`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const roleColor = { household: '#22d3ee', collector: '#c084fc', admin: '#fbbf24' };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">👥 Users</h1>
          <p className="section-subtitle">{total} total registered</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input-glass" placeholder="🔍 Search name, email, phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers()}
          style={{ maxWidth: 280 }} />
        <select className="input-glass" value={role} onChange={e => { setRole(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
          <option value="">All Roles</option>
          <option value="household">Household</option>
          <option value="collector">Collector</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn-purple" onClick={fetchUsers} style={{ padding: '12px 20px' }}>Search</button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>District</th><th>Points</th><th>Pickups</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ fontSize: 13, color: '#7c5fa0' }}>{u.email}</td>
                  <td style={{ fontSize: 13 }}>{u.phone}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                      background: `${roleColor[u.role]}20`, color: roleColor[u.role],
                      border: `1px solid ${roleColor[u.role]}40`, textTransform: 'capitalize'
                    }}>{u.role}</span>
                  </td>
                  <td style={{ fontSize: 13, color: '#7c5fa0' }}>{u.district || '-'}</td>
                  <td style={{ color: '#c084fc', fontWeight: 700 }}>{u.total_points}</td>
                  <td style={{ color: '#22d3ee' }}>{u.total_pickups}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                      background: u.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                      color: u.is_active ? '#4ade80' : '#f87171',
                      border: `1px solid ${u.is_active ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`
                    }}>{u.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleUser(u.id, u.full_name)}
                        style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                          background: u.is_active ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                          border: u.is_active ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(74,222,128,0.3)',
                          color: u.is_active ? '#f87171' : '#4ade80'
                        }}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 15 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 20px' }}>← Prev</button>
          <span style={{ color: '#7c5fa0', padding: '8px 16px' }}>Page {page} of {Math.ceil(total / 15)}</span>
          <button className="btn-outline" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)} style={{ padding: '8px 20px' }}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
