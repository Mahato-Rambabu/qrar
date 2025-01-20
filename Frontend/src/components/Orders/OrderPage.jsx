import React, { useState, useEffect, useMemo } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@context/CartContext.jsx";
import axiosInstance from "../../utils/axiosInstance";
import OrderItem from "./OrderItem";
import UserForm from "./UserForm";
import Cookies from "js-cookie";
import { toast } from 'react-hot-toast';
const OrderPage = () => {
  const { cartItems, setCartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const [showUserForm, setShowUserForm] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    const customerIdentifier = Cookies.get("customerIdentifier");
    if (!customerIdentifier) {
        setShowUserForm(true);
    } else {
        fetchRecentOrders(customerIdentifier);
    }
}, []);

const handleOrderSubmission = async () => {
    try {
        setLoading(true);

        const customerIdentifier = Cookies.get("customerIdentifier");
        if (!customerIdentifier) {
            toast.error("Customer identifier not found. Please reload the page.");
            return;
        }

        const orderItems = cartItems.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
        }));

        // Debugging: Log order data before sending
        console.log("Sending Order Data:", {
            restaurantId,
            orderItems,
            total: totalPrice,
            customerIdentifier,
        });

        const response = await axiosInstance.post(
            `/orders/${restaurantId}`,
            {
                items: orderItems,
                total: totalPrice,
                customerIdentifier,
            },
            { withCredentials: true } // Ensure cookies are sent
        );

        if (response.status === 201) {
            toast.success("Order placed successfully!");
            setCartItems([]); // Clear cart
            fetchRecentOrders(customerIdentifier);
        }
    } catch (error) {
        console.error("Error placing order:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to place order.");
    } finally {
        setLoading(false);
    }
};


const fetchRecentOrders = async (customerIdentifier) => {
  try {
      const response = await axiosInstance.get(
          `/orders/${restaurantId}?customerIdentifier=${customerIdentifier}`,
          { withCredentials: true }
      );
      setRecentOrders(response.data);
  } catch (error) {
      console.error("Error fetching recent orders:", error.message);
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
                <div key={order._id} className="mb-6 border-b pb-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-black">Order No: {order.orderNo}</h3>
                    <span className="text-pink-500 font-medium text-sm">
                      Thanks For Ordering 😊
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <p className="font-bold text-gray-800 text-lg">
                      Total: ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
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
              navigate(`/products?restaurantId=${restaurantId}&categoryId=all`)
            }
          >
            + Add More Items
          </button>
          <h3 className="font-bold">Total: ₹{totalPrice}</h3>
        </div>

        {showUserForm && <UserForm onFormSubmit={() => setShowUserForm(false)} />}
      </main>

      <footer className="w-full h-[10%] p-4 bg-white shadow-lg">
        <button
          className="w-full bg-pink-500 text-white py-3 rounded-md font-semibold"
          onClick={handleOrderSubmission}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </footer>
    </div>
  );
};

export default OrderPage;
