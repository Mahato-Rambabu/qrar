import React from "react";
import { Printer } from "lucide-react";
import OrderCard from "./OrderCard";
import { generateOrderBill } from "../../utils/pdfGenerator";
// import Papa from "papaparse";

const OrderTable = ({ orders, onUpdateStatus, isHistory = false }) => {
  const handleDownloadSingleOrder = (order) => {
    try {
      generateOrderBill(order);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div>
      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-gray-100 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-6 text-left">Order No</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Orders</th>
              <th className="py-3 px-6 text-left">Total</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Payment</th>
              <th className="py-3 px-6 text-left">Mode</th>
              <th className="py-3 px-6 text-left">Time</th>
              <th className="py-3 px-6 text-left">Download</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                // Create a safe version of the order with default values
                const safeOrder = {
                  _id: order._id || "",
                  orderNo: order.orderNo || "N/A",
                  customerName: order.customerName || "Guest",
                  items: order.items || [],
                  status: order.status || "Pending",
                  paymentMethod: order.paymentMethod || "Unpaid",
                  paymentStatus: order.paymentStatus || "Unpaid",
                  modeOfOrder: order.modeOfOrder || "Dine-in",
                  tableNumber: order.tableNumber || null,
                  itemsTotal: order.itemsTotal || 0,
                  discount: order.discount || 0,
                  gst: order.gst || 0,
                  serviceCharge: order.serviceCharge || 0,
                  packingCharge: order.packingCharge || 0,
                  deliveryCharge: order.deliveryCharge || 0,
                  finalTotal: order.finalTotal || 0,
                  orderNotes: order.orderNotes || "",
                  createdAt: order.createdAt || new Date(),
                  updatedAt: order.updatedAt || new Date()
                };

                return (
                  <tr key={safeOrder._id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{safeOrder.orderNo}</td>
                    <td className="py-3 px-6">{safeOrder.customerName}</td>
                    <td className="py-3 px-6">
                      {safeOrder.items.map((item) => {
                        // Create a safe version of the item with default values
                        const safeItem = {
                          productId: item.productId || {},
                          quantity: item.quantity || 0
                        };
                        
                        // Ensure product price is properly accessed
                        const productPrice = safeItem.productId?.price || 0;
                        const itemTotal = productPrice * safeItem.quantity;
                        
                        return (
                          <div key={safeItem.productId._id || Math.random()} className="flex justify-between">
                            <span>{safeItem.productId.name || "Unknown"} x {safeItem.quantity}</span>
                            <span className="text-gray-600">₹{itemTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{safeOrder.itemsTotal.toFixed(2)}</span>
                        </div>
                        {safeOrder.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-₹{safeOrder.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {safeOrder.gst > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>GST:</span>
                            <span>₹{safeOrder.gst.toFixed(2)}</span>
                          </div>
                        )}
                        {safeOrder.serviceCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Service Charge:</span>
                            <span>₹{safeOrder.serviceCharge.toFixed(2)}</span>
                          </div>
                        )}
                        {safeOrder.packingCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Packing Charge:</span>
                            <span>₹{safeOrder.packingCharge.toFixed(2)}</span>
                          </div>
                        )}
                        {safeOrder.deliveryCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Delivery Charge:</span>
                            <span>₹{safeOrder.deliveryCharge.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold mt-1">
                          <span>Total:</span>
                          <span>₹{safeOrder.finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-semibold">₹{safeOrder.finalTotal.toFixed(2)}</td>
                    <td className="py-3 px-6">
                      {isHistory ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Served</span>
                      ) : (
                        <select 
                          value={safeOrder.status} 
                          onChange={(e) => onUpdateStatus(safeOrder._id, e.target.value)}
                          className="px-2 py-1 rounded-md border border-gray-300 text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Served">Served</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          safeOrder.paymentStatus === "Paid" 
                            ? "bg-green-100 text-green-800" 
                            : safeOrder.paymentStatus === "Refunded" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                        }`}>
                          {safeOrder.paymentStatus}
                        </span>
                        <span className="text-xs text-gray-600">
                          {safeOrder.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {safeOrder.modeOfOrder}
                        </span>
                        {safeOrder.tableNumber && (
                          <span className="text-xs text-gray-600">
                            Table: {safeOrder.tableNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      {isHistory ? (
                        <div>
                          <div>{new Date(safeOrder.updatedAt).toLocaleDateString()}</div>
                          <div>{new Date(safeOrder.updatedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        <div>
                          <div>{new Date(safeOrder.createdAt).toLocaleDateString()}</div>
                          <div>{new Date(safeOrder.createdAt).toLocaleTimeString()}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-6 flex justify-center items-center">
                      <Printer
                        size={20}
                        className="cursor-pointer text-blue-600 hover:text-blue-500 transition-colors"
                        onClick={() => handleDownloadSingleOrder(order)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isHistory ? "9" : "9"} className="py-4 text-center text-gray-500">
                  {isHistory ? "No served orders in the last 24 hours" : "No pending orders"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (hidden on desktop) */}
      <div className="md:hidden">
        {orders && orders.length > 0 ? (
          orders.map(order => (
            <OrderCard 
              key={order._id || Math.random()}
              order={order}
              onUpdateStatus={onUpdateStatus}
              isHistory={isHistory}
              onDownload={handleDownloadSingleOrder}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            {isHistory ? "No served orders in the last 24 hours" : "No pending orders"}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTable;
