import axios from "axios";

const API_BASE_URL = "qrar.onrender.com/orders";

// Function to get the token from localStorage or cookies
const getAuthToken = () => {
  return localStorage.getItem("authToken"); // Adjust if you store the token differently
};

export const fetchPendingOrders = async (dateRange) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      dateRange, // Include date range as a query parameter
    },
  });
  console.log("API Response:", response.data); 
  return response.data;
};

export const fetchOrderHistory = async (dateRange) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      dateRange, // Include date range as a query parameter
    },
  });
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
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
};
