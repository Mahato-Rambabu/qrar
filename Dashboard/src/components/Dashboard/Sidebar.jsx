import React, { memo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { ShoppingCart, Package, Users, ChartLine, QrCode, LogOut } from 'lucide-react'; // Import LogOut icon
import PropTypes from 'prop-types';

const Sidebar = memo(({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate

  // Check if a menu item is active
  const isActive = useCallback((path) => location.pathname === path, [location]);

  // Menu items array
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: ChartLine },
    { path: '/categories', label: 'Products', icon: Package },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/qrcode?restaurantId=${restaurantId}', label: 'QR Page', icon: QrCode },
  ];

  // Handle Logout
  const handleLogout = () => {
    // Clear all local storage or session storage
    localStorage.clear();
    sessionStorage.clear();
    Cookies.remove('authToken'); // Removes the cookie

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div>
      {/* PC Version Sidebar */}
      <div
        className={`fixed top-[8vh] left-0 h-[92vh] bg-white shadow-md transition-transform duration-300 flex flex-col justify-between ${
          isOpen ? 'md:w-[20%]' : 'md:w-[5%]'
        } w-[60%] sm:w-[40%] md:flex hidden transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Menu Items */}
        <ul className="flex flex-col gap-2 py-4">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link to={path} key={label}>
              <li
                className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-blue-400 text-white shadow'
                    : 'hover:bg-gray-100 text-black'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive(path) ? 'text-white' : 'text-blue-400'
                  }`}
                />
                {isOpen && <span className="text-sm font-medium">{label}</span>}
              </li>
            </Link>
          ))}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 mx-2 mb-4 rounded-lg transition-all duration-300 hover:bg-red-100 text-red-500"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Mobile Version Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md md:hidden">
        <ul className="flex justify-evenly items-center w-full h-16 px-2 z-50 p-1">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link to={path} key={label} className="flex-1">
              <li
                className={`flex flex-col items-center gap-1 ${
                  isActive(path)
                    ? 'bg-blue-400 text-white shadow py-2 px-4 rounded z-50'
                    : 'hover:bg-gray-100 text-black'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive(path) ? 'text-white' : 'text-blue-400'
                  }`}
                />
                <span className="text-xs font-medium text-center">{label}</span>
              </li>
            </Link>
          ))}

          {/* Logout Button for Mobile */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-red-500 hover:bg-red-100 py-2 px-4 rounded"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs font-medium text-center">Logout</span>
          </button>
        </ul>
      </div>
    </div>
  );
});

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;
