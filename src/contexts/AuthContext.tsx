import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, AuthState } from '../types';
import { authFetch, setAuthToken, clearAuthToken, getAuthToken } from '../utils/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.isAuthenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        if (!data.isAuthenticated && getAuthToken()) {
          clearAuthToken();
        }
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          setAuthToken(data.token);
        }
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Identifiants invalides' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur réseau de connexion' };
    }
  };

  const register = async (email: string, password: string, fullName: string, username?: string) => {
    try {
      const res = await authFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, username }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          setAuthToken(data.token);
        }
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Erreur lors de la création du compte' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur réseau' };
    }
  };

  const logout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
