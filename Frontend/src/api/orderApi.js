import axiosInstance from '../utils/axiosInstance';

// Place a new order
export const placeOrder = async (items, total, userDetails, restaurantId) => {
    try {
        const customerIdentifier = localStorage.getItem('customerIdentifier'); // Get customer identifier

        const response = await axiosInstance.post(`/orders/${restaurantId}`, {
            items,
            total,
            userDetails,
            customerIdentifier, // Include customer identifier
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
        const customerIdentifier = localStorage.getItem('customerIdentifier'); // Get customer identifier

        const response = await axiosInstance.get(`/orders/${restaurantId}`, {
            params: { customerIdentifier }, // Include customer identifier as a query parameter
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent orders:', error.message);
        throw error;
    }
};
