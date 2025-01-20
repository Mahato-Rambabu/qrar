import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoCartSharp } from 'react-icons/io5';
import { useCart } from '@context/CartContext.jsx';
import { toast } from 'react-hot-toast';

const CartButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  // Extract restaurantId from the query parameter
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  // Calculate the number of unique items in the cart
  const uniqueItemCount = cartItems.length;

  // Hide the button if the current path matches the orders page
  if (location.pathname.startsWith('/orders')) return null;

  return (
    <button
      aria-label="Cart button"
      className="fixed bottom-8 right-8 md:bottom-16 md:right-16 bg-pink-500 hover:bg-pink-600 rounded-full p-3 shadow-lg cursor-pointer"
      onClick={() => {
        if (restaurantId) {
          navigate(`/orders/${restaurantId}`);
        } else {
          toast.error("Restaurant ID is missing. Please try again.");
        }
      }}
    >
      <IoCartSharp className="text-white text-3xl " />
      {uniqueItemCount > 0 && (
        <span
          aria-live="polite"
          className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {uniqueItemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;
