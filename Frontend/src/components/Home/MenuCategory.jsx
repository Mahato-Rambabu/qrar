import React, { useEffect, useState, useRef } from 'react';
import { fetchCategories } from '../../api/categoryApi';
import { FaCircleChevronRight } from 'react-icons/fa6';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SERVER_BASE_URL = 'https://qrar.onrender.com';

const MenuCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const navigate = useNavigate();

  // Cache for menu categories keyed by restaurantId
  const menuCategoriesCacheRef = useRef({});

  useEffect(() => {
    const getCategories = async () => {
      if (!restaurantId) {
        setError('Restaurant ID is missing. Please scan a valid QR code.');
        setLoading(false);
        return;
      }

      // Use cached categories if available
      if (menuCategoriesCacheRef.current[restaurantId]) {
        setCategories(menuCategoriesCacheRef.current[restaurantId]);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCategories(restaurantId);
        setCategories(data);
        // Cache the fetched categories for this restaurantId
        menuCategoriesCacheRef.current[restaurantId] = data;
      } catch (err) {
        setError('Unable to fetch menu categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, [restaurantId]);

  if (loading) {
    // Render skeletons for the menu category grid
    return (
      <div className="w-full px-4 pb-4 bg-gray-100">
        <h1 className="text-xl font-bold text-center text-black">Menu</h1>
        <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <Skeleton 
                height={96} // ~w-24 h-24 for mobile (adjust as needed)
                width={96} 
                className="rounded-xl shadow-sm"
              />
              <Skeleton 
                height={20} 
                width={80} 
                className="mt-2" 
              />
            </div>
          ))}
        </div>
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
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-4 bg-gray-100">
      <h1 className="text-xl font-bold text-center text-black">Menu</h1>
      <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        {categories.map((category) => (
          <Card
            key={category._id}
            image={category.img}
            name={category.catName}
            categoryId={category._id}
            restaurantId={restaurantId}
            navigate={navigate}
          />
        ))}
        <SeeAllCard restaurantId={restaurantId} navigate={navigate} />
      </div>
    </div>
  );
};

const Card = ({ image, name, categoryId, restaurantId, navigate }) => (
  <div
    className="flex flex-col items-center cursor-pointer"
    onClick={() => navigate(`/products?categoryId=${categoryId}&restaurantId=${restaurantId}`)}
  >
    <img
      src={image || '/placeholder.png'}
      alt={name}
      className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl shadow-gray-500 shadow-sm"
      loading="lazy"
    />
    <h3 className="text-sm font-semibold text-center mt-2 text-black">{name}</h3>
  </div>
);

const SeeAllCard = ({ restaurantId, navigate }) => (
  <div
    onClick={() => navigate(`/products?restaurantId=${restaurantId}`)}
    className="flex flex-col items-center justify-center cursor-pointer"
  >
    <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-500 shadow-gray-500 shadow-sm rounded-xl flex items-center justify-center">
      <FaCircleChevronRight size={28} className="text-white" />
    </div>
    <h3 className="text-sm font-semibold text-center mt-2 text-black">See All</h3>
  </div>
);

export default MenuCategory;
