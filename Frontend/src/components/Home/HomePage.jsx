import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import ImageSlider from './ImageSlider';
import MenuCategory from './MenuCategory';
import PopularItems from './PopularItems'; // Import the PopularItems component
import axiosInstance from '../../utils/axiosInstance';
import Offers from '../Offers/Offers';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, Clock } from 'lucide-react';

const HomePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId'); // Get the restaurantId from the URL

  const [profileImage, setProfileImage] = useState('/default-profile.png'); // Default profile image
  const [loadSlider, setLoadSlider] = useState(false);
  const [loadCategory, setLoadCategory] = useState(false);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const [imagesResponse, detailsResponse] = await Promise.all([
          axiosInstance.get(`/restaurants/images/${restaurantId}`),
          axiosInstance.get(`/restaurants/profile/${restaurantId}`)
        ]);

        if (imagesResponse.data && imagesResponse.data.profileImage) {
          setProfileImage(imagesResponse.data.profileImage);
        }

        if (detailsResponse.data) {
          setRestaurantDetails(detailsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        setProfileImage('/default-profile.png');
      }
    };

    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  useEffect(() => {
    // Lazy load ImageSlider and MenuCategory when they enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id === 'image-slider') {
            setLoadSlider(true);
          }
          if (entry.isIntersecting && entry.target.id === 'menu-category') {
            setLoadCategory(true);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the component is visible
    );

    const sliderElement = document.getElementById('image-slider');
    const categoryElement = document.getElementById('menu-category');

    if (sliderElement) observer.observe(sliderElement);
    if (categoryElement) observer.observe(categoryElement);

    return () => observer.disconnect();
  }, []);

  if (!restaurantId) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-red-500 text-lg">
          Restaurant ID is missing in the URL. Please scan a valid QR code.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-gray-200">
      <header className="w-full h-[10%] flex items-center justify-between px-6 bg-gray-100">
        <button
          onClick={() => setShowRestaurantDetails(true)}
          className="flex items-center"
        >
          <img
            src={profileImage}
            alt="Restaurant logo"
            className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover hover:border-blue-500 transition-all duration-300"
            loading="lazy"
          />
        </button>
          <SearchBar restaurantId={restaurantId} />
      </header>

      <main className="w-full bg-white overflow-hidden" id="image-slider">
        {loadSlider && <ImageSlider />}
      </main>

      <PopularItems />
      <Offers />
      
      <section className="w-full bg-gray-100" id="menu-category"> {/* Added bg-gray-100 here */}
        {loadCategory && <MenuCategory />}
      </section>

      {/* Restaurant Details Modal */}
      <AnimatePresence>
        {showRestaurantDetails && restaurantDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
            onClick={() => setShowRestaurantDetails(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-t-3xl p-6 relative"
              onClick={e => e.stopPropagation()}
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

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <p>{restaurantDetails.address}</p>
                </div>

                {restaurantDetails.number && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p>{restaurantDetails.number}</p>
                  </div>
                )}

                {restaurantDetails.email && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <p>{restaurantDetails.email}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-gray-600">
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
