import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PopularItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  // State for fetched popular items.
  const [popularItems, setPopularItems] = useState([]);
  // currentIndex is based on the slides array (with duplicates)
  const [currentIndex, setCurrentIndex] = useState(1);
  // Responsive dimensions: containerWidth and cardWidth.
  const [containerWidth, setContainerWidth] = useState(600);
  const [cardWidth, setCardWidth] = useState(208);
  const sliderRef = useRef(null);

  // Define the total horizontal margin per card (mx-2 gives 0.5rem on each side ~16px total).
  const cardMargin = 16;
  // Step size: card width plus the margin between cards.
  const step = cardWidth + cardMargin;
  // Calculate offset so the center slide is exactly centered.
  const offset = (containerWidth - cardWidth) / 2;
  // The translation accounts for the current index and step size.
  const translateX = -currentIndex * step + offset;

  // Fetch popular items from backend.
  useEffect(() => {
    if (!restaurantId) return;
    const fetchPopularItems = async () => {
      try {
        const response = await axiosInstance.get(`/orders/top-products/${restaurantId}`);
        setPopularItems(response.data);
        setCurrentIndex(1); // initial index: slide 0 is duplicate of last slide.
      } catch (err) {
        console.error("Error fetching popular items:", err);
      }
    };
    fetchPopularItems();
  }, [restaurantId]);

  // Update container and card dimensions based on viewport size.
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 600) {
        // On mobile, use full width and slightly smaller cards.
        setContainerWidth(window.innerWidth);
        setCardWidth(180);
      } else {
        setContainerWidth(600);
        setCardWidth(208);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Build slides with duplicate first and last items.
  const slides =
    popularItems.length > 0
      ? [popularItems[popularItems.length - 1], ...popularItems, popularItems[0]]
      : [];

  // Auto-advance carousel every 3 seconds.
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  // When transition ends, if we've reached the duplicate of the first slide, jump to the real first slide.
  const handleTransitionEnd = () => {
    if (currentIndex === slides.length - 1) {
      sliderRef.current.style.transition = 'none';
      setCurrentIndex(1);
      setTimeout(() => {
        sliderRef.current.style.transition = 'transform 0.5s ease-in-out';
      }, 50);
    }
  };

  const handleProductClick = (product) => {
    navigate(
      `/products?categoryId=${product.categoryId || 'all'}&highlightedProductId=${product.productId}&restaurantId=${restaurantId}`
    );
  };

  // Function to compute the rank number from the slide index.
  const getRank = (index) => {
    if (index === 0) return popularItems.length;
    if (index === slides.length - 1) return 1;
    return index;
  };

  // Function to render the crown based on rank.
  const renderCrown = (rank) => {
    if (rank === 1) {
      return (
        <>
          <span className="text-yellow-500 text-3xl inline-block">👑</span>
          <span className="ml-1 text-[18px] text-yellow-500 font-bold">#{rank}</span>
        </>
      );
    } else if (rank === 2) {
      return (
        <>
          <span className="text-gray-600 text-3xl inline-block">🥈</span>
          <span className="ml-1 text-[18px] text-gray-400 font-bold">#{rank}</span>
        </>
      );
    } else if (rank === 3) {
      return (
        <>
          <span className="text-orange-600 text-3xl inline-block">🥉</span>
          <span className="ml-1 text-[18px] text-orange-900 font-bold">#{rank}</span>
        </>
      );
    }
    return <span>#{rank}</span>;
  };


  return (
    <section className="popular-items bg-gray-100">
      <h1 className="text-xl font-bold text-center pt-4 text-black">
        Popular <span className="text-yellow-500 italic">Weekly</span>
      </h1>
      <div
        className="mx-auto overflow-hidden relative pt-9"
        style={{ width: containerWidth, height: 375 }}
      >
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(${translateX}px)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((item, index) => {
            const rank = getRank(index);
            return (
              <div
                key={index}
                className={`
                  flex-shrink-0 mx-2 cursor-pointer transition-transform duration-300
                  ${index === currentIndex ? 'scale-110' : 'scale-90'}
                `}
                style={{ width: cardWidth }}
                onClick={() => handleProductClick(item)}
              >
                <div className="relative">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-64 object-cover rounded-2xl border-4 shadow-lg"
                  />
                </div>
                <div className="mt-1 text-center text-sm font-bold">
                  {renderCrown(rank)}
                </div>
                <div className="mt-1 text-center text-sm font-bold text-black truncate overflow-hidden whitespace-nowrap">
                  {item.productName}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularItems;
