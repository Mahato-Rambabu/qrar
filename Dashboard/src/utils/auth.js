// utils/auth.js
export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    // Add more checks if necessary (e.g., token decoding, expiry check)
    return !!token; // Returns true if the token exists
  };
  