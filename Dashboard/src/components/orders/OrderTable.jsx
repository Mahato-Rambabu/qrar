import React from "react";

const OrderTable = ({ orders, onUpdateStatus, isHistory = false }) => {
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
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
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
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onUpdateStatus(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Served">Served</option>
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
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={isHistory ? "6" : "5"}
                className="py-4 text-center text-gray-500"
              >
                {isHistory
                  ? "No served orders in the last 24 hours"
                  : "No pending orders"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;