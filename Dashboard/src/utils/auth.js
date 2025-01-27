import axiosInstance from './axiosInstance';

export const isAuthenticated = async () => {
  try {
    // Send a request to the backend to check authentication
    const response = await axiosInstance.get('/restaurants/check-auth', {
      withCredentials: true, // ✅ Ensures cookies are sent
    });

    return response.data.authenticated; // Expecting { authenticated: true/false }
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};
