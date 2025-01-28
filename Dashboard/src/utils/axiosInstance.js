import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com';

console.log('Axios baseURL:', baseURL);

const axiosInstance = axios.create({
  baseURL, // Dynamically set baseURL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor to handle cookies or add Authorization header
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Unauthorized detected. Redirecting...');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Unauthorized. Please log in.');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden.');
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('Unexpected error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
