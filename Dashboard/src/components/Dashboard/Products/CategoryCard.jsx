import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const CategoryCard = ({ category, onEdit, onDelete, onViewProducts }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuVisible(!menuVisible);
  };

  const handleMouseLeave = () => {
    setMenuVisible(false);
  };

  return (
    <div
      className="relative border rounded-lg shadow-md hover:shadow-lg transition z-10 bg-white flex flex-col cursor-pointer overflow-visible"
      onClick={() => onViewProducts(category._id)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Category Image */}
      {category.img && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={category.img}
            alt={category.catName}
            className="w-full h-full rounded-t-lg object-cover"
          />
        </div>
      )}

      {/* Card Content */}
      <div className="flex flex-col p-4 gap-3">
        <div className="flex justify-between items-center relative">
          {/* Category Name */}
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {category.catName}
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
                className="absolute right-0 top-6 w-32 bg-white border shadow-md rounded-md "
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="block w-full text-left px-2 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(category._id);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(category._id);
                  }}
                >
                  Delete
                </button>
                {/* Add more options here as needed */}
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <p className="text-sm text-gray-500">
          Starting at{" "}
          <span className="font-semibold text-gray-700 flex items-center">
            <FaRupeeSign size={12} />
            {category.price}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
