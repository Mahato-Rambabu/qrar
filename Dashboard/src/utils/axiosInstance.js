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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized! Redirecting to login...');
      window.location.href = '/login'; // Redirect if not authenticated
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
