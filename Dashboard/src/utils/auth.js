import Cookies from 'js-cookie';

export const isAuthenticated = () => {
  return document.cookie.includes('authToken'); // ✅ Only checks if token exists
};

