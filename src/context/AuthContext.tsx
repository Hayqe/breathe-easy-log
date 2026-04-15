/* Auth context - provides user state and auth methods */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { api } from '@/lib/api';
import { checkMockMode, isMockMode, MOCK_USER } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mockMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    checkMockMode().then((mock) => {
      setMockMode(mock);
      const token = localStorage.getItem('auth_token');
      if (token) {
        if (mock) {
          setUser(MOCK_USER);
          setLoading(false);
        } else {
          api.auth.me()
            .then(setUser)
            .catch(() => localStorage.removeItem('auth_token'))
            .finally(() => setLoading(false));
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.auth.login(email, password);
    localStorage.setItem('auth_token', token);
    setUser(user);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const { token, user } = await api.auth.register(email, password, displayName);
    localStorage.setItem('auth_token', token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mockMode, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
