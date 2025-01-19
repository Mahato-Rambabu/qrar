import React, { useState, useEffect } from "react";
import { fetchOrderHistory } from "../orders/orderService";
import { useNavigate } from "react-router-dom";
import OrderTable from "../orders/OrderTable";
import { FaArrowLeft } from "react-icons/fa";
import { io } from "socket.io-client";

const socket = io("qrar.onrender.com");

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h"); // Default date range
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching order history with dateRange:", dateRange);
    const getOrderHistory = async () => {
      try {
        const data = await fetchOrderHistory(dateRange); // Pass date range
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
      }
    };
    getOrderHistory();
  
    socket.on("order:updated", (updatedOrder) => {
      if (updatedOrder.status === "Served") {
        setOrders((prevOrders) => [updatedOrder, ...prevOrders]);
      }
    });
  
    return () => {
      socket.off("order:updated");
    };
  }, [dateRange]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

 const filteredOrders = Array.isArray(orders) ? orders.filter((order) => {
  const orderNo = order?.orderNo?.toString() || "";
  const customerName = order?.customerName?.toLowerCase() || "";
  return (
    customerName.includes(searchQuery.toLowerCase()) ||
    orderNo.includes(searchQuery)
  );
}) : [];


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
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/history")}
          >
            History
          </span>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Previous Orders</h1>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-md hover:from-orange-500 hover:to-red-500 transition-all duration-300"
          onClick={() => navigate("/orders")}
        >
          <FaArrowLeft className="text-xl" />
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

      <OrderTable orders={filteredOrders} isHistory={true} />
    </div>
  );
};

export default OrderHistory;
