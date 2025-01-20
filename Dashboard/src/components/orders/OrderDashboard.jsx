import React, { useState, useEffect, useRef } from "react";
import { fetchPendingOrders, updateOrderStatus } from "../orders/orderService";
import { useNavigate } from "react-router-dom";
import OrderTable from "../orders/OrderTable";
import { FaHistory } from "react-icons/fa";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

const socket = io("https://qrar.onrender.com");

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h"); // Default date range
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const getOrders = async () => {
    try {
      const data = await fetchPendingOrders(dateRange);
      console.log("Fetched Orders:", data); // Debugging log
      if (!Array.isArray(data)) {
        console.error("API did not return an array:", data);
      }
      setOrders(Array.isArray(data) ? data : []); // Ensure it's always an array
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]); // Set an empty array to prevent .filter error
    }
  };

    getOrders();

    socket.on("order:created", (newOrder) => {
      toast.success(`New order placed by ${newOrder.customerName}!`);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);

      if (audioRef.current) {
        try {
          audioRef.current.play();
        } catch (error) {
          console.error("Audio playback failed:", error);
        }
      }
    });

    socket.on("order:updated", (updatedOrder) => {
      setOrders((prevOrders) =>
        updatedOrder.status === "Served"
          ? prevOrders.filter((order) => order._id !== updatedOrder._id)
          : prevOrders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order
            )
      );
    });

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
    };
  }, [dateRange]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}!`);
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update status.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderNo = order?.orderNo?.toString() || "";
    const customerName = order?.customerName?.toLowerCase() || "";
    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      orderNo.includes(searchQuery)
    );
  });

  return (
    <div className="p-6 bg-white min-h-screen">
      <audio ref={audioRef} src="/order-notification.mp3" preload="auto"></audio>
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
      <OrderTable orders={filteredOrders} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
};

export default OrderDashboard;
