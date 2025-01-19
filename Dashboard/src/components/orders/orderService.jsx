import axios from "axios";

const API_BASE_URL = "https://qrar.onrender.com/orders"; // Ensure the correct protocol is used (http/https)

// Function to get the token from localStorage or cookies
const getAuthToken = () => {
  return localStorage.getItem("authToken"); // Adjust if you store the token differently
};

export const fetchPendingOrders = async (dateRange) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { dateRange }, // Include date range as a query parameter
    });

    return Array.isArray(response.data) ? response.data : []; // Ensure it's always an array
  } catch (error) {
    console.error("Error fetching pending orders:", error.message);
    return []; // Return empty array on failure
  }
};

export const fetchOrderHistory = async (dateRange) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { dateRange },
    });

    console.log("API Response for Order History:", response.data);

    if (!response.data || !Array.isArray(response.data.orders)) {
      throw new Error("Invalid response format");
    }

    return response.data.orders; // Return the orders array
  } catch (error) {
    console.error("Error fetching order history:", error.message);
    return []; // Return empty array on failure
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(
      `${API_BASE_URL}/${orderId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error.message);
    throw error; // Re-throw the error for further handling
  }
};
