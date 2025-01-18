import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProductGrid from './ProductGrid';
import { fetchProducts } from '../../api/productApi';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(param);
  };

  useEffect(() => {
    const restaurantId = getQueryParam('restaurantId');
    const categoryId = getQueryParam('categoryId') || 'all';
    const productId = getQueryParam('highlightedProductId'); // Updated query param
    setSelectedCategory(categoryId);
    setHighlightedProduct(productId); // Save highlighted product ID
  }, [location.search]);

  useEffect(() => {
    if (selectedCategory === null) return;

    const fetchProductList = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        const restaurantId = getQueryParam('restaurantId');
        const data = await fetchProducts(restaurantId, selectedCategory);
        const reorderedProducts = reorderProducts(data, highlightedProduct);
        setProducts(reorderedProducts);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductList();
  }, [selectedCategory, highlightedProduct]);

  const reorderProducts = (productList, highlightId) => {
    if (!highlightId) return productList;

    const highlightedIndex = productList.findIndex((product) => product._id === highlightId);
    if (highlightedIndex === -1) return productList;

    const [highlighted] = productList.splice(highlightedIndex, 1);
    return [highlighted, ...productList];
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    navigate(`?categoryId=${categoryId}&restaurantId=${getQueryParam('restaurantId')}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        categoryName={
          categories.find((cat) => cat._id === selectedCategory)?.catName || 'All Categories'
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          restaurantId={getQueryParam('restaurantId')}
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
            <ProductGrid
              products={products}
              highlightedProduct={highlightedProduct}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
