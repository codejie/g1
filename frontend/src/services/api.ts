import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Added /api prefix
});

api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  // Bypass token for login and register routes
  if (config.url !== '/user/login' && config.url !== '/user/register') {
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
  }
  return config;
});

export default api;
