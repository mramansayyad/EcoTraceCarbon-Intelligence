import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback for local emulator tests or mocked states
        if (typeof window !== 'undefined') {
          const mockToken = localStorage.getItem('mock_token');
          if (mockToken) {
            config.headers.Authorization = `Bearer ${mockToken}`;
          }
        }
      }
    } catch (err) {
      console.warn('Axios Auth Interceptor failed to get ID Token:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
