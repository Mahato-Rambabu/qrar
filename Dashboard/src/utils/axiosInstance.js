import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Ensure the token key is consistent
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token:', token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
