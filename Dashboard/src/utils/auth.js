import Cookies from 'js-cookie';

export const isAuthenticated = () => {
  const token = Cookies.get('authToken');

  if (!token) return false; // No token means not authenticated
};
