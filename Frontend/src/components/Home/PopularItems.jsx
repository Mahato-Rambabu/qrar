import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PopularItems = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchPopularItems = async () => {
      try {
        const response = await axiosInstance.get(`/orders/top-products/${restaurantId}`);
        setPopularItems(response.data);
      } catch (err) {
        console.error("Error fetching popular items:", err);
        setError("Error fetching popular items");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularItems();
  }, [restaurantId]);

  if (loading) {
    return (
      <section className="popular-items my-4 px-4">
        <p>Loading popular items...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="popular-items my-4 px-4">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="popular-items mt-4 px-4 bg-gray-100">
      <h1 className="text-xl font-bold text-center pt-4 text-black">Popular</h1>
      {/* Adjusted container height and spacing for reduced vertical gap */}
      <div className="relative h-56 w-full">
        {/* Top (#1) product centered */}
        {popularItems.length >= 1 && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="relative">
              <img
                src={popularItems[0].productImage}
                alt={popularItems[0].productName}
                className="w-16 h-16 rounded-full object-cover border border-gray-300"
              />
              <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
                #1
              </span>
            </div>
            <span className="mt-1 text-sm text-center">{popularItems[0].productName}</span>
          </div>
        )}

        {/* Bottom left (#2) product */}
        {popularItems.length >= 2 && (
          <div className="absolute bottom-2 left-4 flex flex-col items-center">
            <div className="relative">
              <img
                src={popularItems[1].productImage}
                alt={popularItems[1].productName}
                className="w-16 h-16 rounded-full object-cover border border-gray-300"
              />
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
                #2
              </span>
            </div>
            <span className="mt-1 text-sm text-center">{popularItems[1].productName}</span>
          </div>
        )}

        {/* Bottom right (#3) product */}
        {popularItems.length >= 3 && (
          <div className="absolute bottom-2 right-4 flex flex-col items-center">
            <div className="relative">
              <img
                src={popularItems[2].productImage}
                alt={popularItems[2].productName}
                className="w-16 h-16 rounded-full object-cover border border-gray-300"
              />
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
                #3
              </span>
            </div>
            <span className="mt-1 text-sm text-center">{popularItems[2].productName}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularItems;
