import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('swms_token');
    const stored = localStorage.getItem('swms_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      // Refresh from server
      API.get('/auth/me').then(r => {
        setUser(r.data.data);
        localStorage.setItem('swms_user', JSON.stringify(r.data.data));
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('swms_token', data.data.token);
    localStorage.setItem('swms_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('swms_token', data.data.token);
    localStorage.setItem('swms_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('swms_token');
    localStorage.removeItem('swms_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await API.get('/auth/me');
    setUser(data.data);
    localStorage.setItem('swms_user', JSON.stringify(data.data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
