import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

// Use VITE_SOCKET_URL if defined, otherwise fallback to VITE_API_BASE_URL
const socketUrl =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;

const GlobalOrderToastListener = () => {
  useEffect(() => {
    const socket = io(socketUrl);

    socket.on("order:updated", (updatedOrder) => {
      const customerIdentifier = localStorage.getItem("customerIdentifier");
      console.log("Received order:updated event:", updatedOrder);

      // Compare identifiers as strings
      if (
        String(updatedOrder.customerIdentifier) === String(customerIdentifier)
      ) {
        if (updatedOrder.status === "Preparing") {
          toast.success(
            `Your order ${updatedOrder.orderNo} has been accepted!`
          );
        } else if (updatedOrder.status === "Rejected") {
          toast.error(`Your order ${updatedOrder.orderNo} has been rejected.`);
        }
      }
    });

    return () => {
      socket.off("order:updated");
      socket.disconnect();
    };
  }, []);

  return null; // This component does not render anything visible.
};

export default GlobalOrderToastListener;
