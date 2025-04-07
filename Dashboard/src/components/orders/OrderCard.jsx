import React from "react";
import { Printer, Clock, CreditCard, ShoppingBag, Tag, Info } from "lucide-react";

const OrderCard = ({ order, onUpdateStatus, isHistory = false, onDownload }) => {
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

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Served":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Determine payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Refunded":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">Order #{safeOrder.orderNo}</h3>
          <p className="text-gray-600">{safeOrder.customerName}</p>
        </div>
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(safeOrder.status)}`}>
            {safeOrder.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Order Items */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-1" /> Items
          </h4>
          <div className="space-y-2">
            {safeOrder.items.map((item) => {
              const safeItem = {
                productId: item.productId || {},
                quantity: item.quantity || 0
              };
              
              // Ensure product price is properly accessed
              const productPrice = safeItem.productId?.price || 0;
              const itemTotal = productPrice * safeItem.quantity;
              
              return (
                <div key={safeItem.productId._id || Math.random()} className="flex justify-between items-center">
                  <span>{safeItem.productId.name || "Unknown"} x {safeItem.quantity}</span>
                  <span className="text-gray-600">₹{itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Time
            </h4>
            <p className="text-sm">
              {isHistory 
                ? new Date(safeOrder.updatedAt).toLocaleString()
                : new Date(safeOrder.createdAt).toLocaleString()
              }
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-1" /> Mode
            </h4>
            <p className="text-sm">{safeOrder.modeOfOrder}</p>
            {safeOrder.tableNumber && (
              <p className="text-sm text-gray-600">Table: {safeOrder.tableNumber}</p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-1" /> Payment
          </h4>
          <div className="flex items-center mb-1">
            <span className={`px-2 py-1 rounded-full text-xs mr-2 ${getPaymentStatusColor(safeOrder.paymentStatus)}`}>
              {safeOrder.paymentStatus}
            </span>
            <span className="text-sm">{safeOrder.paymentMethod}</span>
          </div>
        </div>

        {/* Order Notes */}
        {safeOrder.orderNotes && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Info className="w-4 h-4 mr-1" /> Notes
            </h4>
            <p className="text-sm text-gray-700">{safeOrder.orderNotes}</p>
          </div>
        )}

        {/* Financial Summary */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{safeOrder.itemsTotal.toFixed(2)}</span>
            </div>
            {safeOrder.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{safeOrder.discount.toFixed(2)}</span>
              </div>
            )}
            {safeOrder.gst > 0 && (
              <div className="flex justify-between">
                <span>GST:</span>
                <span>₹{safeOrder.gst.toFixed(2)}</span>
              </div>
            )}
            {safeOrder.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Charge:</span>
                <span>₹{safeOrder.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {safeOrder.packingCharge > 0 && (
              <div className="flex justify-between">
                <span>Packing Charge:</span>
                <span>₹{safeOrder.packingCharge.toFixed(2)}</span>
              </div>
            )}
            {safeOrder.deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>₹{safeOrder.deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>₹{safeOrder.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        {!isHistory && (
          <select 
            value={safeOrder.status} 
            onChange={(e) => onUpdateStatus(safeOrder._id, e.target.value)}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Served">Served</option>
          </select>
        )}
        <button
          onClick={() => onDownload(order)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Printer size={18} className="mr-1" />
          <span className="text-sm">Download</span>
        </button>
      </div>
    </div>
  );
};

export default OrderCard; 