import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import ImageSlider from './ImageSlider';
import MenuCategory from './MenuCategory';
import PopularItems from './PopularItems';
import Offers from '../Offers/Offers';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, Clock } from 'lucide-react';

const HomePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const [profileImage, setProfileImage] = useState('/default-profile.png');
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [loadSlider, setLoadSlider] = useState(false);
  const [loadCategory, setLoadCategory] = useState(false);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);

  // Fetch restaurant images and details
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const [imagesRes, detailsRes] = await Promise.all([
          axiosInstance.get(`/restaurants/images/${restaurantId}`),
          axiosInstance.get(`/restaurants/profile/${restaurantId}`)
        ]);

        if (imagesRes?.data?.profileImage) {
          setProfileImage(imagesRes.data.profileImage);
        }

        if (detailsRes?.data) {
          setRestaurantDetails(detailsRes.data);
        }
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setProfileImage('/default-profile.png');
      }
    };

    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  // Lazy load components when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'image-slider') setLoadSlider(true);
            if (entry.target.id === 'menu-category') setLoadCategory(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sliderEl = document.getElementById('image-slider');
    const categoryEl = document.getElementById('menu-category');

    if (sliderEl) observer.observe(sliderEl);
    if (categoryEl) observer.observe(categoryEl);

    return () => observer.disconnect();
  }, []);

  // Fallback for missing restaurantId
  if (!restaurantId) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg text-center px-4">
          Restaurant ID is missing in the URL. Please scan a valid QR code.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-200">
      {/* Header */}
      <header className="w-full h-[10%] flex items-center justify-evenly bg-gray-100 px-4">
        <button onClick={() => setShowRestaurantDetails(true)}>
          <img
            src={profileImage}
            alt="Restaurant logo"
            className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover hover:border-blue-500 transition duration-300"
            loading="lazy"
          />
        </button>
        <SearchBar restaurantId={restaurantId} />
      </header>

      {/* Image Slider */}
      <main className="w-full bg-white overflow-hidden" id="image-slider">
        {loadSlider && <ImageSlider />}
      </main>

      {/* Popular Items */}
      <div className="overflow-hidden w-full">
        <PopularItems />
      </div>

      {/* Offers */}
      <div className="w-full overflow-hidden">
        <Offers />
      </div>

      {/* Menu Category */}
      <section className="w-full bg-gray-100" id="menu-category">
        {loadCategory && <MenuCategory />}
      </section>

      {/* Restaurant Details Modal */}
      <AnimatePresence>
        {showRestaurantDetails && restaurantDetails && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRestaurantDetails(false)}
          >
            <motion.div
              className="bg-white w-full max-w-lg rounded-t-3xl p-6 relative"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRestaurantDetails(false)}
                className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>

              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={profileImage}
                  alt={restaurantDetails.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {restaurantDetails.name}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {restaurantDetails.description || 'Welcome to our restaurant'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <p>{restaurantDetails.address}</p>
                </div>

                {restaurantDetails.number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p>{restaurantDetails.number}</p>
                  </div>
                )}

                {restaurantDetails.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <p>{restaurantDetails.email}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <p>Open Now • 9:00 AM - 11:00 PM</p>
                </div>

                {restaurantDetails.bannerImage && (
                  <img
                    src={restaurantDetails.bannerImage}
                    alt="Restaurant banner"
                    className="w-full h-40 object-cover rounded-xl mt-4"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;