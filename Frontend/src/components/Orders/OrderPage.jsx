import React, { useState, useEffect, useMemo } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@context/CartContext.jsx";
import axiosInstance from "../../utils/axiosInstance";
import OrderItem from "./OrderItem";
import UserForm from "./UserForm";
import { toast } from "react-hot-toast";

const OrderPage = () => {
  const { cartItems, setCartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const [showUserForm, setShowUserForm] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate total price (using discountedPrice if available)
  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          (item.discountedPrice ? item.discountedPrice : item.price) *
            item.quantity,
        0
      ),
    [cartItems]
  );

  useEffect(() => {
    const customerIdentifier = localStorage.getItem("customerIdentifier");
    if (!customerIdentifier) {
      setShowUserForm(true);
    } else {
      fetchRecentOrders(customerIdentifier);
    }
  }, []);

  const handleOrderSubmission = async () => {
    try {
      setLoading(true);
      const customerIdentifier = localStorage.getItem("customerIdentifier");

      if (!customerIdentifier) {
        toast.error("Please complete user registration first");
        setShowUserForm(true);
        return;
      }

      const orderItems = cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const response = await axiosInstance.post(
        `/orders/${restaurantId}`,
        {
          items: orderItems,
          total: totalPrice,
          customerIdentifier,
        }
      );

      if (response.status === 201) {
        toast.success("Order requested successfully!", { position: "top-center" });
        setCartItems([]);
        fetchRecentOrders(customerIdentifier);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to request order. Please try again.",{ position: "top-center" }
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
      toast.error("Failed to load order history",{ position: "top-center" });
    }
  };

  // New reorder handler: re-place the selected order.
  const handleReorder = async (order) => {
    try {
      setLoading(true);
      const customerIdentifier = localStorage.getItem("customerIdentifier");

      if (!customerIdentifier) {
        toast.error("Please complete user registration first",{ position: "top-center" });
        setShowUserForm(true);
        return;
      }

      // Prepare the items from the past order
      const orderItems = order.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      }));

      const response = await axiosInstance.post(
        `/orders/${restaurantId}`,
        {
          items: orderItems,
          total: order.total,
          customerIdentifier,
        }
      );

      if (response.status === 201) {
        toast.success("Order re-placed successfully!",{ position: "top-center" });
        // Optionally update the recent orders list
        fetchRecentOrders(customerIdentifier);
      }
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to place reorder. Please try again.",{ position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

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

        {showRecentOrders && (
          <div className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <OrderSummary
                  key={order._id}
                  order={order}
                  onReorder={handleReorder}
                />
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

        {/* Footer */}
        <div className="flex justify-between mt-4">
          <button
            className="text-sm text-blue-500"
            onClick={() =>
              navigate(
                `/products?restaurantId=${restaurantId}&categoryId=all`
              )
            }
          >
            + Add More Items
          </button>
          <h3 className="font-bold text-lg text-gray-800">
            Total Payable:{" "}
            <span className="text-green-800 text-xl">
              ₹{totalPrice.toFixed(2)}
            </span>
          </h3>
        </div>

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
    </div>
  );
};

const OrderSummary = ({ order, onReorder }) => {
  // Format the createdAt timestamp to a readable date & time string.
  const orderDate = new Date(order.createdAt).toLocaleString();

  // Determine the color based on order status.
  const statusColor =
    order.status === "Pending"
      ? "text-yellow-500"
      : order.status === "Served"
      ? "text-green-500"
      : "text-red-500";

  return (
    <div className="mb-6 border-b pb-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {/* Left section: Order number and date/time */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-black">Order No: {order.orderNo}</h3>
          <p className="text-gray-500 text-sm">{orderDate}</p>
        </div>
        {/* Right section: Order status */}
        <span className={`font-medium text-sm ${statusColor}`}>
          {order.status}
        </span>
      </div>
      {/* Order items */}
      <div className="flex flex-col gap-4">
        {order.items.map((item) => (
          <div
            key={item.productId._id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.productId.img}
                alt={item.productId.name}
                className="w-20 h-20 object-cover rounded-md"
                loading="lazy"
              />
              <div className="flex flex-col">
                <h4 className="font-medium text-black">
                  {item.productId.name}
                </h4>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Footer with total payable and Reorder button */}
      <div className="flex justify-between items-center mt-4">
      <button
          onClick={() => onReorder(order)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Reorder
        </button>
        <p className="font-bold text-gray-800 text-xl">
          Total: ₹{order.total.toFixed(2)}
        </p>
        
      </div>
    </div>
  );
};

export default OrderPage;
