import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Offers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const handleClick = () => {
    navigate(`/offers?restaurantId=${restaurantId}`);
  };

  return (
    <div
      className="w-full p-4 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full max-w-md bg-gradient-to-r from-red-700 to-red-500 text-white rounded-xl shadow-xl p-6 flex items-center justify-between hover:scale-105 transition-transform duration-300">
        <div>
          <h2 className="text-3xl font-bold mb-2">FLAMES</h2>
          <p className="text-sm">Check out the hottest offers for you!</p>
        </div>
        <div className="text-xl font-semibold">Play now &rarr;</div>
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
          backgroundImage: "url('/flame-overlay.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}></div>
      </div>
    </div>
  );
};

export default Offers;