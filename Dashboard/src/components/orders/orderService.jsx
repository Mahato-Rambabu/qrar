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
  try {
    const response = await fetch(`${API_BASE_URL}/orders/history?dateRange=${dateRange}`);
    const data = await response.json();

    return Array.isArray(data) ? data : []; // Ensure it's always an array
  } catch (error) {
    console.error("Error fetching order history:", error);
    return []; // Return empty array on failure
  }
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
