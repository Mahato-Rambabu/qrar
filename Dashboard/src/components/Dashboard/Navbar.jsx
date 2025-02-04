import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react'; // Import Lucide icons
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Navbar = ({ toggleSidebar }) => {

  const [profileImage, setProfileImage] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  // Inline skeleton image (a simple placeholder)
  const skeletonImage =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmaWxsPSIjY2NjIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIvPjwvc3ZnPg==';


      useEffect(() => {
        const fetchProfileImage = async () => {
          try {
    
            const response = await axiosInstance.get("/restaurants/profile");
    
            setProfileImage(response.data.profileImage);
            setRestaurantName(response.data.name);
          } catch (err) {
            console.error("Error fetching profile:", err);
          }
        };
    
        fetchProfileImage();
      }, []);
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between px-4 py-2">
        <div className='flex items-center gap-2'>

        
        {/* Hamburger Menu */}
        <button
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6 text-blue-400" />
        </button>

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-black">QRAR</h1>
        </div>

        {/* Restaurant Name */}
        <h2 className="text-lg font-semibold text-black">{restaurantName || 'Restaurant Name'}</h2>

        {/* Profile Section */}
        <Link to="/profile" className="flex items-center">
          <img
            src={profileImage || skeletonImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
          />
        </Link>
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden items-center justify-between px-4 py-2">
        {/* Restaurant Name */}
        <h2 className="text-lg font-semibold text-black">
          {restaurantName || 'Restaurant Name'}
        </h2>

        {/* Profile Section */}
        <Link to="/profile" className="flex items-center">
          <img
            src={profileImage || skeletonImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
          />
        </Link>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default memo(Navbar);
