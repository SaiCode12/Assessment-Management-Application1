import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchUser = async () => {
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me'); // 👈 NEW API
        setUser(res.data);

        // optional: sync localStorage
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        logout(); // token invalid
      }
    }
    setLoading(false);
  };

  fetchUser();
}, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };
const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);

  setUser(res.data.user); // 🔥 updates whole app instantly
  localStorage.setItem('user', JSON.stringify(res.data.user));

  return res.data;
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuth: !!token ,updateProfile}}>
      {children}
    </AuthContext.Provider>
  );
};
