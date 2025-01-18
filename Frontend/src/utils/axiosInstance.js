import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  withCredentials: true, // Ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Log requests for debugging purposes
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request Config:', config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Log responses for debugging purposes
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
