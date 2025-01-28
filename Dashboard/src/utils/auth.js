import Cookies from 'js-cookie';

export const isAuthenticated = () => {
  const token = Cookies.get('authToken');
  return !!token; // Return true if token exists, false otherwise
};
