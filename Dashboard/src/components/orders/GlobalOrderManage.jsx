import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { toast } from "react-hot-toast";
import { updateOrderStatus } from "./orderService";
import { generateOrderBill } from "../../utils/pdfGenerator";

// Dynamically set the socket URL based on the environment
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
const socket = io(socketUrl);

// Helper function to send web notification
const sendWebNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/logo192.png",
      badge: "/favicon.ico",
      vibrate: [100, 50, 100],
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        sendWebNotification(title, options);
      }
    });
  }
};

const GlobalOrderManage = () => {
  const [modalOrder, setModalOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const audioRef = useRef(null);

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationEnabled(permission === "granted");
      });
    }
  }, []);

  // Handle new order notifications
  useEffect(() => {
    // Listen for new order events (global for the dashboard)
    socket.on("order:created", handleNewOrder);

    return () => {
      socket.off("order:created", handleNewOrder);
    };
  }, []);

  // Handle new order notification
  const handleNewOrder = useCallback((newOrder) => {
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
        .catch((err) => console.warn("Audio playback prevented:", err.message));
    }

    // Send web notification if enabled
    if (notificationEnabled) {
      const notificationOptions = {
        body: `New order #${order.orderNo} from ${order.customerName}`,
        tag: `order-${order._id}`,
        data: {
          orderId: order._id,
          orderNo: order.orderNo
        },
        actions: [
          {
            action: 'accept',
            title: 'Accept'
          },
          {
            action: 'reject',
            title: 'Reject'
          }
        ]
      };
      
      sendWebNotification('New Order Received', notificationOptions);
    }

    // If WhatsApp link is available, open it in a new tab
    if (newOrder.restaurantWhatsAppLink) {
      window.open(newOrder.restaurantWhatsAppLink, '_blank');
    }
  }, [notificationEnabled]);

  // Handle order acceptance
  const handleAccept = useCallback(async (order) => {
    try {
      setIsLoading(true);
      // Even though the status remains "Pending", we call updateOrderStatus
      // so that updatedAt changes and a socket event is emitted.
      await updateOrderStatus(order._id, "Pending");
      toast.success(`New order ${order.orderNo} accepted!`);
      setModalOrder(null);
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle order rejection
  const handleReject = useCallback(async (order) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(order._id, "Rejected");
      toast.success(`Order ${order.orderNo} rejected!`);
      setModalOrder(null);
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to reject order.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle order download
  const handleDownload = useCallback((order) => {
    try {
      generateOrderBill(order);
      toast.success(`Bill for order ${order.orderNo} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading bill:", error);
      toast.error("Failed to download bill.");
    }
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalOrder(null);
  }, []);

  return (
    <>
      {/* Global audio element for order notifications */}
      <audio ref={audioRef} src="/new_order.mp3" preload="auto" />

      {/* Global Modal for New Order Request */}
      {modalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">New Order Request</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <p className="text-blue-800 font-medium">
                <span className="font-bold">Order No:</span> {modalOrder.orderNo}
              </p>
              <p className="text-blue-800 font-medium">
                <span className="font-bold">Customer:</span> {modalOrder.customerName}
              </p>
              {modalOrder.modeOfOrder && (
                <p className="text-blue-800 font-medium">
                  <span className="font-bold">Mode:</span> {modalOrder.modeOfOrder}
                </p>
              )}
              {modalOrder.tableNumber && (
                <p className="text-blue-800 font-medium">
                  <span className="font-bold">Table:</span> {modalOrder.tableNumber}
                </p>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Items:</h3>
              <ul className="divide-y divide-gray-200">
                {(modalOrder.items || []).map((item) => (
                  <li key={item.productId?._id || item.productId} className="py-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.productId?.name || "Unknown"}</span>
                      <span className="text-gray-600">x {item.quantity}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      ₹{((item.productId?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>₹{modalOrder.itemsTotal?.toFixed(2) || "0.00"}</span>
              </div>
              {modalOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{modalOrder.discount.toFixed(2)}</span>
                </div>
              )}
              {modalOrder.gst > 0 && (
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>₹{modalOrder.gst.toFixed(2)}</span>
                </div>
              )}
              {modalOrder.serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge:</span>
                  <span>₹{modalOrder.serviceCharge.toFixed(2)}</span>
                </div>
              )}
              {modalOrder.packingCharge > 0 && (
                <div className="flex justify-between">
                  <span>Packing Charge:</span>
                  <span>₹{modalOrder.packingCharge.toFixed(2)}</span>
                </div>
              )}
              {modalOrder.deliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>₹{modalOrder.deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>₹{modalOrder.finalTotal?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
            
            {modalOrder.orderNotes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="font-medium text-gray-700">Notes:</p>
                <p className="text-gray-600">{modalOrder.orderNotes}</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-between gap-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                onClick={() => handleAccept(modalOrder)}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Accept Order"}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                onClick={() => handleReject(modalOrder)}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Reject Order"}
              </button>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                onClick={() => handleDownload(modalOrder)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalOrderManage;
