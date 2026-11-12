import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('notes_auth_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('notes_auth_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('notes_auth_token');
    localStorage.removeItem('notes_auth_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('notes_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('notes_auth_user', JSON.stringify(res.user));
        } else {
          logout();
        }
      } catch (err) {
        if (err.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('notes_auth_token', res.token);
      localStorage.setItem('notes_auth_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res.success && res.token) {
      localStorage.setItem('notes_auth_token', res.token);
      localStorage.setItem('notes_auth_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

