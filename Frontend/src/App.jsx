import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useLocation } from "react-router-dom";
import HomePage from "./components/Home/HomePage";
import ProductPage from "./components/Products/ProductPage";
import OrderPage from "./components/Orders/OrderPage";
import { CartProvider } from "@context/CartContext";
import CartButton from "./components/CartButton";
import PopUp from "./components/Offers/PopUp";

// Wrapper to extract restaurantId from URL
const AppWrapper = () => {
  const location = useLocation();
  const { restaurantId } = useParams();

  // If restaurantId is not provided as a param, try extracting it from the pathname.
  // Assuming your URL is structured as "/RESTAURANT_ID/..."
  const extractedRestaurantId = restaurantId || location.pathname.split("/")[1] || null;

  return (
    <>
      {extractedRestaurantId && <PopUp restaurantId={extractedRestaurantId} />}
      <Routes>
        <Route path="/:restaurantId" element={<HomePage />} />
        <Route path="/:restaurantId/home" element={<HomePage />} />
        <Route path="/:restaurantId/products" element={<ProductPage />} />
        <Route path="/orders/:restaurantId" element={<OrderPage />} />
      </Routes>
      <CartButton />
    </>
  );
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <div className="w-full h-screen overflow-auto">
          <AppWrapper />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
