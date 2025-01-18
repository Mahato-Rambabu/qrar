import axiosInstance from '../utils/axiosInstance';

export const fetchSliderImages = async (restaurantId) => {
  try {
    const response = await axiosInstance.get(`/imageSlider/${restaurantId}`);
    return response.data; // Return fetched slider images
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch slider images.');
  }
};
