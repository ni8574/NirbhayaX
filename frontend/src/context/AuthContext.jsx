import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nirbhaya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('nirbhaya_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token to localStorage and fetch user
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('nirbhaya_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('nirbhaya_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (data) => {
    const { token: receivedToken, user: receivedUser } = data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('nirbhaya_token', receivedToken);
    localStorage.setItem('nirbhaya_user', JSON.stringify(receivedUser));
    setError(null);
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data?.success) {
        handleAuthSuccess(res.data);
        return { success: true };
      }
      throw new Error(res.data?.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(formData);
      if (res.data?.success) {
        handleAuthSuccess(res.data);
        return { success: true };
      }
      throw new Error(res.data?.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.demoLogin(role);
      if (res.data?.success) {
        handleAuthSuccess(res.data);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.data?.message || 'Demo login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Demo login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nirbhaya_token');
    localStorage.removeItem('nirbhaya_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await authAPI.getMe();
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('nirbhaya_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        error,
        login,
        register,
        demoLogin,
        logout,
        refreshUser
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

