import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Products from './ProductPage';
import Orders from './orders';
import Feedbacks from './feedback';
import RestoDashboard from './RestoDashboard'; // Note the capitalization
import RegisterPage from '../SignUp/RegisterPage';
import LoginPage from '../SignUp/LoginPage';

const Dashboard = () => {
  // Theme toggling
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Sidebar toggling
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Dynamic title based on route
  const location = useLocation();
  const getPageTitle = (path) => {
    switch (path) {
      case '/products':
        return 'Products';
      case '/orders':
        return 'Orders';
      case '/feedbacks':
        return 'Feedbacks';
      case '/dashboard':
        return 'Dashboard';
      default:
        return 'Restaurant';
    }
  };

  return (
    <div className={`${theme === 'light' ? 'light' : 'dark'} w-full h-full`}>
      <Navbar
        toggleSidebar={toggleSidebar}
        toggleTheme={toggleTheme}
        title={getPageTitle(location.pathname)}
      />
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar isOpen={isOpen} />
        <div className="h-full w-full overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<RestoDashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/feedbacks" element={<Feedbacks />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
