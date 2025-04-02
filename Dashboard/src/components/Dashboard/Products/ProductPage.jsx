import React, { useState, useEffect, lazy } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isInitialDataLoaded) return;

      setLoadingProducts(true);
      setProductError(null);

      try {
        const queryParams = new URLSearchParams(location.search);
        const categoryId = queryParams.get("categoryId") || "";
        const currentPage = parseInt(queryParams.get("page"), 10) || 1;
    
        setCategoryFilter(categoryId);
        setPage(currentPage);

        const response = await axiosInstance.get("/products", {
          params: {
            search: debouncedSearchQuery,
            categoryId: categoryId,
            page: currentPage,
          },
        });

        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [debouncedSearchQuery, location.search, isInitialDataLoaded]);

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

  const handleSelectItem = (id) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteSelected = () => {
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
  };

  const handleUndo = () => {
    if (undoProduct) {
      setProducts((prevProducts) => [undoProduct, ...prevProducts]);
      clearTimeout(undoTimeout);
      setUndoProduct(null);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setPage(1);
    setSearchQuery(""); // Clear search when changing category
    
    // Update URL parameters
    const searchParams = new URLSearchParams();
    if (categoryId) {
      searchParams.set('categoryId', categoryId);
      searchParams.set('page', '1');
    }
    navigate(`/products?${searchParams.toString()}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
    
    // Update URL parameters
    const searchParams = new URLSearchParams();
    if (value) {
      searchParams.set('search', value);
      searchParams.set('page', '1');
    }
    if (categoryFilter) {
      searchParams.set('categoryId', categoryFilter);
    }
    navigate(`/products?${searchParams.toString()}`);
  };

  const handleAddProductModal = () => setIsModalOpen(true); // Open Modal

  const closeModal = () => setIsModalOpen(false); // Close Modal

  const handleEditProduct = (productId) => navigate(`/products/edit/${productId}`);

  const handleProductAdded = (newProduct) => {
    // Update the product list when a new product is added
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <div className="  mb-6">
          <ProductToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            categoryFilter={categoryFilter}
            onCategoryChange={handleCategoryChange}
            categories={categories}
            view={view}
            onViewChange={setView}
            onAddProduct={handleAddProductModal}
            loadingProducts={loadingProducts}
          />
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
        {loadingProducts || !isInitialDataLoaded ? (
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
            onPageChange={(newPage) => {
              setPage(newPage);
              const searchParams = new URLSearchParams();
              if (categoryFilter) {
                searchParams.set('categoryId', categoryFilter);
              }
              if (searchQuery) {
                searchParams.set('search', searchQuery);
              }
              searchParams.set('page', newPage.toString());
              navigate(`/products?${searchParams.toString()}`);
            }}
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
        className="relative bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-full w-11/12 md:w-3/4 lg:w-1/2 mx-auto max-h-[90vh] mt-10 sm:mt-20 overflow-y-auto z-10"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
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
