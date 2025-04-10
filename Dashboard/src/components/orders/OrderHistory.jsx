import React, { useState, useEffect } from "react";
import { fetchOrderHistory } from "../orders/orderService";
import { useNavigate } from "react-router-dom";
import OrderTable from "../orders/OrderTable";
import { FaArrowLeft } from "react-icons/fa";
import { io } from "socket.io-client";
import { CornerUpLeft } from "lucide-react";

// Dynamically set the socket URL based on the environment
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001"; // Default to localhost for development

const socket = io(socketUrl);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h");
  const navigate = useNavigate();

  useEffect(() => {
    const getOrderHistory = async () => {
      try {
        const data = await fetchOrderHistory(dateRange);
        console.log("Fetched Order History:", data);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch order history:", err.message);
      }
    };

    getOrderHistory();

    socket.on("order:updated", (updatedOrder) => {
      console.log("Socket Update Received:", updatedOrder);
      if (updatedOrder.status === "Served") {
        setOrders((prevOrders) => [updatedOrder, ...prevOrders]);
      }
    });

    return () => {
      socket.off("order:updated");
    };
  }, [dateRange]);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleDateRangeChange = (e) => setDateRange(e.target.value);

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const orderNo = order?.orderNo?.toString() || "";
        const customerName = order?.customerName?.toLowerCase() || "";
        return (
          customerName.includes(searchQuery.toLowerCase()) ||
          orderNo.includes(searchQuery)
        );
      })
    : [];

  return (
    <div className="p-6 bg-white min-h-screen">
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
          <span className="mx-2">/</span>
          <span className="cursor-pointer">History</span>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Previous Orders</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
          onClick={() => navigate("/orders")}
        >
          <CornerUpLeft size={20} />
          <span>Go Back</span>
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search history..."
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

      {filteredOrders.length > 0 ? (
        <OrderTable orders={filteredOrders} isHistory={true} />
      ) : (
        <p className="text-center text-gray-500">No orders found.</p>
      )}
    </div>
  );
};

export default OrderHistory;
