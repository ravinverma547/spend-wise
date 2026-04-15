import axios from 'axios';

const api = axios.create({
  // Use the env variable if available, otherwise fallback to local dev URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
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
