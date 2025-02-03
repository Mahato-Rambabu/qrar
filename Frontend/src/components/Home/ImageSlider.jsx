import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RiArrowLeftWideFill, RiArrowRightWideFill } from 'react-icons/ri';
import { fetchSliderImages } from '../../api/fetchSliderImages';

const useQuery = () => new URLSearchParams(useLocation().search);

const ImageSlider = () => {
  const query = useQuery();
  const restaurantId = query.get('restaurantId');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fade, setFade] = useState(true);

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
          image.img ? `${image.img}?w=auto:500:1000&c=scale&dpr=auto&f=auto` : '/placeholder.png'
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
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setFade(true);
    }, 50);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setFade(true);
    }, 50);
  };

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [images]);

  if (loading) return <div className="min-h-[56.25vw] bg-gray-100" />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (images.length === 0) return <div className="p-4 text-gray-500">No images available</div>;

  return (
    <div className="relative w-full overflow-hidden rounded-b-3xl"
      style={{
        aspectRatio: '16/9', // Native aspect ratio control
        maxHeight: '70vh' // Desktop height limit
      }}>
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
          className="w-full h-full object-cover object-center rounded-b-3xl"
          style={{ 
            transition: 'opacity 0.5s ease',
            opacity: fade ? 1 : 0
          }}
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