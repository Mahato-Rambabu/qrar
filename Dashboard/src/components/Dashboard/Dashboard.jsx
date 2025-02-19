import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import PopCardsPage from './Loyalty/PopupCard';
import OffersPage from './Loyalty/OfferPage';
import CouponCodesPage from './Loyalty/CouponCodePage';
import ComboDealsPage from './Loyalty/ComboDealsPage';
// import OrderDashboard from '../orders/OrderDashboard';

// Lazy load components for optimization
const OrderDashboard = lazy(() => import('../orders/OrderDashboard'));
const RestoDashboard = lazy(() => import('./Analytics/RestoDashboard'));
const RegisterPage = lazy(() => import('../SignUp/RegisterPage'));
const LoginPage = lazy(() => import('../SignUp/LoginPage'));
const ProductPage = lazy(() => import('./Products/ProductPage'));
const AddProductPage = lazy(() => import('./Products/AddProduct'));
const CategoryPage = lazy(() => import('./Products/CategoryPage'));
const EditProductPage = lazy(() => import('./Products/EditProductPage'));
const EditCategoryPage = lazy(() => import('./Products/EditCategoryPage'));
const ProfilePage = lazy(() => import('./Profile'));
const ProtectedRoute = lazy(() => import('./ProtectedRoute'));
const OrderHistory = lazy(() => import('../orders/OrderHistory'));
const QRCodeGenerator = lazy(() => import('./QrCode'));
const UserTable = lazy(() => import('./UserCustomer'));

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const location = useLocation();


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar isOpen={isOpen} />

          {/* Main Content */}
          <main
            className={`flex-1 overflow-auto transition-all duration-300 mt-[8vh] ${isOpen ? 'sm:ml-0 md:ml-[20%]' : 'sm:ml-0 lg:ml-[5%]'
              } `}
          >
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
              <Routes>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <RestoDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <UserTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loyalty/popups"
                  element={
                    <ProtectedRoute>
                      <PopCardsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loyalty/coupon-code"
                  element={
                    <ProtectedRoute>
                      <CouponCodesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loyalty/combo-deals"
                  element={
                    <ProtectedRoute>
                      <ComboDealsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loyalty/offers"
                  element={
                    <ProtectedRoute>
                      <OffersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <ProductPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/add"
                  element={
                    <ProtectedRoute>
                      <AddProductPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <CategoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories/edit/:categoryId"
                  element={
                    <ProtectedRoute>
                      <EditCategoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/edit/:productId"
                  element={
                    <ProtectedRoute>
                      <EditProductPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/qrcode"
                  element={
                    <ProtectedRoute>
                      <QRCodeGenerator />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(Dashboard);
