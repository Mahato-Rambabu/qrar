import axios from 'axios';

// Dynamically load the base URL from environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com';

const axiosInstance = axios.create({
  baseURL, // Dynamically set baseURL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor to handle cookies
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if cookies are available (optional logic for manual handling)
    const hasCookie = document.cookie.split('; ').find((row) => row.startsWith('authToken='));
    if (!hasCookie) {
      console.warn('No authentication cookie found.');
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
      // If unauthorized, redirect to login
      console.error('Unauthorized. Redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
