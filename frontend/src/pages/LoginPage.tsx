import { useEffect, useState } from 'react';
import { authApi, resolveMediaUrl } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAppPublicSettings } from '../hooks/useAppPublicSettings';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { storeName, storePhone, storeLogoUrl, allowRegistration: allowRegistrationSetting } = useAppPublicSettings();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allowRegistration, setAllowRegistration] = useState(true);

  useEffect(() => {
    setAllowRegistration(allowRegistrationSetting);
  }, [allowRegistrationSetting]);

  useEffect(() => {
    const timeoutMessage = localStorage.getItem('session_timeout_message');
    if (timeoutMessage) {
      setError(timeoutMessage);
      localStorage.removeItem('session_timeout_message');
    }
  }, []);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(loginForm);
      login(res.accessToken, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(regForm);
      setTab('login');
      setLoginForm({ email: regForm.email, password: '' });
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '-30%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {storeLogoUrl ? (
            <img
              className="brand-logo-image"
              src={resolveMediaUrl(storeLogoUrl)}
              alt={storeName}
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                margin: '0 auto',
                marginBottom: '1rem',
                boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                background: 'white',
                border: '1px solid var(--border)',
              }}
            />
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                marginBottom: '1rem',
              }}
            >
              <ChefHat size={28} color="white" />
            </div>
          )}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{storeName}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {storePhone ? `Restaurant Management System - ${storePhone}` : 'Restaurant Management System'}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
              padding: '3px',
              marginBottom: '1.5rem',
              border: '1px solid var(--border)',
            }}
          >
            {(allowRegistration ? ['login', 'register'] : ['login']).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t as 'login' | 'register');
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? 'white' : 'var(--text-muted)',
                  boxShadow: tab === t ? '0 2px 8px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--danger)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@restaurant.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: 'calc(50% + 0.5rem)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                id="login-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                <LogIn size={16} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {tab === 'register' && allowRegistration && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="john@restaurant.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button
                id="register-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          {storeName} &copy; 2024 - Restaurant Management System
        </p>
      </div>
    </div>
  );
}
