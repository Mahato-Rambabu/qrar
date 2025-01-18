import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Custom Hook to use CartContext
export const useCart = () => useContext(CartContext);

// CartProvider Component
export const CartProvider = ({ children }) => {
  // Load cart items from localStorage on initialization
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart items to localStorage whenever the cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to add a product to the cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Function to update the quantity of a product in the cart
  const updateQuantity = (productId, action) => {
    setCartItems((prevItems) => {
      return prevItems.reduce((updatedCart, item) => {
        if (item._id === productId) {
          const updatedQuantity = action === 'increment' ? item.quantity + 1 : item.quantity - 1;

          if (updatedQuantity > 0) {
            updatedCart.push({ ...item, quantity: updatedQuantity });
          }
        } else {
          updatedCart.push(item);
        }

        return updatedCart;
      }, []);
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
