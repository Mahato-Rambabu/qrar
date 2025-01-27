import axios from "axios";
import Cookies from 'js-cookie'; // Import js-cookie
import axiosInstance from "../../utils/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export const fetchPendingOrders = async (dateRange) => {
  try {

    const response = await axiosInstance.get(`${API_BASE_URL}/orders/pending`, {
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

    const response = await axiosInstance.get(`${API_BASE_URL}/orders/history`, {
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
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/orders/${orderId}`,
      { status },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error.message);
    throw error;
  }
};
