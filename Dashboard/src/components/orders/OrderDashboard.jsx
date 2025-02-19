import React, { useState, useEffect, useRef } from "react";
import { fetchPendingOrders, updateOrderStatus } from "../orders/orderService";
import { useNavigate } from "react-router-dom";
import OrderTable from "../orders/OrderTable";
import { FaHistory } from "react-icons/fa";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

// Dynamically set the socket URL based on the environment
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001"; // Default to localhost for development
const socket = io(socketUrl);

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState(null); // New order pending confirmation
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h"); // Default date range
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = await fetchPendingOrders(dateRange);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setOrders([]);
      }
    };

    getOrders();

    // Socket event listener for new orders
    socket.on("order:created", (incomingOrder) => {
      const updatedOrder = {
        ...incomingOrder,
        customerName: incomingOrder.customerName || "Guest",
      };

      toast.success(`New order requested by ${updatedOrder.customerName}!`);
      setOrders((prevOrders) => [updatedOrder, ...prevOrders]);

      // Play notification audio
      if (audioRef.current) {
        try {
          audioRef.current.play();
        } catch (error) {
          console.error("Audio playback failed:", error.message);
        }
      }

      // Show confirmation modal for the new order
      setNewOrder(updatedOrder);
    });

    return () => {
      socket.off("order:created");
    };
  }, [dateRange]);

  // Search filter for orders
  const filteredOrders = orders.filter((order) => {
    const orderNo = order?.orderNo?.toString() || "";
    const customerName = order?.customerName?.toLowerCase() || "";
    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      orderNo.includes(searchQuery)
    );
  });

  // Event handlers for search and date range
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleDateRangeChange = (e) => setDateRange(e.target.value);

  // Handler for updating order status from within the dashboard table
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}!`);
      if (status.toLowerCase() === "served") {
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update status.");
    }
  };

  // Handlers for modal confirmation (for new orders)
  const handleConfirmOrder = async () => {
    if (!newOrder) return;
    try {
      // Update the order status to "Pending" on confirmation
      await updateOrderStatus(newOrder._id, "Pending");
      toast.success("Order accepted and set to pending!");
      // Remove the confirmed order from the list
      setOrders((prev) => prev.filter((order) => order._id !== newOrder._id));
      setNewOrder(null);
    } catch (err) {
      console.error("Error confirming order:", err);
      toast.error("Failed to confirm order.");
    }
  };

  const handleRejectOrder = async () => {
    if (!newOrder) return;
    try {
      // Update the order status to "Rejected"
      await updateOrderStatus(newOrder._id, "Rejected");
      toast.success("Order rejected!");
      setOrders((prev) => prev.filter((order) => order._id !== newOrder._id));
      setNewOrder(null);
    } catch (err) {
      console.error("Error rejecting order:", err);
      toast.error("Failed to reject order.");
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Audio Element */}
      <audio ref={audioRef} src="/new_order.mp3" preload="auto"></audio>

      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <nav className="text-sm text-gray-500">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/orders")}
          >
            Orders
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Order Management
        </h1>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:from-green-500 hover:to-blue-500 transition-all duration-300"
          onClick={() => navigate("/history")}
        >
          <FaHistory className="text-xl" />
          <span>View History</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-lg w-full"
        />
        <select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Order Table */}
      <OrderTable orders={filteredOrders} onUpdateStatus={handleUpdateStatus} />

      {/* Order Request Confirmation Modal (displayed only for new orders) */}
      {newOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              New Order Request
            </h2>
            <p className="text-gray-700 mb-6 text-center">
              Order #{newOrder.orderNo} has been requested by {newOrder.customerName}. Confirm to accept the order.
            </p>
            <div className="flex justify-around">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                onClick={handleRejectOrder}
              >
                ✕ Reject
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
                onClick={handleConfirmOrder}
              >
                ✓ Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDashboard;
