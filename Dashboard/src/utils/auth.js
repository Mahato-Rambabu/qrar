import axiosInstance from './axiosInstance';

export const isAuthenticated = async () => {
  try {
    await axiosInstance.get('/restaurants/profile'); // Replace with your actual auth check endpoint
    return true;
  } catch (error) {
    return false;
  }
};
