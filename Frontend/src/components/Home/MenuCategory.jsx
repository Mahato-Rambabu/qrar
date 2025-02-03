import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/categoryApi';
import { FaCircleChevronRight } from 'react-icons/fa6';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MenuCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
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
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <AiOutlineLoading3Quarters className="animate-spin text-gray-500 text-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 px-2">
        <p className="text-sm">{error}</p>
        <button
          className="mt-2 px-3 py-1.5 bg-pink-500 text-white rounded text-sm"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-1">
      <h1 className="text-lg font-bold text-center text-pink-500 pt-2">Menu</h1>
      <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 mt-2">
        {categories.map((category) => (
          <Card
            key={category._id}
            image={category.img}
            name={category.catName}
            price={category.price}
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

const Card = ({ image, name, price, categoryId, restaurantId, navigate }) => (
  <div className="bg-white rounded-lg p-1.5 shadow-sm hover:shadow-md transition-shadow h-full">
    <div className="aspect-square overflow-hidden rounded-md mb-1">
      <img
        src={`${image || '/placeholder.png'}?w=400&h=400&c=fill`}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <h3 className="text-sm font-semibold text-gray-800 truncate">{name}</h3>
    <div className="flex justify-between items-center mt-1">
      <p className="text-xs text-gray-600">{price}*</p>
      <button
        className="px-2 py-0.5 text-pink-500 border border-pink-500 rounded-full text-xs hover:bg-pink-600 hover:text-white transition-colors"
        onClick={() => navigate(`/products?restaurantId=${restaurantId}&categoryId=${categoryId}`)}
      >
        More
      </button>
    </div>
  </div>
);

const SeeAllCard = ({ restaurantId, navigate }) => (
  <div
    onClick={() => navigate(`/products?restaurantId=${restaurantId}`)}
    className="bg-pink-500 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors h-full"
  >
    <span className="text-white text-sm text-center font-medium">View All</span>
    <FaCircleChevronRight size={20} className="text-white mt-1" />
  </div>
);

export default MenuCategory;
