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
    // Get the token from localStorage (or other storage)
    const token = localStorage.getItem("token");

    // Ensure the token exists
    if (!token) {
      throw new Error("Authorization token not found. Please log in again.");
    }

    const response = await axios.get(`${API_BASE_URL}/orders/history`, {
      params: { dateRange },
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the request
      },
    });

    console.log("Raw API Response:", response.data);

    // Validate the response structure
    if (response.data && Array.isArray(response.data.orders)) {
      return response.data.orders;
    }

    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Error fetching order history:", error.message);
    return []; // Return an empty array to prevent breaking the UI
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
