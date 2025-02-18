import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProductGrid from './ProductGrid';
import { fetchProducts } from '../../api/productApi';
import { fetchCategories } from '../../api/categoryApi';
import axiosInstance from '../../utils/axiosInstance';

// Fetch offers for a given restaurantId
const fetchOffers = async (restaurantId) => {
  try {
    const response = await axiosInstance.get(`/offer/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return { all: [], categories: {}, products: {} };
  }
};

// Determine which offer applies to a product based on priority: product > category > all
const getApplicableOffer = (product, offers) => {
  const { all, categories, products } = offers;
  if (products && products[product._id] && products[product._id].length > 0) {
    return products[product._id][0];
  } else if (
    categories &&
    product.category &&
    categories[product.category] &&
    categories[product.category].length > 0
  ) {
    return categories[product.category][0];
  } else if (all && all.length > 0) {
    return all[0];
  }
  return null;
};

// Apply applicable offer to each product
const applyOffersToProducts = (products, offers) => {
  return products.map((product) => {
    const offer = getApplicableOffer(product, offers);
    if (offer) {
      return {
        ...product,
        discountedPrice: Math.round(product.price * (1 - offer.discountPercentage / 100)),
        appliedOffer: offer,
      };
    }
    return product;
  });
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [offers, setOffers] = useState({ all: [], categories: {}, products: {} });
  const location = useLocation();
  const navigate = useNavigate();

  // Helper: Get query parameter value from URL
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(param);
  };

  const restaurantId = getQueryParam('restaurantId');
  const categoryFromUrl = getQueryParam('categoryId') || 'all';

  // Fetch categories when restaurantId is available
  useEffect(() => {
    const fetchCat = async () => {
      if (!restaurantId) return;
      try {
        const data = await fetchCategories(restaurantId);
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCat();
  }, [restaurantId]);

  // Update highlighted product when URL changes
  useEffect(() => {
    const productId = getQueryParam('highlightedProductId');
    setHighlightedProduct(productId);
  }, [location.search]);

  // Fetch products and offers when URL search params change
  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;
      setLoadingProducts(true);
      setError(null);
      try {
        // Fetch products by category (or all) using the URL query directly
        const productData = await fetchProducts(restaurantId, categoryFromUrl);
        // Fetch offers for the restaurant
        const offersData = await fetchOffers(restaurantId);
        setOffers(offersData);
        // Apply offers to products based on priority: product > category > all
        const discountedProducts = applyOffersToProducts(productData, offersData);
        setProducts(discountedProducts);
      } catch (err) {
        console.error('Error fetching products or offers:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, [location.search, restaurantId, categoryFromUrl]);

  // When a category is selected in the Sidebar, update the URL (which triggers data refresh)
  const handleCategorySelect = (categoryId) => {
    navigate(`/products?restaurantId=${restaurantId}&categoryId=${categoryId}`);
  };

  // Compute the display name for the Navbar based on the selected category
  const currentCategoryName =
    categoryFromUrl === 'all'
      ? 'All Categories'
      : categories.find((cat) => cat._id === categoryFromUrl)?.catName || 'All Categories';

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      <Navbar categoryName={currentCategoryName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          categories={categories}
          selectedCategory={categoryFromUrl}
          onSelectCategory={handleCategorySelect}
          restaurantId={restaurantId}
        />
        <div className="flex-1 overflow-auto p-4">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 animate-pulse">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          ) : (
            <ProductGrid products={products} highlightedProduct={highlightedProduct} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
