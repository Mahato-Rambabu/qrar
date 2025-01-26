import axios from 'axios';

// Dynamically load the base URL from environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com';

const axiosInstance = axios.create({
  baseURL, // Dynamically set baseURL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Ensure the token key is consistent
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
