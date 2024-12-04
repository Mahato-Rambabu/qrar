import React, { useState, useEffect } from 'react';
import { RiArrowLeftWideFill, RiArrowRightWideFill } from 'react-icons/ri';

const images = [
  'FoodImages/food1.jpg', 
  'FoodImages/food2.jpg',
  'FoodImages/food3.jpg',
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(interval); // Clean up on component unmount
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-b-3xl">
      <div className="absolute inset-0 flex items-center justify-between z-10">
        <button
          onClick={handlePrev}
          className="text-gray-100 text-4xl px-4 focus:outline-none"
        >
          <RiArrowLeftWideFill />
        </button>
        <button
          onClick={handleNext}
          className="text-gray-100 text-4xl px-4 focus:outline-none"
        >
          <RiArrowRightWideFill />
        </button>
      </div>
      <div className="w-full h-full">
        <img
          src={images[currentIndex]}
          alt="Slider"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-4 w-full p-4 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <span
            key={index}
            className={`block h-1 cursor-pointer rounded-2xl transition-all duration-300 ${
              currentIndex === index ? "w-8 bg-white" : "w-4 bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
