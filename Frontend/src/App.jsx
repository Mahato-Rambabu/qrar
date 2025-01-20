import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import ProductPage from './components/Products/ProductPage';
import OrderPage from './components/Orders/OrderPage';
import { CartProvider } from '@context/CartContext';
import CartButton from './components/CartButton';

const App = () => {
  return (
    <CartProvider>
      <Router>
        <div className="w-full h-screen overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/orders/:restaurantId" element={<OrderPage />} />
          </Routes>
          <CartButton />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
