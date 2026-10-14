import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorMessage = (err) => {
  const m = err.response?.data?.message;
  return Array.isArray(m) ? m.join(', ') : (m ?? 'Erreur réseau');
};

export default api;
