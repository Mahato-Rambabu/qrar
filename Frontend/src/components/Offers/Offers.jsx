import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
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
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    if (isMobile && offers.length > 0) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide(prev => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMobile, offers]);

  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: {
      x: '0%',
      opacity: 1,
      transition: { ease: 'easeInOut', duration: 0.5 },
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { ease: 'easeInOut', duration: 0.5 },
    }),
  };

  const handleSwipe = (e, { offset }) => {
    const swipeThreshold = 50;
    if (offset.x > swipeThreshold) {
      // Swipe Right
      setDirection(-1);
      setCurrentSlide(prev => (prev - 1 + offers.length) % offers.length);
    } else if (offset.x < -swipeThreshold) {
      // Swipe Left
      setDirection(1);
      setCurrentSlide(prev => (prev + 1) % offers.length);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOfferText = (offer) => {
    if (offer.amountOff && Number(offer.amountOff) > 0) return `₹${offer.amountOff} OFF`;
    if (offer.percentOff && Number(offer.percentOff) > 0) return `${offer.percentOff}% OFF`;
    return '';
  };

  if (loading) {
    return (
      <div className="w-full p-4 pt-4 bg-gray-100">
        {isMobile ? (
          <div className="relative h-32 rounded-xl shadow-xl p-6">
            <Skeleton height={32} containerClassName="h-full" style={{ borderRadius: '0.75rem' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="relative h-32 rounded-xl shadow-xl p-6">
                <Skeleton height={32} containerClassName="h-full" style={{ borderRadius: '0.75rem' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-100">
      {offers.length > 0 && (
        isMobile ? (
          <div className="relative h-24 overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={offers[currentSlide]._id}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleSwipe}
                className="absolute inset-0 flex justify-center items-center cursor-grab active:cursor-grabbing"
              >
                <div className="flex w-full mx-auto max-w-sm rounded-2xl border-dashed border-2 border-orange-400 bg-white p-2 relative shadow-md overflow-hidden">
                  <span className="absolute top-1 right-2 text-[10px] text-gray-500">
                    Valid through {formatDate(offers[currentSlide].expirationTime)}
                  </span>
                  <div className="flex flex-col items-center justify-center px-2 border-r border-dashed border-orange-300 text-center">
                    <img
                      src={offers[currentSlide].logoUrl || "/default-logo.png"}
                      alt="Logo"
                      className="w-10 h-10 rounded-full object-cover mb-1"
                    />
                    <span className="text-[10px] text-gray-500">Avail Now*</span>
                  </div>
                  <div className="flex-1 pl-3 pr-1 flex flex-col justify-center">
                    <h2 className="text-sm font-bold text-orange-600 truncate">
                      {offers[currentSlide].title}
                    </h2>
                    <p className="text-[11px] text-gray-500 truncate">
                      {offers[currentSlide].description || 'Enjoy a special discount!'}
                    </p>
                    {offers[currentSlide].discountPercentage && (
                      <span className="absolute bottom-2 right-4 text-red-500 text-md font-bold rounded-full">
                        {offers[currentSlide].discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <motion.div
                key={offer._id}
                className="bg-white border border-dashed border-orange-400 rounded-2xl shadow-md p-4 flex items-center gap-4 hover:scale-105 transition-transform"
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src={offer.logoUrl || "/default-logo.png"}
                  alt="Restaurant Logo"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-end text-xs text-gray-500 mb-1">
                    Valid through {formatDate(offer.expirationTime)}
                  </div>
                  <h2 className="text-md font-bold text-orange-600">{offer.title}</h2>
                  <p className="text-sm text-gray-600">{offer.description || "Enjoy a special discount!"}</p>
                  <div className="text-xl font-extrabold text-orange-600 mt-1">
                    {getOfferText(offer)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Offers;