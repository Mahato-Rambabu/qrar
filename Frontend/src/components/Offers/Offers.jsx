import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { BadgePercent } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Offers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch offers
  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchOffersData = async () => {
      try {
        const response = await axiosInstance.get(`/offer/${restaurantId}`);
        const data = response.data;
        let offersArray = [];
        if (data.all) offersArray = offersArray.concat(data.all);
        if (data.categories) {
          Object.values(data.categories).forEach(arr => {
            offersArray = offersArray.concat(arr);
          });
        }
        if (data.products) {
          Object.values(data.products).forEach(arr => {
            offersArray = offersArray.concat(arr);
          });
        }
        setOffers(offersArray);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffersData();
  }, [restaurantId]);

  // Mobile auto-slide for offers (every 5 seconds)
  useEffect(() => {
    if (isMobile && offers.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMobile, offers]);

  const gradients = [
    "bg-gradient-to-r from-gray-500 to-red-500",
    "bg-gradient-to-r from-blue-500 to-gray-500",
    "bg-gradient-to-r from-gray-500 to-pink-500",
    "bg-gradient-to-r from-indigo-500 to-gray-500",
    "bg-gradient-to-r from-gray-500 to-teal-500",
    "bg-gradient-to-r from-orange-500 to-gray-500",
  ];

  const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: "0%", opacity: 1, transition: { ease: 'easeInOut', duration: 0.5 } },
    exit: { x: "-100%", opacity: 0, transition: { ease: 'easeInOut', duration: 0.5 } },
  };

  // Skeleton placeholder for loading state
  if (loading) {
    return (
      <div className="w-full p-4 pt-4 bg-gray-100">
        {isMobile ? (
          <div className="relative h-32 rounded-xl shadow-xl p-6">
            <Skeleton
              height={32}
              containerClassName="h-full"
              style={{ borderRadius: '0.75rem' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="relative h-32 rounded-xl shadow-xl p-6"
              >
                <Skeleton
                  height={32}
                  containerClassName="h-full"
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-4 pt-4 bg-gray-100">
      {offers.length > 0 ? (
        isMobile ? (
          <div className="relative h-32 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={offers[currentSlide]._id}
                className={`absolute inset-0 rounded-xl shadow-xl p-6 flex flex-col justify-center cursor-pointer ${gradients[currentSlide % gradients.length]}`}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  const swipe = info.offset.x;
                  if (swipe < -50) {
                    setCurrentSlide((prev) => (prev + 1) % offers.length);
                  } else if (swipe > 50) {
                    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
                  }
                }}
              >
                {offers[currentSlide].discountPercentage && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    {offers[currentSlide].discountPercentage}% off
                  </span>
                )}
                <h2 className="text-lg font-bold mb-2 animate-pulse text-white flex items-center">
                  <BadgePercent size={20} className="mr-2" /> 
                  {offers[currentSlide].title}
                </h2>
                <p className="text-sm text-gray-100">Check out the hottest offers for you!</p>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {offers.map((offer, index) => (
              <motion.div
                key={offer._id}
                className={`relative h-32 rounded-xl shadow-xl p-6 flex flex-col justify-center cursor-pointer ${gradients[index % gradients.length]}`}
                whileHover={{ scale: 1.05 }}
              >
                {offer.discountPercentage && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {offer.discountPercentage}% off
                  </span>
                )}
                <h2 className="text-lg font-bold mb-2 animate-pulse text-white flex items-center">
                  <BadgePercent size={20} className="mr-2" /> 
                  {offer.title}
                </h2>
                <p className="text-sm text-white">Check out the hottest offers for you!</p>
              </motion.div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
};

export default Offers;
