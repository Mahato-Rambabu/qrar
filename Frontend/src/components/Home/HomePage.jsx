import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import ImageSlider from './ImageSlider';
import MenuCategory from './MenuCategory';
import axiosInstance from '../../utils/axiosInstance';

const HomePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId'); // Get the restaurantId from the URL

  if (!restaurantId) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-red-500 text-lg">
          Restaurant ID is missing in the URL. Please scan a valid QR code.
        </p>
      </div>
    );
  }

  const [profileImage, setProfileImage] = useState('/default-profile.png'); // Default profile image
  const [loadSlider, setLoadSlider] = useState(false);
  const [loadCategory, setLoadCategory] = useState(false);

  useEffect(() => {
    // Fetch the profile image based on the restaurantId
    const fetchProfileImage = async () => {
      try {
        const response = await axiosInstance.get(`/restaurants/images/${restaurantId}`);

        // Corrected way to handle Axios response
        if (response.data && response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        } else {
          console.warn('No profile image found, using default.');
          setProfileImage('/default-profile.png');
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setProfileImage('/default-profile.png'); // Use default on error
      }
    };

    fetchProfileImage();
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

  return (
    <div className="h-screen w-full relative flex flex-col">
      <header className="w-full h-[12vh] min-h-[60px] flex justify-around items-center px-4 bg-white shadow-sm z-20">
        <SearchBar restaurantId={restaurantId} />
        <div className="flex items-center">
          <img
            src={profileImage}
            alt="Restaurant logo"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 object-cover"
            loading="lazy"
          />
        </div>
      </header>

      {/* Image Slider Section */}
      <main className="w-full" id="image-slider" style={{ height: '40vh' }}>
        {loadSlider && <ImageSlider />}
      </main>

      {/* Menu Categories Section */}
      <section 
        className="flex-grow w-full px-2 md:px-4 pt-2 pb-4" 
        id="menu-category"
        style={{ marginTop: '-2vh' }} // Compensate for slider's rounded bottom
      >
        {loadCategory && <MenuCategory />}
      </section>
    </div>
  );
};

export default HomePage;

