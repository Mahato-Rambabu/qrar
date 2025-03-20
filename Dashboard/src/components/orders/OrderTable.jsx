import React from "react";
import { Printer } from "lucide-react";
// import Papa from "papaparse";

const OrderTable = ({ orders, onUpdateStatus, isHistory = false }) => {

  const handleDownloadSingleOrder = (order) => {
    const csvContent = [
      ["Order No", "Customer Name", "Item", "Quantity", "Total", "Status"],
      ...order.items.map((item) => [
        order.orderNo,
        order.customerName || "Guest",
        item.productId?.name || "Unknown",
        item.quantity,
        `₹${order.total.toFixed(2)}`,
        order.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `order-${order.orderNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-100 shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-3 px-6 text-left">Order No</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Orders</th>
            <th className="py-3 px-6 text-left">Total</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Time</th>
            <th className="py-3 px-6 text-left">Download</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6">{order.orderNo || "N/A"}</td>
                <td className="py-3 px-6">{order.customerName || "N/A"}</td>
                <td className="py-3 px-6">
                  {order.items.map((item) => (
                    <div key={item.productId?._id}>
                      {item.productId?.name || "Unknown"} x {item.quantity}
                    </div>
                  ))}
                </td>
                <td className="py-3 px-6">₹{order.total.toFixed(2)}</td>
                <td className="py-3 px-6">
                  {isHistory ? (
                    <span>Served</span>
                  ) : (
                    <select value={order.status} onChange={(e) => onUpdateStatus(order._id, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Served">Served</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  )}
                </td>
                <td className="py-3 px-6">
                  {isHistory ? (
                    <div>
                      <div>{new Date(order.updatedAt).toLocaleDateString()}</div>
                      <div>{new Date(order.updatedAt).toLocaleTimeString()}</div>
                    </div>
                  ) : (
                    <div>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </div>
                  )}
                </td>
                <td className="p-6  flex justify-center items-center">
                  <Printer
                    size={20}
                    className="cursor-pointer text-blue-600 hover:text-blue-500 transition-colors"
                    onClick={() => handleDownloadSingleOrder(order)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isHistory ? "7" : "6"} className="py-4 text-center text-gray-500">
                {isHistory ? "No served orders in the last 24 hours" : "No pending orders"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
