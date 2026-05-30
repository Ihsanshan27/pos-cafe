import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Lock, CheckCircle, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth(); // We can re-use login or just update localStorage manually? Wait, AuthContext doesn't have `updateUser`.
  // Wait, if we change the name, we might need to refresh the page or update localStorage user.
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateProfileMut = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update local storage user data
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Force reload to update context across the app
        window.location.reload();
      }
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to update profile', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { name, email };
    if (password) {
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      payload.password = password;
    }
    updateProfileMut.mutate(payload);
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2>Pengaturan Akun</h2>
        <p>Kelola data profil dan keamanan akun Anda</p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <UserIcon size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Profil {user?.role}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Perbarui informasi dasar Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} /> Password Baru
            </label>
            <input 
              type="password" 
              className="input" 
              placeholder="Biarkan kosong jika tidak ingin mengubah password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={updateProfileMut.isPending}
            >
              {updateProfileMut.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
