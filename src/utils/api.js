import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('swms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('swms_token');
      localStorage.removeItem('swms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
