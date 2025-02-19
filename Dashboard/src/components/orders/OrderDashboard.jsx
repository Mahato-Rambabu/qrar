import React, { useState, useEffect, useRef } from "react";
import { fetchPendingOrders, updateOrderStatus } from "../orders/orderService";
import { useNavigate } from "react-router-dom";
import OrderTable from "../orders/OrderTable";
import { FaHistory } from "react-icons/fa";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

// Dynamically set the socket URL based on the environment
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
const socket = io(socketUrl);

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h"); // Default date range
  const [modalOrder, setModalOrder] = useState(null); // For showing the modal
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch orders on mount or date range change
    const getOrders = async () => {
      try {
        const data = await fetchPendingOrders(dateRange);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setOrders([]);
      }
    };

    getOrders();

    // Listen for real-time new order events
    socket.on("order:created", (newOrder) => {
      const updatedOrder = {
        ...newOrder,
        customerName: newOrder.customerName || "Guest",
      };

      // Show modal to let operator accept or reject
      setModalOrder(updatedOrder);

      if (audioRef.current) {
        try {
          audioRef.current.play();
        } catch (error) {
          console.error("Audio playback failed:", error.message);
        }
      }
    });

    return () => {
      socket.off("order:created");
    };
  }, [dateRange]);

  // Called when the operator clicks "Accept Order" in the modal
const handleModalAccept = async (order) => {
  try {
    // Update order status to "Preparing" on the server.
    const updatedOrder = await updateOrderStatus(order._id, "Preparing");
    // Optionally update your local orders state if needed.
    setOrders((prevOrders) => [updatedOrder, ...prevOrders]);
    setModalOrder(null);
    toast.success(`New order ${order.orderNo} accepted!`);
  } catch (error) {
    console.error("Error accepting order:", error);
    toast.error("Failed to accept order.");
  }
};


  // Called when the operator clicks "Reject Order" in the modal
  const handleModalReject = async (order) => {
    try {
      await updateOrderStatus(order._id, "Rejected");
      toast.success(`Order ${order.orderNo} rejected!`);
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to reject order.");
    } finally {
      setModalOrder(null);
    }
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    const orderNo = order?.orderNo?.toString() || "";
    const customerName = order?.customerName?.toLowerCase() || "";
    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      orderNo.includes(searchQuery)
    );
  });

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleDateRangeChange = (e) => setDateRange(e.target.value);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}!`);

      // If the order is served or rejected, remove it from the list
      if (["Served", "Rejected"].includes(status)) {
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
      {/* Audio element for new order notification */}
      <audio ref={audioRef} src="/new_order.mp3" preload="auto"></audio>

      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <nav className="text-sm text-gray-500">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/")}>
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/orders")}>
            Orders
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Order Management</h1>
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

      {/* Order Request Confirmation Modal */}
      {modalOrder && (
        <OrderRequestConfirmationModal
          order={modalOrder}
          onAccept={handleModalAccept}
          onReject={handleModalReject}
        />
      )}
    </div>
  );
};

// Modal component with two actions: Accept & Reject
const OrderRequestConfirmationModal = ({ order, onAccept, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">New Order Request</h2>
        <p>
          <strong>Order No:</strong> {order.orderNo}
        </p>
        <p>
          <strong>Customer:</strong> {order.customerName || "Guest"}
        </p>
        <div className="mt-4">
          <h3 className="font-semibold">Items:</h3>
          <ul className="list-disc ml-5">
            {order.items.map((item) => (
              <li key={item.productId?._id || item.productId}>
                {item.productId?.name || "Unknown"} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4">
          <strong>Total:</strong> ₹{order.total.toFixed(2)}
        </p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-green-300 rounded"
            onClick={() => onAccept(order)}
          >
            Accept Order
          </button>
          <button
            className="px-4 py-2 bg-red-300 rounded"
            onClick={() => onReject(order)}
          >
            Reject Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
