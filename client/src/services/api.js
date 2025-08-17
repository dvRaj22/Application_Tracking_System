import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  applications: {
    list: '/applications',
    create: '/applications',
    update: (id) => `/applications/${id}`,
    delete: (id) => `/applications/${id}`,
    updateStatus: (id) => `/applications/${id}/status`,
  },
  analytics: {
    dashboard: '/analytics/dashboard',
    roles: '/analytics/roles',
    experience: '/analytics/experience',
    timeline: '/analytics/timeline',
  },
};

export default api;
