import React, { useEffect, useState, useCallback, lazy, Suspense } from "react";
import axiosInstance from '../../../utils/axiosInstance';
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import AddCategory from "./AddCategory";
import { toast } from 'react-hot-toast';


const CategoryCard = lazy(() => import("./CategoryCard"));

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {

        const response = await axiosInstance.get("/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleEditCategory = useCallback((categoryId) => {
    navigate(`/categories/edit/${categoryId}`);
  }, [navigate]);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this category and all its associated products? This action cannot be undone."
      );
      if (!confirmDelete) return;

  

      const response = await axiosInstance.delete(`/categories/${categoryId}`);

      if (response.status === 200) {
        toast.success("Category and its associated products deleted successfully!");
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category._id !== categoryId)
        );
      }
    } catch (error) {
      console.error("Error deleting category and its products:", error);
      toast.error(
        error.response?.data?.error || "Failed to delete category and its products. Please try again."
      );
    }
  }, []);

  const handleViewProducts = useCallback(
    (categoryId) => {


      const url = categoryId === "all" ? "/products" : `/products?categoryId=${categoryId}&page=1`;
      navigate(url);
    },
    [navigate]
  );

  const handleAddCategorySuccess = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
    setShowAddCategoryModal(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <nav className="text-sm text-gray-500 mb-4">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/")}>
          Dashboard
        </span>
        <span className="mx-2">/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/categories")}>
          Categories
        </span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setShowAddCategoryModal(true)}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg shadow flex flex-col hover:shadow-lg transition hover:cursor-pointer bg-white"
        onClick={() => handleViewProducts("all")}
        >
          {/* Category Image */}
          <div className="w-full h-48 bg-gray-100 overflow-hidden rounded-t-lg">
            <img
              src="https://via.placeholder.com/150"
              alt="All Products"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card Content */}
          <div className="flex flex-col p-4 justify-between flex-grow">
            {/* Category Name */}
            <h2 className="text-xl font-semibold text-gray-800">{`All Products`}</h2>
          </div>
        </div>

        {loadingCategories ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          <Suspense fallback={<p>Loading...</p>}>
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onViewProducts={handleViewProducts}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </Suspense>
        )}
      </div>


      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowAddCategoryModal(false)}
            >
              ✕
            </button>
            <AddCategory onSuccess={handleAddCategorySuccess} />
          </div>
        </div>
      )}
      {/* <SliderImageManager /> */}
    </div>
  );
};

export default CategoryPage;
