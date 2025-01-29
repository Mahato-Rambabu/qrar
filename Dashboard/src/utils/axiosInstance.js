import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com';

console.log('Axios baseURL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Function to check if the current page is login or register
const isAuthPage = () => {
  return window.location.pathname === '/login' || window.location.pathname === '/register';
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !isAuthPage()) {
      console.warn('Unauthorized! Redirecting to login...');
      window.location.href = '/login'; // Redirect if NOT on login or register page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
