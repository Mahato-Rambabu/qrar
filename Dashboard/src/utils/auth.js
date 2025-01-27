import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode'; // Install with `npm install jwt-decode`

export const isAuthenticated = () => {
  const token = Cookies.get('authToken');

  if (!token) return false; // No token means not authenticated

  try {
    const decoded = jwt_decode(token); // Decode the token
    const isTokenExpired = decoded.exp * 1000 < Date.now(); // Check expiry

    return !isTokenExpired; // Return false if expired
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
};
