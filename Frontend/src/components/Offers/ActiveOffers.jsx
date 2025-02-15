import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ActiveOffers = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axiosInstance.get(`/offer/${restaurantId}/active`);
        setOffers(response.data);
      } catch (err) {
        console.error('Failed to fetch offers:', err);
        setError('Failed to load active offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchOffers();
  }, [restaurantId]);

  if (loading) return <div className="text-center mt-6">Loading offers...</div>;
  if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Active Offers</h2>
      {offers.length > 0 ? (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div key={offer._id} className="bg-white shadow-md rounded-lg p-4 hover:scale-105 transition-transform">
              <img src={offer.img} alt={offer.title} className="w-full h-40 object-cover rounded-md mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{offer.description}</p>
              <div className="text-sm text-green-600 font-medium">
                Available: {offer.startTime} - {offer.endTime}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Discount: {offer.discountCondition.discountPercentage}% off on bills above ₹{offer.discountCondition.minBillAmount}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No active offers available.</div>
      )}
    </div>
  );
};

export default ActiveOffers;
