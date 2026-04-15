import axios from 'axios';

// Process the base URL to ensure it ends with /api/v1
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// This ensures that even if the user forgets /api/v1 in Render settings, we add it. 
// If they already included it, we don't double it.
const baseURL = rawBaseURL.endsWith('/api/v1') 
  ? rawBaseURL 
  : `${rawBaseURL.replace(/\/$/, '')}/api/v1`;

const api = axios.create({
  baseURL,
});

// Add token to headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
