import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RiArrowLeftWideFill, RiArrowRightWideFill } from 'react-icons/ri';
import { fetchSliderImages } from '../../api/fetchSliderImages';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Helper function to extract query parameters
const useQuery = () => new URLSearchParams(useLocation().search);

const ImageSlider = () => {
  const query = useQuery();
  const restaurantId = query.get('restaurantId');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const touchStartX = useRef(null);
  const swipeThreshold = 50;

  // Cache slider images for each restaurant using a ref
  const sliderCacheRef = useRef({});

  useEffect(() => {
    if (!restaurantId) {
      setError('Restaurant ID is missing in the URL.');
      setLoading(false);
      return;
    }

    const loadImages = async () => {
      if (sliderCacheRef.current[restaurantId]) {
        setImages(sliderCacheRef.current[restaurantId]);
        setLoading(false);
        return;
      }

      try {
        const fetchedImages = await fetchSliderImages(restaurantId);
        const formattedImages = fetchedImages
          .filter(image => image.img)
          .map(image => image.img);

        sliderCacheRef.current[restaurantId] = formattedImages;
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
    setCurrentIndex((prevIndex) =>
      (prevIndex - 1 + images.length) % images.length
    );
  };

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        handleNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images]);

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
    return (
      <div
        className="relative w-full overflow-hidden rounded-b-[8%] bg-gray-200"
        style={{
          aspectRatio: '16/9',
          maxHeight: '45vh',
        }}
      >
        <Skeleton
          height="100%"
          width="100%"
          style={{ borderRadius: "0 0 8% 8%" }}
        />
      </div>
    );
  }

  if (error || images.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Show arrows only if more than 1 image */}
      {images.length > 1 && (
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
      )}

      {/* Image */}
      <img
        src={images[currentIndex]}
        alt={`Slider ${currentIndex + 1}`}
        className="w-full object-contain object-center"
        loading="lazy"
      />

      {/* Show indicator dots only if more than 1 image */}
      {images.length > 1 && (
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
      )}
    </div>
  );
};

export default ImageSlider;