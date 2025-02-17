import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const token = localStorage.getItem('authToken');

console.log('Axios baseURL:', baseURL);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com',
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Function to check if the current page is login or register
const isAuthPage = () => {
  return window.location.pathname === '/login' || window.location.pathname === '/register';
};

// Example Axios interceptor
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401 && !isAuthPage()) {
//       console.warn('Unauthorized! Redirecting to login...');
//       window.location.href = '/login'; // Redirect if NOT on login or register page
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;