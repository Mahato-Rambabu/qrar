// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import ProductPage from './components/Products/ProductPage';
import OrderPage from './components/Orders/OrderPage';
import { CartProvider } from '@context/CartContext';
import CartButton from './components/CartButton';
import PopUp from './components/Offers/PopUp';
import ActiveOffers from './components/Offers/ActiveOffers';

// This wrapper extracts the restaurantId from the URL and conditionally renders the app.
const MainWrapper = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  // If the restaurantId is missing, show an error message.
  if (!restaurantId) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-red-500 text-lg">
          Restaurant ID is missing in the URL. Please scan a valid QR code.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* The pop-up component is mounted here. It will only fetch & display once per session. */}
      <PopUp restaurantId={restaurantId} />

      <div className="w-full h-screen overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/orders/:restaurantId" element={<OrderPage />} />
          <Route path="/active-offers" element={<ActiveOffers />} /> 
        </Routes>
        <CartButton />
      </div>
    </>
  );
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <MainWrapper />
      </Router>
    </CartProvider>
  );
};

export default App;
