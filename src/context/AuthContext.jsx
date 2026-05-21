import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchMe, login as apiLogin, signup as apiSignup,
  logout as apiLogout, getToken, clearToken, onUnauthorized,
} from '@/lib/api.js';

/**
 * AuthContext — global source of truth for the current user + JWT.
 *
 * States:
 *   - status: 'loading' | 'authenticated' | 'guest'
 *   - user:   the user object (with .role) or null
 *
 * On mount, if a token exists we rehydrate by calling /api/auth/me. On 401
 * from anywhere in the app, we flush state back to guest.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'guest'

  // Initial bootstrap — if we have a token, try to resolve it; otherwise guest.
  useEffect(() => {
    let alive = true;
    async function boot() {
      const token = getToken();
      if (!token) {
        if (alive) setStatus('guest');
        return;
      }
      try {
        const u = await fetchMe();
        if (!alive) return;
        setUser(u);
        setStatus('authenticated');
      } catch {
        if (!alive) return;
        clearToken();
        setUser(null);
        setStatus('guest');
      }
    }
    boot();
    return () => { alive = false; };
  }, []);

  // Listen for global 401s.
  useEffect(() => {
    const off = onUnauthorized(() => {
      clearToken();
      setUser(null);
      setStatus('guest');
    });
    return off;
  }, []);

  const login = useCallback(async (creds) => {
    const { user: u } = await apiLogin(creds);
    setUser(u);
    setStatus('authenticated');
    return u;
  }, []);

  const signup = useCallback(async (creds) => {
    const { user: u } = await apiSignup(creds);
    setUser(u);
    setStatus('authenticated');
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setStatus('guest');
  }, []);

  const refresh = useCallback(async () => {
    try {
      const u = await fetchMe();
      setUser(u);
      setStatus('authenticated');
      return u;
    } catch {
      setUser(null);
      setStatus('guest');
      return null;
    }
  }, []);

  // Allow optimistic updates from settings page.
  const setLocalUser = useCallback((u) => setUser(u), []);

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isAdmin: status === 'authenticated' && user?.role === 'admin',
    login,
    signup,
    logout,
    refresh,
    setLocalUser,
  }), [user, status, login, signup, logout, refresh, setLocalUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
