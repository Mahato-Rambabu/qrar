import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/categoryApi';
import { FaCircleChevronRight } from 'react-icons/fa6';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SERVER_BASE_URL = 'https://qrar.onrender.com';

const MenuCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId'); // Extract restaurantId from URL
  const navigate = useNavigate();

  useEffect(() => {
    const getCategories = async () => {
      if (!restaurantId) {
        setError('Restaurant ID is missing. Please scan a valid QR code.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCategories(restaurantId);
        setCategories(data);
      } catch (err) {
        setError('Unable to fetch menu categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, [restaurantId]); // Fetch categories whenever restaurantId changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <AiOutlineLoading3Quarters className="animate-spin text-gray-500 text-3xl" />
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
    <div className="w-full px-4 pb-2">
      <h1 className="text-xl font-bold text-center pt-4 text-black">Menu</h1>
      <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {categories.map((category) => (
          <Card
            key={category._id}
            image={category.img}
            name={category.catName}
            price={category.price}
            categoryId={category._id}
            restaurantId={restaurantId}  // Pass restaurantId to Card
            navigate={navigate}
          />
        ))}
        <SeeAllCard
          restaurantId={restaurantId}  // Pass restaurantId to SeeAllCard
          navigate={navigate}
        />
      </div>
    </div>
  );
};

const Card = ({ image, name, price, categoryId, restaurantId, navigate }) => (
  <div className="bg-none rounded-lg p-2 flex flex-col justify-between transform hover:scale-105 transition-transform duration-200">
    <img
     src={image || '/placeholder.png'} 
      alt={name}
      className="w-full h-20 md:h-32 object-cover rounded-md mb-2"
      loading="lazy"
    />
    <h3 className="text-sm font-medium">{name}</h3>
    <div className="flex justify-between items-center mt-2">
      <p className="text-sm text-gray-500">{price}*</p>
      <button
        className="px-3 py-1 text-pink-500 border border-pink-500 rounded-full text-xs hover:bg-pink-600 hover:text-white transition-colors"
        onClick={() => navigate(`/products?restaurantId=${restaurantId}&categoryId=${categoryId}`)} // Include restaurantId
      >
        More
      </button>
    </div>
  </div>
);

const SeeAllCard = ({ restaurantId, navigate }) => (
  <div
    onClick={() => navigate(`/products?restaurantId=${restaurantId}`)} // Include restaurantId
    className="bg-pink-500 rounded-lg shadow-md flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-pink-600 transition-colors"
  >
    <button className="text-white text-lg font-semibold">See All</button>
    <FaCircleChevronRight size={28} className="text-white mt-2" />
  </div>
);

export default MenuCategory;
