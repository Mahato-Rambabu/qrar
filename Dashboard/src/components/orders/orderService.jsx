import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () => localStorage.getItem("authToken");

export const fetchPendingOrders = async (dateRange) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/orders/pending`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { dateRange }
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching pending orders:", error.message);
    return [];
  }
};

export const fetchOrderHistory = async (dateRange) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/orders/history`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { dateRange }
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching order history:", error.message);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error.message);
    throw error;
  }
};
