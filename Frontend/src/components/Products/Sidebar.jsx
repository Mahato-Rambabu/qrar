import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/categoryApi';

const Sidebar = ({ selectedCategory, onSelectCategory, restaurantId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCategories = async () => {
      if (!restaurantId) {
        console.error('Restaurant ID is missing.');
        setError('Restaurant ID is required to fetch categories.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchCategories(restaurantId);
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err.message);
        setError('Unable to fetch categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, [restaurantId]); // Re-fetch categories when restaurantId changes

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-pink-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-[20%] bg-gray-100 border-r overflow-y-auto pb-4">
      {/* "All Categories" Button */}
      <button
        className={`w-full flex items-center lg:flex-row flex-col lg:text-left text-center py-2 px-4 transition-all ${
          selectedCategory === 'all'
            ? 'bg-gray-500 text-white border-l-4 border-x-gray-900'
            : 'hover:bg-gray-200'
        }`}
        onClick={() => onSelectCategory('all')}
      >
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden lg:mr-4 mb-2 lg:mb-0">
          <img
            src="/imgAll.jpg" // Replace with your "All" category image
            alt="All Categories"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm break-words">All</span>
      </button>

      {/* Dynamically Rendered Category Buttons */}
      {categories.map((category) => (
        <button
          key={category._id}
          className={`w-full flex items-center lg:flex-row flex-col lg:text-left text-center py-2 px-4 mt-4 transition-all ${
            selectedCategory === category._id
              ? 'bg-gray-500 text-white border-l-4 border-x-gray-900'
              : 'hover:bg-gray-200'
          }`}
          onClick={() => onSelectCategory(category._id)}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden lg:mr-4 mb-2 lg:mb-0">
            <img
              src={category.img || '/placeholder.png'} // Use Cloudinary URL or fallback placeholder
              alt={category.catName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm break-words">{category.catName}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;