import React, { useState, useEffect, useMemo } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCart } from "@context/CartContext.jsx";
import axiosInstance from "../../utils/axiosInstance";
import OrderItem from "./OrderItem";
import UserForm from "./UserForm";
import { toast } from "react-hot-toast";
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, AlertCircle, CreditCard, Package, Utensils, Truck } from 'lucide-react';
import GlobalLoader from '../common/GlobalLoader';

const OrderPage = () => {
  const { cartItems, setCartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [orders, setOrders] = useState([]); // orders for admin/general view if needed
  const [recentOrders, setRecentOrders] = useState([]); // orders for the logged-in customer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [taxType, setTaxType] = useState("none");
  const [taxRate, setTaxRate] = useState(0);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  // Total calculated using discountedPrice (if available)
  const itemsTotal = useMemo(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    console.log("Calculated itemsTotal:", total);
    return total;
  }, [cartItems]);

  // Original total using the item.price (without discount)
  const originalTotal = useMemo(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    console.log("Calculated originalTotal:", total);
    return total;
  }, [cartItems]);

  // Discount: difference between original and discounted prices.
  const discount = useMemo(() => {
    const totalDiscount = cartItems.reduce(
      (sum, item) =>
        sum +
        ((item.price || 0) - (item.discountedPrice || item.price || 0)) *
          (item.quantity || 1),
      0
    );
    console.log("Calculated discount:", totalDiscount);
    return totalDiscount;
  }, [cartItems]);

  // Tax calculation based on taxType.
  const calculatedTax = useMemo(() => {
    let tax = 0;
    if (taxType === "none") {
      tax = 0;
    } else if (taxType === "inclusive") {
      // Calculate GST per product for inclusive tax.
      tax = cartItems.reduce((sum, item) => {
        const itemPrice = item.discountedPrice || item.price || 0;
        const productTaxRate = item.taxRate || 0;
        const itemTax = itemPrice * (item.quantity || 1) * (productTaxRate / (100 + productTaxRate));
        console.log(`Item tax for ${item.name || 'product'}: ${itemTax}`);
        return sum + itemTax;
      }, 0);
    } else {
      // For exclusive tax, use the restaurant-level taxRate.
      tax = itemsTotal * ((taxRate || 0) / 100);
    }
    console.log("Calculated tax:", tax, "Tax type:", taxType, "Tax rate:", taxRate);
    return tax;
  }, [taxType, taxRate, itemsTotal, cartItems]);

  // Final payable amount (finalTotal) always adds GST,
  // then rounds the result to two decimals.
  const totalPayable = useMemo(() => {
    const final = itemsTotal - discount + calculatedTax;
    console.log("Calculated totalPayable:", final, "from itemsTotal:", itemsTotal, "discount:", discount, "tax:", calculatedTax);
    return parseFloat(final.toFixed(2));
  }, [itemsTotal, discount, calculatedTax]);

  // For display: compute the original tax (based on original prices)
  const originalTax = useMemo(() => {
    if (taxType === "inclusive") {
      return cartItems.reduce((sum, item) => {
        const productTaxRate = item.taxRate || 0;
        return sum + item.price * item.quantity * (productTaxRate / (100 + productTaxRate));
      }, 0);
    } else if (taxType === "exclusive") {
      return originalTotal * (taxRate / 100);
    } else {
      return 0;
    }
  }, [taxType, taxRate, cartItems, originalTotal]);

  // Original "To Pay" before discount:
  const originalToPay = useMemo(() => {
    if (taxType === "inclusive") {
      return originalTotal;
    } else if (taxType === "exclusive") {
      return originalTotal + originalTax;
    } else {
      return originalTotal;
    }
  }, [taxType, originalTotal, originalTax]);

  // Build dynamic GST breakdown for inclusive tax.
  const taxBreakdown = useMemo(() => {
    if (taxType !== "inclusive") return [];
    return cartItems.map((item) => {
      const itemPrice = item.discountedPrice || item.price;
      const productTaxRate = item.taxRate || taxRate;
      const productGST = parseFloat(
        (itemPrice * item.quantity * (productTaxRate / (100 + productTaxRate))).toFixed(2)
      );
      return {
        name: item.name || item.productName || "Product",
        quantity: item.quantity,
        taxRate: productTaxRate,
        gstAmount: productGST,
      };
    });
  }, [taxType, cartItems, taxRate]);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await axiosInstance.get(`/restaurants/profile/${restaurantId}`);
        setTaxType(response.data.taxType || "none");
        setTaxRate(response.data.taxPercentage || 0);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      }
    };

    fetchRestaurantDetails();

    const customerIdentifier = localStorage.getItem("customerIdentifier");
    if (!customerIdentifier) {
      setShowUserForm(true);
    } else {
      fetchRecentOrders(customerIdentifier);
    }
  }, [restaurantId]);

  // Fetch all orders for the restaurant (optional)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/orders/restaurant/${restaurantId}`);
        console.log('Orders response:', response.data);
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchOrders();
    }
  }, [restaurantId]);

  const handleOrderSubmission = async () => {
    try {
      setLoading(true);
      const customerIdentifier = localStorage.getItem("customerIdentifier");
      if (!customerIdentifier) {
        toast.error("Please complete user registration first");
        setShowUserForm(true);
        return;
      }
  
      console.log("Cart items before submission:", cartItems);
  
      const orderItems = cartItems.map((item) => {
        console.log("Processing item:", item);
        return {
          productId: item._id,
          quantity: item.quantity || 1,
          ...(taxType === "inclusive" && { taxRate: item.taxRate || 0 }),
        };
      });
  
      const orderPayload = {
        items: orderItems,
        finalTotal: parseFloat(totalPayable.toFixed(2)),
        taxType: taxType || "none",
        itemsTotal: parseFloat(itemsTotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        gst: parseFloat(calculatedTax.toFixed(2)),
        customerIdentifier,
        ...(taxType === "exclusive" && { taxRate: parseFloat(taxRate.toFixed(2)) }),
        serviceCharge: 0,
        packingCharge: 0,
        deliveryCharge: 0,
        paymentMethod: "Unpaid",
        paymentStatus: "Unpaid",
        refundStatus: "Not Applicable",
        modeOfOrder: "Dine-in",
        orderNotes: ""
      };
  
      console.log("Sending order payload:", orderPayload);
  
      const response = await axiosInstance.post(`/orders/${restaurantId}`, orderPayload);
  
      if (response.status === 201) {
        toast.success("Order requested successfully!", { position: "top-center" });
        setCartItems([]);
        fetchRecentOrders(customerIdentifier);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to request order. Please try again.",
        { position: "top-center" }
      );
      if (error.response?.status === 400) {
        localStorage.removeItem("customerIdentifier");
        setShowUserForm(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecentOrders = async (customerIdentifier) => {
    try {
      const response = await axiosInstance.get(`/orders/${restaurantId}`, {
        params: { customerIdentifier },
      });
      setRecentOrders(response.data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      toast.error("Failed to load order history", { position: "top-center" });
    }
  };

  const handleReorder = async (order) => {
    try {
      setLoading(true);
      const customerIdentifier = localStorage.getItem("customerIdentifier");
      if (!customerIdentifier) {
        toast.error("Please complete user registration first", { position: "top-center" });
        setShowUserForm(true);
        return;
      }
      const orderItems = order.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      }));

      // Use finalTotal if available; otherwise, use total
      const finalAmount = order.finalTotal !== undefined ? order.finalTotal : order.total || 0;

      const reorderPayload = {
        items: orderItems,
        finalTotal: parseFloat(finalAmount.toFixed(2)),
        taxType: order.taxType || "none",
        itemsTotal: parseFloat((order.itemsTotal || order.total || 0).toFixed(2)),
        discount: parseFloat((order.discount || 0).toFixed(2)),
        gst: parseFloat((order.gst || 0).toFixed(2)),
        customerIdentifier,
        serviceCharge: 0,
        packingCharge: 0,
        deliveryCharge: 0,
        paymentMethod: "Unpaid",
        paymentStatus: "Unpaid",
        refundStatus: "Not Applicable",
        modeOfOrder: "Dine-in",
        orderNotes: ""
      };

      console.log("Sending reorder payload:", reorderPayload);

      const response = await axiosInstance.post(`/orders/${restaurantId}`, reorderPayload);
      if (response.status === 201) {
        toast.success("Order re-placed successfully!", { position: "top-center" });
        fetchRecentOrders(customerIdentifier);
      }
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to place reorder. Please try again.",
        { position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Served':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Preparing':
        return <Utensils className="w-5 h-5 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'Dine-in':
        return <Utensils className="w-5 h-5 text-blue-500" />;
      case 'Takeaway':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'Delivery':
        return <Truck className="w-5 h-5 text-green-500" />;
      default:
        return <Utensils className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPaymentIcon = (status) => {
    return <CreditCard className={`w-5 h-5 ${status === 'Paid' ? 'text-green-500' : 'text-red-500'}`} />;
  };

  if (loading) {
    return (
      <GlobalLoader 
        message="Preparing your orders..." 
        subMessage="Just a moment while we fetch your delicious history"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-[8%] w-full flex items-center px-4 bg-white shadow-md fixed top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1">
          <RiArrowLeftSLine size={32} />
        </button>
        <h1 className="ml-4 text-lg font-bold">Your Orders</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-[24%] sm:pt-[6%] bg-gray-50">
        <button
          className="mb-4 text-left p-3 rounded-full font-semibold text-black border-2 border-gray-400 hover:bg-gray-200 transition-colors"
          onClick={() => setShowRecentOrders((prev) => !prev)}
        >
          Recent Orders
        </button>

        {/* Render recent orders if toggle is ON.
            We now map over recentOrders (which are fetched using the customerIdentifier)
            instead of the general orders array.
        */}
        {showRecentOrders && (
          <div className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <OrderSummary key={order._id} order={order} onReorder={handleReorder} />
              ))
            ) : (
              <p className="text-gray-500">No recent orders available.</p>
            )}
          </div>
        )}

        {/* Cart Items */}
        {cartItems.map((item) => (
          <OrderItem key={item._id} item={item} updateQuantity={updateQuantity} />
        ))}

        <div className="flex justify-between mt-4">
          <button
            className="text-sm text-gray-500"
            onClick={() =>
              navigate(`/products?restaurantId=${restaurantId}&categoryId=all`)
            }
          >
            + Add More Items
          </button>
        </div>

        {/* Bill Details */}
        {cartItems.length > 0 && (
          <>
            <div className="flex items-center mt-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-lg">Bill Details</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="mt-4 p-4 bg-white shadow rounded-lg">
              <div className="text-gray-700">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>₹{itemsTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount Applied</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  {taxType === "exclusive" ? (
                    <>
                      <span>{`GST (${taxRate}%)`}</span>
                      <span>₹{calculatedTax.toFixed(2)}</span>
                    </>
                  ) : taxType === "inclusive" ? (
                    <>
                      <span>
                        GST&nbsp;
                        <button
                          onClick={() => setShowTaxBreakdown(true)}
                          className="w-4 h-4 rounded-full bg-gray-500 text-white items-center justify-center text-xs ml-1"
                          title="View GST breakdown per product"
                        >
                          i
                        </button>
                      </span>
                      <span>₹{calculatedTax.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <span>GST</span>
                      <span>₹{calculatedTax.toFixed(2)}</span>
                    </>
                  )}
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">To Pay</span>
                  {discount > 0 ? (
                    <div className="flex items-end gap-2">
                      <span className="line-through text-gray-500">
                        ₹{originalToPay.toFixed(2)}
                      </span>
                      <span className="font-bold text-black">
                        ₹{totalPayable.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-black">
                      ₹{totalPayable.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {showUserForm && (
          <UserForm
            onFormSubmit={() => {
              setShowUserForm(false);
              const id = localStorage.getItem("customerIdentifier");
              if (id) fetchRecentOrders(id);
            }}
          />
        )}
      </main>

      <footer className="w-full h-[10%] p-4 bg-white shadow-lg">
        <button
          className="w-full bg-gray-500 text-white py-3 rounded-md font-semibold disabled:opacity-50"
          onClick={handleOrderSubmission}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? "Requesting Order..." : "Request Order"}
        </button>
      </footer>

      {/* Dynamic GST Breakdown Card (for inclusive tax) */}
      {showTaxBreakdown && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowTaxBreakdown(false)}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-xs w-full sm:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">GST Breakdown</h2>
              <button
                onClick={() => setShowTaxBreakdown(false)}
                className="text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <ul className="divide-y text-sm">
              {taxBreakdown.map((product, index) => (
                <li key={index} className="py-2 flex justify-between">
                  <span>{product.name}</span>
                  <span>
                    {product.quantity} x {product.taxRate}% = ₹
                    {product.gstAmount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated OrderSummary: use order.finalTotal if defined, otherwise fallback to order.total.
const OrderSummary = ({ order, onReorder }) => {
  const orderDate = new Date(order.createdAt).toLocaleString();
  const statusColor =
    order.status === "Pending"
      ? "text-yellow-500"
      : order.status === "Served"
      ? "text-green-500"
      : "text-red-500";
  
  // Use finalTotal if available; otherwise use total (fallback to 0.00)
  const payableAmount = order.finalTotal !== undefined 
    ? order.finalTotal 
    : (order.total !== undefined ? order.total : 0);

  return (
    <div className="mb-6 border-b pb-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="font-semibold text-black">Order No: {order.orderNo}</h3>
          <p className="text-gray-500 text-sm">{orderDate}</p>
        </div>
        <span className={`font-medium text-sm ${statusColor}`}>
          {order.status}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {order.items.map((item) => (
          <div key={item.productId._id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={item.productId.img}
                alt={item.productId.name}
                className="w-20 h-20 object-cover rounded-md"
                loading="lazy"
              />
              <div className="flex flex-col">
                <h4 className="font-medium text-black">{item.productId.name}</h4>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onReorder(order)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Reorder
        </button>
        <p className="font-bold text-gray-800 text-xl">
          To Pay: ₹{parseFloat(payableAmount).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderPage;
