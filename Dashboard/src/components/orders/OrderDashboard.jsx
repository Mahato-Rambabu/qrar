import React, { useState, useEffect, useRef } from "react";
import { fetchPendingOrders, updateOrderStatus } from "../orders/orderService";
import { useNavigate } from "react-router-dom";
import OrderTable from "../orders/OrderTable";
import { FaHistory } from "react-icons/fa";
import io from "socket.io-client";
import { toast } from "react-hot-toast";
import { History } from "lucide-react";

// Dynamically set the socket URL based on the environment
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
const socket = io(socketUrl);

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h"); // Default date range
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch orders on component mount or when dateRange changes
    const getOrders = async () => {
      try {
        const data = await fetchPendingOrders(dateRange);
        setOrders(Array.isArray(data) ? data : []); // Ensure it's always an array
      } catch (err) {
        setOrders([]); // Set an empty array on error
      }
    };

    getOrders();

    // Listen for new order events
    socket.on("order:created", (newOrder) => {
      const updatedOrder = {
        ...newOrder,
        customerName: newOrder.customerName || "Guest",
      };

      toast.success(`New order placed by ${updatedOrder.customerName}!`);
      setOrders((prevOrders) => [updatedOrder, ...prevOrders]);

      if (audioRef.current) {
        try {
          audioRef.current.play();
        } catch (error) {
          console.error("Audio playback failed:", error.message);
        }
      }
    });

    // Listen for order updates (e.g., when an order is rejected or served)
    socket.on("order:updated", (updatedOrder) => {
      // Remove the order if its status is no longer "Pending"
      if (updatedOrder.status.toLowerCase() !== "pending") {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== updatedOrder._id)
        );
      }
    });

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
    };
  }, [dateRange]);

  // Search filter
  const filteredOrders = orders.filter((order) => {
    const orderNo = order?.orderNo?.toString() || "";
    const customerName = order?.customerName?.toLowerCase() || "";
    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      orderNo.includes(searchQuery)
    );
  });

  // Event handlers
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleDateRangeChange = (e) => setDateRange(e.target.value);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}!`);

      // Remove the order from the list if its status is not "Pending"
      if (status.toLowerCase() !== "pending") {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
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
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
          onClick={() => navigate("/history")}
        >
          <History size={20} />
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

      {/* Audio element for notifications */}
      <audio ref={audioRef} src="/new_order.mp3" preload="auto" />
    </div>
  );
};

export default OrderDashboard;
