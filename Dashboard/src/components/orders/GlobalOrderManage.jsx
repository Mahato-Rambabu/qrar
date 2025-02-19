import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { toast } from "react-hot-toast";
import { updateOrderStatus } from "./orderService"; // adjust path as needed

// Dynamically set the socket URL based on the environment
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
const socket = io(socketUrl);

const GlobalOrderManage = () => {
  const [modalOrder, setModalOrder] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Listen for new order events (global for the dashboard)
    socket.on("order:created", (newOrder) => {
      const order = {
        ...newOrder,
        customerName: newOrder.customerName || "Guest",
      };

      // Show the modal for the new order
      setModalOrder(order);

      // Play the notification audio
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) =>
            console.warn("Audio playback prevented:", err.message)
          );
      }
    });

    return () => {
      socket.off("order:created");
    };
  }, []);

  // Called when operator accepts the order
  const handleAccept = async (order) => {
    try {
      // Even though the status remains "Pending", we call updateOrderStatus
      // so that updatedAt changes and a socket event is emitted.
      const updatedOrder = await updateOrderStatus(order._id, "Pending");
      toast.success(`New order ${order.orderNo} accepted!`);
      setModalOrder(null);
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order.");
    }
  };

  // Called when operator rejects the order
  const handleReject = async (order) => {
    try {
      await updateOrderStatus(order._id, "Rejected");
      toast.success(`Order ${order.orderNo} rejected!`);
      setModalOrder(null);
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to reject order.");
    }
  };

  return (
    <>
      {/* Global audio element for order notifications */}
      <audio ref={audioRef} src="/new_order.mp3" preload="auto" />

      {/* Global Modal for New Order Request */}
      {modalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">New Order Request</h2>
            <p>
              <strong>Order No:</strong> {modalOrder.orderNo}
            </p>
            <p>
              <strong>Customer:</strong> {modalOrder.customerName}
            </p>
            <div className="mt-4">
              <h3 className="font-semibold">Items:</h3>
              <ul className="list-disc ml-5">
                {(modalOrder.items || []).map((item) => (
                  <li key={item.productId?._id || item.productId}>
                    {item.productId?.name || "Unknown"} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4">
              <strong>Total:</strong> ₹{modalOrder.total.toFixed(2)}
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-green-300 rounded"
                onClick={() => handleAccept(modalOrder)}
              >
                Accept Order
              </button>
              <button
                className="px-4 py-2 bg-red-300 rounded"
                onClick={() => handleReject(modalOrder)}
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalOrderManage;
