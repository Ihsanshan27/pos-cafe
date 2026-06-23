import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../lib/api';
import {
  authApi,
  clearStoredAccessToken,
  clearStoredUser,
  getStoredAccessToken,
  getStoredUser,
  settingsApi,
  storeAccessToken,
  storeUser,
} from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = getStoredUser();
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    getStoredAccessToken(),
  );
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(120);

  const login = (newToken: string, newUser: AuthUser) => {
    storeAccessToken(newToken);
    storeUser(JSON.stringify(newUser));
    localStorage.setItem('last_activity_at', String(Date.now()));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (nextUser: AuthUser) => {
    storeUser(JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    clearStoredAccessToken();
    clearStoredUser();
    localStorage.removeItem('last_activity_at');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    settingsApi
      .getSetting('SESSION_TIMEOUT_MINUTES')
      .then((res) => {
        const parsed = Number(res.value ?? '120');
        setSessionTimeoutMinutes(Number.isFinite(parsed) && parsed >= 0 ? parsed : 120);
      })
      .catch(() => setSessionTimeoutMinutes(120));
  }, []);

  useEffect(() => {
    if (!token) return;

    authApi
      .me()
      .then((nextUser) => {
        storeUser(JSON.stringify(nextUser));
        setUser(nextUser);
      })
      .catch(() => {
        logout();
      });
  }, [token]);

  useEffect(() => {
    if (!token || sessionTimeoutMinutes <= 0) return;

    const updateActivity = () => {
      localStorage.setItem('last_activity_at', String(Date.now()));
    };

    if (!localStorage.getItem('last_activity_at')) {
      updateActivity();
    }

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, updateActivity, { passive: true }));

    const intervalId = window.setInterval(() => {
      const lastActivity = Number(localStorage.getItem('last_activity_at') ?? '0');
      const timeoutMs = sessionTimeoutMinutes * 60 * 1000;

      if (lastActivity > 0 && Date.now() - lastActivity >= timeoutMs) {
        localStorage.setItem('session_timeout_message', 'Sesi berakhir karena tidak ada aktivitas.');
        logout();
      }
    }, 30_000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, updateActivity));
      window.clearInterval(intervalId);
    };
  }, [token, sessionTimeoutMinutes]);

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
