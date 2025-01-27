// utils/auth.js
import Cookies from 'js-cookie'; // Install this library with `npm install js-cookie`

export const isAuthenticated = () => {
  const token = Cookies.get('authToken'); // Retrieve the token from cookies
  return !!token; // Returns true if the token exists
};
