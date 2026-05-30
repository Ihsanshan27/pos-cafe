import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, settingsApi } from '../lib/api';
import type { AuthUser } from '../lib/api';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const isManagerOrOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OWNER' | 'MANAGER' | 'CASHIER' | 'BARISTA'>('CASHIER');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });

  const { data: allowRegistration = true } = useQuery({
    queryKey: ['settings', 'allow-registration'],
    queryFn: async () => {
      const res = await settingsApi.getAllowRegistration();
      return res.allowed;
    }
  });

  const toggleRegMut = useMutation({
    mutationFn: (allowed: boolean) => settingsApi.setAllowRegistration(allowed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'allow-registration'] }),
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('CASHIER');
    setEditingUser(null);
  };

  const createMut = useMutation({
    mutationFn: () => userApi.create({ name, email, password, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Error creating user')
  });

  const updateMut = useMutation({
    mutationFn: () => userApi.update(editingUser!.id, { name, email, role, ...(password ? { password } : {}) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Error updating user')
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (!isManagerOrOwner) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <p>Access Denied. Owner or Manager only.</p>
        </div>
      </div>
    );
  }

  const handleEdit = (u: AuthUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPassword('');
    setIsModalOpen(true);
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Staff Management</h2>
          <p>Manage system users and cashiers</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Public Registration:</span>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={allowRegistration} 
                onChange={(e) => toggleRegMut.mutate(e.target.checked)} 
                disabled={toggleRegMut.isPending}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', color: allowRegistration ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                {allowRegistration ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="empty-state"><Users /><p>Loading users...</p></div>
        ) : (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'OWNER' ? 'badge-primary' : 'badge-secondary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.4rem', borderRadius: '0.4rem' }}
                          onClick={() => handleEdit(u)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '0.4rem', borderRadius: '0.4rem' }}
                          onClick={() => { if(confirm('Delete this user?')) deleteMut.mutate(u.id) }}
                          disabled={deleteMut.isPending || u.id === currentUser?.id}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 700 }}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="form-label">Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-input" value={role} onChange={(e) => setRole(e.target.value as any)}>
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="CASHIER">CASHIER</option>
                  <option value="BARISTA">BARISTA</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => editingUser ? updateMut.mutate() : createMut.mutate()} 
                disabled={(!editingUser && (!name || !email || !password)) || (editingUser && (!name || !email)) || createMut.isPending || updateMut.isPending}
              >
                {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
