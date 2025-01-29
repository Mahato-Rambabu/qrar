import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com';

console.log('Axios baseURL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔥 Ensure Cookies Are Sent
});

// Debug: Log the request headers before sending requests
axiosInstance.interceptors.request.use((request) => {
  console.log("Axios Request Headers:", request.headers);
  return request;
});

// Axios Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Axios Error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.warn('Unauthorized! Redirecting to login...');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
