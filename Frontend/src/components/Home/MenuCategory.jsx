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
    <div className="w-full px-4 pb-2 bg-gray-100">
      <h1 className="text-xl font-bold text-center pt-4 text-black">Menu</h1>
      <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
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
    onClick={() => navigate(`/products?restaurantId=${restaurantId}&categoryId=${categoryId}`)}
  >
    <img
      src={image || '/placeholder.png'}
      alt={name}
      className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl shadow-sm"
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
    <div className="w-24 h-24 md:w-28 md:h-28 bg-pink-500 rounded-xl flex items-center justify-center shadow-sm">
      <FaCircleChevronRight size={28} className="text-white" />
    </div>
    <h3 className="text-sm font-semibold text-center mt-2 text-black">See All</h3>
  </div>
);

export default MenuCategory;
