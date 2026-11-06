import axios from 'axios';

// Detect if running in local development or cloud production
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

const API_BASE_URL = isLocalhost
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  : (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost') 
      ? import.meta.env.VITE_API_URL 
      : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected route, clear stored session
      if (window.location.pathname.startsWith('/dashboard')) {
        localStorage.removeItem('cp_token');
        localStorage.removeItem('cp_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

