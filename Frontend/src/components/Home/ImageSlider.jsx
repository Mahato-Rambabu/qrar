import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RiArrowLeftWideFill, RiArrowRightWideFill } from 'react-icons/ri';
import { fetchSliderImages } from '../../api/fetchSliderImages';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Helper function to extract query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ImageSlider = () => {
  const query = useQuery();
  const restaurantId = query.get('restaurantId'); // Extract restaurantId from query parameters
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const touchStartX = useRef(null);
  const swipeThreshold = 50; // Minimum distance to be considered a swipe

  useEffect(() => {
    if (!restaurantId) {
      setError('Restaurant ID is missing in the URL.');
      setLoading(false);
      return;
    }

    const loadImages = async () => {
      try {
        const fetchedImages = await fetchSliderImages(restaurantId);
        const formattedImages = fetchedImages.map((image) =>
          image.img ? image.img : '/placeholder.png'
        );
        setImages(formattedImages);
      } catch (err) {
        console.error('Error fetching slider images:', err.message);
        setError('Unable to fetch slider images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [restaurantId]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        handleNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images]);

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    if (deltaX > swipeThreshold) {
      handlePrev();
    } else if (deltaX < -swipeThreshold) {
      handleNext();
    }
  };

  if (loading) {
    // Render a skeleton placeholder that matches the slider's dimensions
    return (
      <div
        className="relative w-full overflow-hidden rounded-b-[8%] bg-gray-100"
        style={{
          aspectRatio: '16/9',
          maxHeight: '45vh',
        }}
      >
        <Skeleton 
          height="100%" 
          width="100%" 
          containerClassName="h-full w-full" 
          style={{ borderRadius: '0 0 8% 8%' }} 
        />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (images.length === 0) {
    return <div className="p-4">No images available for the slider.</div>;
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-b-[8%] bg-gray-100"
      style={{
        aspectRatio: '16/9',
        maxHeight: '45vh',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows */}
      <div className="absolute inset-0 flex items-center justify-between z-10">
        <button
          onClick={handlePrev}
          className="p-2 text-gray-100 text-3xl md:text-4xl hover:bg-black/10 transition-all"
        >
          <RiArrowLeftWideFill />
        </button>
        <button
          onClick={handleNext}
          className="p-2 text-gray-100 text-3xl md:text-4xl hover:bg-black/10 transition-all"
        >
          <RiArrowRightWideFill />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]}
          alt={`Slider ${currentIndex + 1}`}
          className="w-full h-full object-cover object-center rounded-b-xl"
          loading="lazy"
        />
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-2 md:bottom-4 w-full px-4 flex justify-center gap-1.5 md:gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
