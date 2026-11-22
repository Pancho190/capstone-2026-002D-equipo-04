import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
const api = axios.create({
  baseURL: baseUrl ? `${baseUrl}/api` : '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;