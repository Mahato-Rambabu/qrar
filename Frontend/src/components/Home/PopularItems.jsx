import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PopularItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const [popularItems, setPopularItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [containerWidth, setContainerWidth] = useState(600);
  const [cardWidth, setCardWidth] = useState(208);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const isVisibleRef = useRef(true);

  const cardMargin = 16;
  const step = cardWidth + cardMargin;
  const offset = (containerWidth - cardWidth) / 2;
  const translateX = -currentIndex * step + offset;

  // Fetch popular items
  useEffect(() => {
    if (!restaurantId) return;
    const fetchPopularItems = async () => {
      try {
        const response = await axiosInstance.get(`/orders/top-products/${restaurantId}`);
        setPopularItems(response.data);
        setCurrentIndex(1);
      } catch (err) {
        console.error("Error fetching popular items:", err);
      }
    };
    fetchPopularItems();
  }, [restaurantId]);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth < 600 ? window.innerWidth : 600;
      const cWidth = window.innerWidth < 600 ? 180 : 208;
      setContainerWidth(width);
      setCardWidth(cWidth);
    };
    
    updateDimensions();
    const resizeHandler = () => {
      if (isVisibleRef.current) updateDimensions();
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  // Slides setup
  const slides = popularItems.length > 0 
    ? [popularItems[popularItems.length - 1], ...popularItems, popularItems[0]]
    : [];

  // Improved carousel logic with visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current) {
        startInterval();
      } else {
        clearInterval(intervalRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startInterval();

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slides]);

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= slides.length - 1) {
          setTimeout(() => {
            sliderRef.current.style.transition = 'none';
            setCurrentIndex(1);
            setTimeout(() => {
              sliderRef.current.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
          }, 500);
        }
        return nextIndex >= slides.length ? 0 : nextIndex;
      });
    }, 3000);
  };

  // Transition handling
  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      sliderRef.current.style.transition = 'none';
      setCurrentIndex(slides.length - 2);
      setTimeout(() => {
        sliderRef.current.style.transition = 'transform 0.5s ease-in-out';
      }, 50);
    }
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

  const getRank = (index) => {
    if (index === 0) return popularItems.length;
    if (index === slides.length - 1) return 1;
    return index;
  };

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
          style={{ 
            transform: `translateX(${translateX}px)`,
            willChange: 'transform'
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((item, index) => {
            const rank = getRank(index);
            return (
              <div
                key={`${item.productId}-${index}`}
                className={`
                  flex-shrink-0 mx-2 cursor-pointer transition-transform duration-300
                  ${index === currentIndex ? 'scale-110' : 'scale-90'}
                  hover:scale-105
                `}
                style={{ 
                  width: cardWidth,
                  transition: 'transform 0.3s ease-in-out'
                }}
                onClick={() => handleProductClick(item)}
              >
                <div className="relative">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-64 object-cover rounded-2xl shadow-gray-500 shadow-lg"
                    loading="lazy"
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