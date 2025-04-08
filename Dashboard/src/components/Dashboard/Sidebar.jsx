import React, { memo, useCallback, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  ChartLine,
  QrCode,
  LogOut,
  Menu,         // Hamburger icon (for mobile and collapsed toggle in mobile)
  X,            // Close icon (for mobile overlay)
  Heart,        // Icon for Loyalty (for dropdown header)
  Image,        // Icon for Pop Ups
  ChevronDown,  // Drop arrow (for expanded sidebar when Loyalty is closed)
  ChevronUp,    // Drop arrow (for expanded sidebar when Loyalty is open)
  Tag,          // New icon for Offer Page
  Percent,      // New icon for Coupon Code
  Lock          // Lock icon for visually locked items
} from 'lucide-react';
import PropTypes from 'prop-types';
import axiosInstance from '../../utils/axiosInstance';
// Import your toast library (example uses react-hot-toast)
import toast from 'react-hot-toast';

const Sidebar = memo(({ isOpen: pcSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to toggle Loyalty sub-menu (applies to both PC and mobile)
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  // Local state for mobile overlay sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Update mobile sidebar state when pcSidebarOpen changes
  useEffect(() => {
    if (pcSidebarOpen) {
      setMobileSidebarOpen(true);
    } else {
      setMobileSidebarOpen(false);
    }
  }, [pcSidebarOpen]);

  // Helper to check if a menu item is active based on current location
  const isActive = useCallback(
    (path) => {
      // For the Products menu item, check if the path is /products
      if (path === '/categories') {
        return location.pathname === path || location.pathname === '/products';
      }
      // For other menu items, check for exact match
      return location.pathname === path;
    },
    [location]
  );

  // Define locked paths for features that are not yet available
  const lockedPaths = ['/loyalty/combo-deals', '/loyalty/coupon-code'];

  // Handle click for locked features
  const handleLockedFeatureClick = (e) => {
    // e.preventDefault();
    toast.success('Coming soon!',{
      iconTheme: {
        primary: '#2563EB',
        secondary: 'white',
      },
    });
  };

  // Define menu items; Loyalty now has subItems with updated icons
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: ChartLine },
    { path: '/categories', label: 'Products', icon: Package },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/customers', label: 'Customers', icon: Users },
    {
      label: 'Loyalty',
      icon: Heart,
      subItems: [
        { path: '/loyalty/popups', label: 'Pop Ups', icon: Image },
        { path: '/loyalty/offers', label: 'Offer Page', icon: Tag },
        { path: '/loyalty/combo-deals', label: 'Combo-deals', icon: Package },
        { path: '/loyalty/coupon-code', label: 'Coupon Code', icon: Percent },
      ],
    },
    { path: '/qrcode', label: 'QR Page', icon: QrCode },
  ];

  // Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    axiosInstance.post('/restaurants/logout');
    navigate('/login');
  };

  /* =========================
       PC Sidebar (Desktop)
  ========================= */
  const renderPcSidebar = () => (
    <div
      className={`fixed top-[8vh] left-0 h-[92vh] bg-white shadow-md transition-transform duration-300 flex flex-col justify-between ${
        pcSidebarOpen ? 'md:w-[20%]' : 'md:w-[5%]'
      } w-[60%] sm:w-[40%] hidden md:flex transform ${
        pcSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{ zIndex: 10 }}
    >
      {/* Menu Items */}
      <ul className="flex flex-col gap-2 py-4">
        {menuItems.map((item) => {
          // Render Loyalty as dropdown if subItems exist
          if (item.subItems) {
            const loyaltyActive = item.subItems.some((sub) => isActive(sub.path));

            return (
              <div
                key={item.label}
                className="relative"
                // For collapsed sidebar, open Loyalty on hover
                onMouseEnter={() => {
                  if (!pcSidebarOpen) setIsLoyaltyOpen(true);
                }}
                onMouseLeave={() => {
                  if (!pcSidebarOpen) setIsLoyaltyOpen(false);
                }}
              >
                <div
                  onClick={() => {
                    // When sidebar is expanded, toggle on click
                    if (pcSidebarOpen) {
                      setIsLoyaltyOpen((prev) => !prev);
                    }
                  }}
                  className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    loyaltyActive
                      ? 'bg-blue-400 text-white shadow'
                      : 'hover:bg-gray-100 text-black'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      loyaltyActive ? 'text-white' : 'text-blue-400'
                    }`}
                  />
                  {pcSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {pcSidebarOpen && (
                    <>
                      {isLoyaltyOpen ? (
                        <ChevronUp
                          className="w-4 h-4 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsLoyaltyOpen(false);
                          }}
                        />
                      ) : (
                        <ChevronDown
                          className="w-4 h-4 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsLoyaltyOpen(true);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
                {/* Expanded Loyalty Sub-Menu */}
                {isLoyaltyOpen && pcSidebarOpen && (
                  <ul className="pl-12">
                    {item.subItems.map((sub) => {
                      const isLocked = lockedPaths.includes(sub.path);
                      if (isLocked) {
                        return (
                          <div
                            key={sub.label}
                            onClick={handleLockedFeatureClick}
                            className={`cursor-pointer flex items-center gap-4 px-4 py-2 mx-2 rounded-lg transition-all duration-300 ${
                              isActive(sub.path)
                                ? 'bg-blue-200 text-white'
                                : 'hover:bg-gray-100 text-gray-400'
                            }`}
                          >
                            <sub.icon
                              className={`w-4 h-4 ${
                                isActive(sub.path)
                                  ? 'text-white'
                                  : 'text-blue-400'
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {sub.label}
                            </span>
                            <Lock className="w-4 h-4 text-black ml-auto" 
                                  size={16}
                            />
                          </div>
                        );
                      }
                      return (
                        <Link to={sub.path} key={sub.label}>
                          <li
                            className={`flex items-center gap-4 px-4 py-2 mx-2 rounded-lg transition-all duration-300 ${
                              isActive(sub.path)
                                ? 'bg-blue-400 text-white'
                                : 'hover:bg-gray-100 text-black'
                            }`}
                          >
                            <sub.icon
                              className={`w-4 h-4 ${
                                isActive(sub.path)
                                  ? 'text-white'
                                  : 'text-blue-400'
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {sub.label}
                            </span>
                          </li>
                        </Link>
                      );
                    })}
                  </ul>
                )}
                {/* Collapsed Loyalty Sub-Menu (icons only) */}
                {isLoyaltyOpen && !pcSidebarOpen && (
                  <ul className="absolute left-full top-0 mt-1 bg-white shadow-lg rounded-lg z-10">
                    {item.subItems.map((sub) => {
                      const isLocked = lockedPaths.includes(sub.path);
                      if (isLocked) {
                        return (
                          <div
                            key={sub.label}
                            onClick={handleLockedFeatureClick}
                            title={sub.label}
                            className={`relative cursor-pointer flex items-center justify-center w-12 h-12 p-2 rounded-lg transition-all duration-300 ${
                              isActive(sub.path)
                                ? 'bg-blue-400 text-white'
                                : 'hover:bg-gray-100 text-black'
                            }`}
                          >
                            <sub.icon
                              className={`w-4 h-4 ${
                                isActive(sub.path)
                                  ? 'text-white'
                                  : 'text-blue-200'
                              }`}
                            />
                            <Lock className="absolute  w-4 h-4  text-black" />
                          </div>
                        );
                      }
                      return (
                        <Link to={sub.path} key={sub.label}>
                          <li
                            title={sub.label}
                            className={`flex items-center h-12 w-12 justify-center p-2 rounded-lg transition-all duration-300 ${
                              isActive(sub.path)
                                ? 'bg-blue-400 text-white'
                                : 'hover:bg-gray-100 text-black'
                            }`}
                          >
                            <sub.icon
                              className={`w-4 h-4 ${
                                isActive(sub.path)
                                  ? 'text-white'
                                  : 'text-blue-400'
                              }`}
                            />
                          </li>
                        </Link>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          } else {
            // For non-Loyalty items, render as usual
            return (
              <Link to={item.path} key={item.label}>
                <li
                  className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-blue-400 text-white shadow'
                      : 'hover:bg-gray-100 text-black'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive(item.path) ? 'text-white' : 'text-blue-400'
                    }`}
                  />
                  {pcSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </li>
              </Link>
            );
          }
        })}
      </ul>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-3 mx-2 mb-4 rounded-lg transition-all duration-300 hover:bg-red-100 text-red-500"
      >
        <LogOut className="w-5 h-5" />
        {pcSidebarOpen && <span className="text-sm font-medium">Logout</span>}
      </button>
    </div>
  );

  /* =========================
       Mobile Sidebar Overlay
  ========================= */
  const renderMobileSidebar = () => (
    <>
      {/* Overlay Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar Content */}
          <div className="relative z-50 w-3/4 max-w-xs bg-white h-full shadow-md p-4 overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>
            </div>

            {/* Menu Items */}
            <ul className="flex flex-col gap-2 py-4">
              {menuItems.map((item) => {
                if (item.subItems) {
                  const loyaltyActive = item.subItems.some((sub) =>
                    isActive(sub.path)
                  );
                  return (
                    <div key={item.label}>
                      <div
                        onClick={() =>
                          setIsLoyaltyOpen((prev) => !prev)
                        }
                        className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          loyaltyActive
                            ? 'bg-blue-400 text-white shadow'
                            : 'hover:bg-gray-100 text-black'
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            loyaltyActive ? 'text-white' : 'text-blue-400'
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        {isLoyaltyOpen ? (
                          <ChevronUp
                            className="w-4 h-4 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLoyaltyOpen(false);
                            }}
                          />
                        ) : (
                          <ChevronDown
                            className="w-4 h-4 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLoyaltyOpen(true);
                            }}
                          />
                        )}
                      </div>
                      {isLoyaltyOpen && (
                        <ul className="pl-12">
                          {item.subItems.map((sub) => {
                            const isLocked = lockedPaths.includes(sub.path);
                            if (isLocked) {
                              return (
                                <div
                                  key={sub.label}
                                  onClick={() => {
                                    handleLockedFeatureClick();
                                    setMobileSidebarOpen(false);
                                  }}
                                  className={`relative cursor-pointer flex items-center gap-4 px-4 py-2 mx-2 rounded-lg transition-all duration-300 ${
                                    isActive(sub.path)
                                      ? 'bg-blue-400 text-white'
                                      : 'hover:bg-gray-100 text-black'
                                  }`}
                                >
                                  <sub.icon
                                    className={`w-4 h-4 ${
                                      isActive(sub.path)
                                        ? 'text-white'
                                        : 'text-blue-300'
                                    }`}
                                  />
                                  <span className="text-sm text-gray-400 font-medium">
                                    {sub.label}
                                  </span>
                                  <Lock className="w-3 h-3 text-black ml-auto" />
                                </div>
                              );
                            }
                            return (
                              <Link
                                to={sub.path}
                                key={sub.label}
                                onClick={() => setMobileSidebarOpen(false)}
                              >
                                <li
                                  className={`flex items-center gap-4 px-4 py-2 mx-2 rounded-lg transition-all duration-300 ${
                                    isActive(sub.path)
                                      ? 'bg-blue-400 text-white'
                                      : 'hover:bg-gray-100 text-black'
                                  }`}
                                >
                                  <sub.icon
                                    className={`w-4 h-4 ${
                                      isActive(sub.path)
                                        ? 'text-white'
                                        : 'text-blue-400'
                                    }`}
                                  />
                                  <span className="text-sm font-medium">
                                    {sub.label}
                                  </span>
                                </li>
                              </Link>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <Link
                      to={item.path}
                      key={item.label}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <li
                        className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all duration-300 ${
                          isActive(item.path)
                            ? 'bg-blue-400 text-white shadow'
                            : 'hover:bg-gray-100 text-black'
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive(item.path)
                              ? 'text-white'
                              : 'text-blue-400'
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </li>
                    </Link>
                  );
                }
              })}
            </ul>

            {/* Logout Button */}
            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-4 px-4 py-3 mx-2 mb-4 rounded-lg transition-all duration-300 hover:bg-red-100 text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div>
      {renderPcSidebar()}
      {renderMobileSidebar()}
    </div>
  );
});

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;
