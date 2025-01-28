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
axiosInstance.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1]; // Extract token from cookies

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Add token to headers
    } else {
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
