import React, { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const ProductCard = ({ product, category, onEdit, onDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("Loading...");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Debug logs
    if (!category || category.length === 0) {
      setCategoryName("Loading...");
      return;
    }

    // If product.category is already an object with catName, use it directly
    if (product.category && typeof product.category === 'object' && product.category.catName) {
      setCategoryName(product.category.catName);
      return;
    }

    // Otherwise, find the matching category from the categories array
    const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
    
    const matchedCategory = category.find((cat) => {
      return cat._id.toString() === categoryId?.toString();
    });

    console.log("Category ID being searched:", categoryId);
    console.log("Matched category:", matchedCategory);

    if (matchedCategory?.catName) {
      setCategoryName(matchedCategory.catName);
    } else {
      setCategoryName("Unknown Category");
    }
  }, [product.category, category]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuVisible(!menuVisible);
  };

  const handleMouseLeave = () => {
    setMenuVisible(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setIsDeleting(true);
      try {
        await axiosInstance.delete(`/products/${product._id}`);
        toast.success("Product deleted successfully");
        if (onDelete) {
          onDelete(product._id);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product. Please try again.");
      } finally {
        setIsDeleting(false);
        setMenuVisible(false);
      }
    }
  };

  return (
    <div
      className="relative border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col cursor-pointer overflow-visible group h-fit"
      onClick={() => onViewDetails(product._id)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-t-xl overflow-hidden">
        <img
          src={product.img || "https://via.placeholder.com/150"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {categoryName}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col p-4 ">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-2">
          {/* Product Name */}
          <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1">
            {product.name}
          </h2>

          {/* Three Dot Menu */}
          <div className="relative shrink-0">
            <button
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleMenuToggle}
              aria-label="More options"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>
            {menuVisible && (
              <div
                className="absolute right-0 top-8 w-40 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product._id);
                  }}
                >
                  Edit Product
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-1">
          <FaRupeeSign size={16} className="text-gray-600" />
          <span className="text-lg font-semibold text-gray-900">
            {product.price}
          </span>
        </div>

        {/* Description Section */}
        <div>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mt-2">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
