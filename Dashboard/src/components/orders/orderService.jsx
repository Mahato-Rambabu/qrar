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
    // console.log("Fetching pending orders with dateRange:", dateRange);
    
    const response = await axiosInstance.get(`${API_BASE_URL}/orders/pending`, {
      params: { dateRange }
    });

    // Log the response data to debug product values
    // console.log("Pending orders response:", response.data);
    
    // Ensure product data is properly populated
    const orders = Array.isArray(response.data) ? response.data : [];
    
    // Log each order's items to check product data
    // orders.forEach((order, index) => {
    //   console.log(`Order #${index + 1} items:`, order.items);
      
    //   // Log financial information
    //   console.log(`Order #${index + 1} financial info:`, {
    //     itemsTotal: order.itemsTotal,
    //     discount: order.discount,
    //     gst: order.gst,
    //     finalTotal: order.finalTotal,
    //     serviceCharge: order.serviceCharge,
    //     packingCharge: order.packingCharge,
    //     deliveryCharge: order.deliveryCharge
    //   });
      
    //   order.items.forEach((item, itemIndex) => {
    //     console.log(`  Item #${itemIndex + 1}:`, {
    //       productId: item.productId?._id,
    //       productName: item.productId?.name,
    //       productPrice: item.productId?.price,
    //       quantity: item.quantity
    //     });
    //   });
    // });

    return orders;
  } catch (error) {
    console.error("Error fetching pending orders:", error.message);
    return [];
  }
};

export const fetchOrderHistory = async (dateRange) => {
  try {
    console.log("Fetching order history with dateRange:", dateRange);
    
    const response = await axiosInstance.get(`${API_BASE_URL}/orders/history`, {
      params: { dateRange }
    });

    // Log the response data to debug product values
    console.log("Order history response:", response.data);
    
    // Ensure product data is properly populated
    const orders = Array.isArray(response.data) ? response.data : [];
    
    // Log each order's items to check product data
    // orders.forEach((order, index) => {
    //   console.log(`Order #${index + 1} items:`, order.items);
      
    //   // Log financial information
    //   console.log(`Order #${index + 1} financial info:`, {
    //     itemsTotal: order.itemsTotal,
    //     discount: order.discount,
    //     gst: order.gst,
    //     finalTotal: order.finalTotal,
    //     serviceCharge: order.serviceCharge,
    //     packingCharge: order.packingCharge,
    //     deliveryCharge: order.deliveryCharge
    //   });
      
    //   order.items.forEach((item, itemIndex) => {
    //     console.log(`  Item #${itemIndex + 1}:`, {
    //       productId: item.productId?._id,
    //       productName: item.productId?.name,
    //       productPrice: item.productId?.price,
    //       quantity: item.quantity
    //     });
    //   });
    // });

    return orders;
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
