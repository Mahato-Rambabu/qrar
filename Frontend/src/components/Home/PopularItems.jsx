import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PopularItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');

  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [containerWidth, setContainerWidth] = useState(600);
  const [cardWidth, setCardWidth] = useState(208);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const isVisibleRef = useRef(true);
  const touchStartX = useRef(null); // For swipe functionality
  const [error, setError] = useState(null);

  // Cache popular items per restaurantId
  const popularItemsCacheRef = useRef({});

  const cardMargin = 16;
  const step = cardWidth + cardMargin;
  const offset = (containerWidth - cardWidth) / 2;
  const translateX = -currentIndex * step + offset;

  // Fetch popular items with caching
  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    // Check if we already have cached data for this restaurantId
    if (popularItemsCacheRef.current[restaurantId]) {
      setPopularItems(popularItemsCacheRef.current[restaurantId]);
      setCurrentIndex(1);
      setLoading(false);
      return;
    }

    const fetchPopularItems = async () => {
      try {
        console.log('Fetching popular items for restaurant:', restaurantId);
        const response = await axiosInstance.get(`/orders/top-products/${restaurantId}`);
        console.log('Popular items response:', response.data);
        
        // Cache the fetched popular items
        popularItemsCacheRef.current[restaurantId] = response.data;
        setPopularItems(response.data);
        setCurrentIndex(1);
      } catch (err) {
        console.error("Error fetching popular items:", err);
        console.error("Error details:", err.response?.data);
        setError("Failed to fetch popular items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPopularItems();
  }, [restaurantId]);

  // Responsive dimensions
 useEffect(() => {
  const updateDimensions = () => {
    let width = window.innerWidth < 600 ? window.innerWidth : 3 * 208 + 2 * 16; // 3 cards + margins
    let cWidth = window.innerWidth < 600 ? 180 : 208;
    
    setContainerWidth(width);
    setCardWidth(cWidth);
  };

  updateDimensions();
  window.addEventListener("resize", updateDimensions);
  return () => window.removeEventListener("resize", updateDimensions);
}, []);


  // Setup slides with clones for infinite scrolling
  const slides =
    popularItems.length > 0
      ? [popularItems[popularItems.length - 1], ...popularItems, popularItems[0]]
      : [];

  // Auto slide with visibility handling
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
            if (sliderRef.current) {
              sliderRef.current.style.transition = 'none';
              setCurrentIndex(1);
              setTimeout(() => {
                if (sliderRef.current) {
                  sliderRef.current.style.transition = 'transform 0.5s ease-in-out';
                }
              }, 50);
            }
          }, 500);
        }
        return nextIndex >= slides.length ? 0 : nextIndex;
      });
    }, 5000);
  };

  // Transition handling for infinite looping
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

  const renderProductInfo = (item, rank) => {
    return (
      <div className="mt-1 text-center text-sm font-bold">
        {renderCrown(rank)}
        {item.isRandom && (
          <span className="ml-1 text-gray-500 text-xs">(Random Selection)</span>
        )}
      </div>
    );
  };

  // Touch event handlers for swipe functionality
  const swipeThreshold = 50; // Minimum swipe distance in pixels

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    if (deltaX > swipeThreshold) {
      // Swipe right: go to previous slide
      setCurrentIndex(prev => {
        const newIndex = prev - 1;
        return newIndex < 0 ? slides.length - 1 : newIndex;
      });
    } else if (deltaX < -swipeThreshold) {
      // Swipe left: go to next slide
      setCurrentIndex(prev => {
        const newIndex = prev + 1;
        return newIndex >= slides.length ? 0 : newIndex;
      });
    }
  };

  if (loading) {
    // Render a skeleton slider with similar dimensions
    return (
      <section className="popular-items bg-gray-100">
        <h1 className="text-xl font-bold text-center pt-4 text-black">
          Popular <span className="text-yellow-500 italic">Weekly</span>
        </h1>
        <div
          className="mx-auto overflow-hidden relative pt-9"
          style={{ width: containerWidth, height: 375 }}
        >
          <Skeleton
            height={375}
            width={containerWidth}
            containerClassName="mx-auto"
            style={{ borderRadius: '1rem' }}
          />
        </div>
      </section>
    );
  }

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
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {slides.map((item, index) => {
            return (
              <div
                key={`${item.productId}-${index}`}
                className={`
                  flex-shrink-0 mx-2 cursor-pointer transition-transform duration-300
                  ${index === currentIndex ? 'scale-110' : 'scale-90'}
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
                    className="w-full h-64 object-cover rounded-2xl shadow-gray-500 shadow-sm"
                    loading="lazy"
                  />
                </div>
                {renderProductInfo(item, getRank(index))}
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
