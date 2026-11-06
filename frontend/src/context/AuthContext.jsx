import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('cp_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cp_token'));
  const [loading, setLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('cp_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification note:', err.message);
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, token: userToken } = res.data;
      if (userData && userToken) {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('cp_user', JSON.stringify(userData));
        localStorage.setItem('cp_token', userToken);
        return userData;
      }
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async (fullName, email, password) => {
    const res = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password
    });
    if (res.data.success) {
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('cp_user', JSON.stringify(userData));
      localStorage.setItem('cp_token', userToken);
      return userData;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Proceed with local logout regardless of network
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cp_user');
      localStorage.removeItem('cp_token');
    }
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('cp_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data.error || 'Failed to update profile');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor',
    isAuthor: user?.role === 'author',
    canPublish: ['admin', 'editor'].includes(user?.role),
    canManageUsers: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

