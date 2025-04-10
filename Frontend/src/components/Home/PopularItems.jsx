// --- No change to imports ---
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
  const touchStartX = useRef(null);

  const cardMargin = 16;
  const step = cardWidth + cardMargin;
  const offset = (containerWidth - cardWidth) / 2;
  const translateX = -currentIndex * step + offset;

  useEffect(() => {
    if (!restaurantId) return;

    const fetchPopularItems = async () => {
      try {
        const response = await axiosInstance.get(`/orders/top-products/${restaurantId}`);
        setPopularItems(response.data);
        setCurrentIndex(1);
      } catch (err) {
        console.error("Error fetching popular items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularItems();
  }, [restaurantId]);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth < 600 ? window.innerWidth : 3 * 208 + 2 * 16;
      const cWidth = window.innerWidth < 600 ? 180 : 208;

      setContainerWidth(width);
      setCardWidth(cWidth);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const slides =
    popularItems.length > 0
      ? [popularItems[popularItems.length - 1], ...popularItems, popularItems[0]]
      : [];

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

  const renderCrown = (rank) => {
    const iconMap = {
      1: { emoji: "👑", color: "text-yellow-500" },
      2: { emoji: "🥈", color: "text-gray-500" },
      3: { emoji: "🥉", color: "text-orange-600" },
    };
    const medal = iconMap[rank];
    if (!medal) return null;
    return (
      <div className="flex items-center justify-center space-x-1">
        <span className={`text-2xl ${medal.color}`}>{medal.emoji}</span>
        <span className={`text-[14px] font-bold ${medal.color}`}>#{rank}</span>
      </div>
    );
  };

  const renderProductInfo = (index) => {
    const visibleIndex = index - 1;
    if (visibleIndex >= 0 && visibleIndex < 3) {
      return (
        <div className="mt-1 text-center text-sm font-bold">
          {renderCrown(visibleIndex + 1)}
        </div>
      );
    }
    return null;
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    if (deltaX > 50) {
      setCurrentIndex(prev => (prev - 1 < 0 ? slides.length - 1 : prev - 1));
    } else if (deltaX < -50) {
      setCurrentIndex(prev => (prev + 1 >= slides.length ? 0 : prev + 1));
    }
  };

  if (loading) {
    return (
      <section className="popular-items bg-gray-100">
        <h1 className="text-xl font-bold text-center pt-4 text-black">
          Popular <span className="text-yellow-500 italic">Weekly</span>
        </h1>
        <div
          className="mx-auto overflow-hidden relative pt-9"
          style={{ width: containerWidth, height: 375 }}
        >
          <Skeleton height={375} width={containerWidth} style={{ borderRadius: '1rem' }} />
        </div>
      </section>
    );
  }

  return (
    <section className="popular-items bg-gray-100 w-full">
      <h1 className="text-xl font-bold text-center pt-4 text-black">
        Popular <span className="text-yellow-500 italic">Weekly</span>
      </h1>
      <div
        className="mx-auto overflow-hidden relative pt-6"
        style={{ width: containerWidth}}
      >
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(${translateX}px)` }}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {slides.map((item, index) => (
            <div
              key={`${item.productId}-${index}`}
              className={`
                flex-shrink-0 mx-2 cursor-pointer 
                transition-transform duration-300 
                ${index === currentIndex ? 'scale-105' : 'scale-95'}
              `}
              style={{ width: cardWidth }}
              onClick={() => handleProductClick(item)}
            >
              <div className="relative">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full object-cover object-center rounded-xl shadow-md"
                  loading="lazy"
                />
              </div>
              {/* Fix: Show rank/medal based on index not item.rank */}
              {index > 0 && index < slides.length - 1 && renderProductInfo(index)}
              <div className="mt-1 text-center text-sm font-medium text-gray-800 truncate">
                {item.productName}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularItems;