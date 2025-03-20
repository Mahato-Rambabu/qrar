import axiosInstance from "../../utils/axiosInstance";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const handleDownloadAllOrders = () => {
  if (orders.length === 0) {
    toast.error("No orders to download.");
    return;
  }

  const csvContent = Papa.unparse(
    orders.map((order) => ({
      "Order No": order.orderNo,
      "Customer Name": order.customerName || "Guest",
      Items: order.items
        .map((item) => `${item.productId?.name || "Unknown"} x${item.quantity}`)
        .join("; "),
      Total: `₹${order.total.toFixed(2)}`,
      Status: order.status,
      Date: new Date(order.createdAt).toLocaleDateString(),
    }))
  );

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `orders-${dateRange}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const fetchPendingOrders = async (dateRange) => {
  try {

    const response = await axiosInstance.get(`${API_BASE_URL}/orders/pending`, {
      params: { dateRange }
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // console.error("Error fetching pending orders:", error.message);
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
    // console.error("Error fetching order history:", error.message);
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
    // console.error("Error updating order status:", error.message);
    throw error;
  }
};
