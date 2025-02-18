import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Log requests for debugging purposes
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Log responses for debugging purposes
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
