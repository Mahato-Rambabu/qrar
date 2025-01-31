import axiosInstance from '../utils/axiosInstance';

// Place a new order
export const placeOrder = async (items, total, restaurantId) => {
    try {
      const customerIdentifier = localStorage.getItem('customerIdentifier');
      
      const response = await axiosInstance.post(`/orders/${restaurantId}`, {
        items,
        total,
        customerIdentifier,
      });
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error.message);
      throw error;
    }
  };

// Fetch recent orders for a specific restaurant
export const fetchRecentOrders = async (restaurantId) => {
    try {
      const customerIdentifier = localStorage.getItem('customerIdentifier');
      
      const response = await axiosInstance.get(`/orders/${restaurantId}`, {
        params: { customerIdentifier },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error.message);
      throw error;
    }
  };
