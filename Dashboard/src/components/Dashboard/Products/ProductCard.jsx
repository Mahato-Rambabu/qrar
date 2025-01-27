import React, { useState } from "react";
import { Edit3, Trash2, MoreVertical } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const ProductCard = ({ product, category }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  // Find the matching category name
  const matchedCategory = category.find((cat) => cat._id === product.category);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuVisible(!menuVisible);
  };

  const handleMouseLeave = () => {
    setMenuVisible(false);
  };

  return (
    <div
      className="relative border rounded-lg shadow-md hover:shadow-lg transition  bg-white flex flex-col cursor-pointer overflow-visible"
      onClick={() => onViewDetails(product._id)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product Image */}
      <div className="w-full h-48 rounded-t-lg overflow-hidden">
        <img
          src={product.img || "https://via.placeholder.com/150"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="flex flex-col p-4 gap-2">
        <div className="flex justify-between items-center relative">
          {/* Product Name */}
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {product.name}
          </h2>

          {/* Three Dot Menu */}
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-300 transition"
              onClick={handleMenuToggle}
            >
              <MoreVertical size={20} />
            </button>
            {menuVisible && (
              <div
                className="absolute right-0 top-6 w-32 bg-white border shadow-md rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="block w-full text-left px-2 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product._id);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product._id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <p className="text-sm text-gray-500">
          
          <span className="font-semibold text-gray-700 flex items-center">
            <FaRupeeSign size={12} />
            {product.price}
          </span>
        </p>

        {/* Category Name */}
        <p className="text-sm text-gray-500 line-clamp-3">
          {" "}
          <span className="font-semibold text-gray-700">
            {matchedCategory ? matchedCategory.catName : "Unknown Category"}
          </span><br></br>
         {product.description}
        </p>

      </div>
    </div>
  );
};

export default ProductCard;
