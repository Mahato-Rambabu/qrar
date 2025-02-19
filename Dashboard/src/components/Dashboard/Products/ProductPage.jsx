import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from '../../../utils/axiosInstance';
import Pagination from "./Pagination";
import ProductCard from "./ProductCard";
import ProductTable from "./ProductTable";
import { Grid, Plus, Table, Trash } from "lucide-react";
import useDebouncedValue from "../../../Hooks/useDebounce";
import AddProductPage from "./AddProduct";
import Modal from "react-modal";

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

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get("categoryId") || "";
    const currentPage = parseInt(queryParams.get("page"), 10) || 1;

    setCategoryFilter(categoryId);
    setPage(currentPage);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductError(null);

      try {

        const response = await axiosInstance.get("/products", {
          params: {
            search: debouncedSearchQuery,
            categoryId: categoryFilter,
            page,
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
    if (categoryFilter) {

      fetchProducts();
    } else {
      fetchProducts();
    }
  }, [debouncedSearchQuery, categoryFilter, page]);

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

  const handleCategoryChange = (categoryId) => {
    setPage(1);
    navigate(`?categoryId=${categoryId}&page=1`);
  };

  const handleAddProductModal = () => setIsModalOpen(true); // Open Modal

  const closeModal = () => setIsModalOpen(false); // Close Modal

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleEditProduct = (productId) => navigate(`/products/edit/${productId}`);

  const handleProductAdded = (newProduct) => {
    // Update the product list when a new product is added
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    closeModal();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
          onClick={handleAddProductModal} // Open modal on click
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>


      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Product Modal"
        className="relative bg-white rounded-lg shadow-lg p-6 max-w-full w-11/12 md:w-3/4 lg:w-1/2 mx-auto max-h-[80vh] mt-20 overflow-y-auto z-10"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={closeModal}
        >
          ✖
        </button>
        <AddProductPage onSuccess={handleProductAdded} />
      </Modal>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 p-2 border border-gray-300 rounded-lg"
        />
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.catName}
            </option>
          ))}
        </select>

        <button
          onClick={() => setView(view === "grid" ? "table" : "grid")}
          className="bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-300"
        >
          {view === "grid" ? <Table className="font-extralight" /> : <Grid className="font-extralight" />}
          {view === "grid" ? "Table View" : "Grid View"}
        </button>
        {/* Delete Selected Button */}

        <button
<<<<<<< Updated upstream
          className={`px-4 flex  py-2 rounded-lg shadow items-center gap-2 justify-end  ${selectedItems.length === 0
            ? "bg-gray-300 cursor-not-allowed "
            : "bg-red-600 hover:bg-red-700 text-white"
=======
          className={`px-4 flex  py-2 rounded shadow items-center gap-2 justify-end  ${selectedItems.length === 0
              ? "bg-gray-300 cursor-not-allowed "
              : "bg-red-600 hover:bg-red-700 text-white"
>>>>>>> Stashed changes
            }`}
          onClick={handleDeleteSelected}
          disabled={selectedItems.length === 0}
        >
          Delete
          <Trash
            size={16}
          />
        </button>


      </div>

      {/* Undo Alert */}
      {undoProduct && (
        <div className="bg-yellow-100 p-4 mb-4 flex justify-between items-center rounded-md">
          <span>Product deleted. </span>
          <button
            onClick={handleUndo}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Undo
          </button>
        </div>
      )}

      {/* Product Display */}
      {loadingProducts ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} category={categories} onEdit={handleEditProduct} />
            ))}
          </div>

        ) : (
          <ProductTable
            products={products}
            category={categories}
            onEdit={handleEditProduct}
            selectedItems={selectedItems}
            handleSelectItem={handleSelectItem}
            setSelectedItems={setSelectedItems}
          />
        )
      ) : (
        <p className="text-gray-500">No products available.</p>
      )}


      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          setPage(newPage);
          navigate(`?categoryId=${categoryFilter}&page=${newPage}`);
        }}
      />

      {/* Error Handling */}
      {productError && <p className="text-red-500 mt-4">{productError}</p>}
      {categoryError && <p className="text-red-500 mt-4">{categoryError}</p>}
    </div>
  );
};

export default ProductPage;
