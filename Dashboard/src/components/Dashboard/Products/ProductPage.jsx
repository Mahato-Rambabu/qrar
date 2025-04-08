import React, { useState, useEffect, lazy, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from '../../../utils/axiosInstance';
import Pagination from "./Pagination";
import { Plus } from "lucide-react";
import useDebouncedValue from "../../../Hooks/useDebounce";
import Modal from "react-modal";
import ProductToolbar from "./ProductToolbar";

const ProductCardSkeleton = lazy(() => import("./ProductCardSkeleton"));
const AddProductPage = lazy(() => import("./AddProduct"));
const ProductTable = lazy(() => import("./ProductTable"))
const ProductCard = lazy(() => import("./ProductCard"))

const ProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("grid");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productError, setProductError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [undoProduct, setUndoProduct] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 100);

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchProducts = useCallback(async (params) => {
    setLoadingProducts(true);
    setProductError(null);

    try {
      const response = await axiosInstance.get("/products", { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch products whenever URL parameters change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get("categoryId") || "";
    const currentPage = parseInt(queryParams.get("page"), 10) || 1;
    const currentSearch = queryParams.get("search") || "";
    
    // Update state based on URL parameters
    setCategoryFilter(categoryId);
    setPage(currentPage);
    setSearchQuery(currentSearch);

    // Fetch products with the current parameters
    fetchProducts({
      search: currentSearch,
      categoryId: categoryId,
      page: currentPage,
    });
  }, [location.search, fetchProducts]);

  // Fetch categories once when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);

      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError("Failed to load categories. Please try again later.");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
        setIsInitialDataLoaded(true);
      }
    };

    fetchCategories();
  }, []);

  // Memoize handlers to prevent unnecessary recreations
  const handleSelectItem = useCallback((id) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const updatedProducts = products.filter(
      (product) => !selectedItems.includes(product._id)
    );
    const lastDeleted = products.find((p) => selectedItems.includes(p._id));

    setProducts(updatedProducts);
    setUndoProduct(lastDeleted);
    setSelectedItems([]);

    clearTimeout(undoTimeout);
    const timeout = setTimeout(() => {
      setUndoProduct(null);
    }, 5000);

    setUndoTimeout(timeout);
  }, [products, selectedItems, undoTimeout]);

  const handleUndo = useCallback(() => {
    if (undoProduct) {
      setProducts((prevProducts) => [undoProduct, ...prevProducts]);
      clearTimeout(undoTimeout);
      setUndoProduct(null);
    }
  }, [undoProduct, undoTimeout]);

  // Improved category change handler with direct URL update
  const handleCategoryChange = useCallback((e) => {
    const categoryId = e.target.value;
    
    // Create new URL parameters
    const searchParams = new URLSearchParams();
    
    // Always set page to 1 when changing category
    searchParams.set('page', '1');
    
    // Set category if it exists
    if (categoryId) {
      searchParams.set('categoryId', categoryId);
    }
    
    // Preserve search query if it exists
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    }
    
    // Update URL in a single operation
    navigate(`/products?${searchParams.toString()}`);
    
    // Update local state directly
    setCategoryFilter(categoryId);
    setPage(1);
  }, [navigate, searchQuery]);

  // Modified search handler to work independently from category
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    
    // Create new URL parameters
    const searchParams = new URLSearchParams();
    
    // Always set page to 1 when searching
    searchParams.set('page', '1');
    
    // Set search if it exists
    if (value) {
      searchParams.set('search', value);
    }
    
    // Preserve category if it exists
    if (categoryFilter) {
      searchParams.set('categoryId', categoryFilter);
    }
    
    // Update URL in a single operation
    navigate(`/products?${searchParams.toString()}`);
    
    // Update local state directly
    setSearchQuery(value);
    setPage(1);
  }, [navigate, categoryFilter]);

  const handleAddProductModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const handleEditProduct = useCallback((productId) => navigate(`/products/edit/${productId}`), [navigate]);

  const handleProductAdded = useCallback((newProduct) => {
    // Update the product list when a new product is added
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    closeModal();
  }, [closeModal]);

  // Memoize the pagination handler
  const handlePageChange = useCallback((newPage) => {
    // Create new URL parameters
    const searchParams = new URLSearchParams();
    
    // Set page
    searchParams.set('page', newPage.toString());
    
    // Preserve category if it exists
    if (categoryFilter) {
      searchParams.set('categoryId', categoryFilter);
    }
    
    // Preserve search if it exists
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    }
    
    // Update URL in a single operation
    navigate(`/products?${searchParams.toString()}`);
    
    // Update local state directly
    setPage(newPage);
  }, [navigate, categoryFilter, searchQuery]);

  // Memoize the toolbar props to prevent unnecessary re-renders
  const toolbarProps = useMemo(() => ({
    searchQuery,
    onSearchChange: handleSearchChange,
    categoryFilter,
    onCategoryChange: handleCategoryChange,
    categories,
    view,
    onViewChange: setView,
    onAddProduct: handleAddProductModal,
    loadingProducts
  }), [
    searchQuery, 
    handleSearchChange, 
    categoryFilter, 
    handleCategoryChange, 
    categories, 
    view, 
    handleAddProductModal, 
    loadingProducts
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="p-6">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <nav className="text-sm text-gray-500">
            <span className="cursor-pointer hover:underline" onClick={() => navigate("/")}>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="cursor-pointer hover:underline" onClick={() => navigate("/categories")}>Categories</span>
            <span className="mx-2">/</span>
            <span className="cursor-pointer hover:underline">Products</span>
          </nav>
        </div>

        {/* Toolbar with Icons and Categories */}
        <div className="mb-6">
          <ProductToolbar {...toolbarProps} />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        </div>

        {/* Undo Alert */}
        {undoProduct && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-yellow-800">Product deleted.</span>
            <button
              onClick={handleUndo}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
            >
              Undo
            </button>
          </div>
        )}

        {/* Product Display */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  category={categories} 
                  onEdit={handleEditProduct} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ProductTable
                products={products}
                category={categories}
                onEdit={handleEditProduct}
                selectedItems={selectedItems}
                handleSelectItem={handleSelectItem}
                setSelectedItems={setSelectedItems}
              />
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">No products available.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Error Messages */}
        {(productError || categoryError) && (
          <div className="mt-4 space-y-2">
            {productError && (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{productError}</p>
            )}
            {categoryError && (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{categoryError}</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Product Modal"
        className="fixed top-0 left-0 right-0 bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-full w-11/12 md:w-3/4 lg:w-1/2 mx-auto max-h-[90vh] mt-10 sm:mt-20 overflow-y-auto z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 z-[9998]"
        style={{
          content: {
            position: 'fixed',
            top: '20px',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translateX(-50%)',
            margin: '0 auto',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20px',
            zIndex: 9998
          }
        }}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2"
          onClick={closeModal}
          aria-label="Close modal"
        >
          ✖
        </button>
        <AddProductPage onSuccess={handleProductAdded} />
      </Modal>
    </div>
  );
};

export default ProductPage;
