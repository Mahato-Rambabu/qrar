import axiosInstance from '../utils/axiosInstance';

// Fetch categories API call
export const fetchCategories = async (restaurantId) => {
  if (!restaurantId) {
    throw new Error('restaurantId is required.');
  }
  try {
    const response = await axiosInstance.get(`/categories/${restaurantId}`);
    return response.data; // Return fetched categories
  } catch (err) {
    console.error('Error fetching categories:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Failed to fetch categories.');
  }
};

