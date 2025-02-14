import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import ImageSlider from './ImageSlider';
import MenuCategory from './MenuCategory';
import PopularItems from './PopularItems'; // Import the PopularItems component
import axiosInstance from '../../utils/axiosInstance';
import Offers from '../Offers/Offers';

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

        if (response.data && response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        } else {
          console.warn('No profile image found, using default.');
          setProfileImage('/default-profile.png');
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setProfileImage('/default-profile.png');
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
    <div className="h-screen w-full relative bg-gray-200">
      <header className="w-full h-[10%] flex justify-around items-center bg-gray-500">
        <SearchBar restaurantId={restaurantId} />
        <div className="flex items-center">
          <img
            src={profileImage}
            alt="Restaurant logo"
            className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
            loading="lazy"
          />
        </div>
      </header>

      <main className="w-full bg-white overflow-hidden" id="image-slider">
        {loadSlider && <ImageSlider />}
      </main>

      <PopularItems />
      <Offers />
      
      <section className="w-full bg-gray-100" id="menu-category"> {/* Added bg-gray-100 here */}
        {loadCategory && <MenuCategory />}
      </section>
    </div>
  );
};

export default HomePage;
