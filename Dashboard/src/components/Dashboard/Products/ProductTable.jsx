import React, { useState, useEffect } from "react";
import { Pen, Trash2 } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const ProductTable = ({
  products = [],
  category = [],
  onEdit,
  selectedItems,
  setSelectedItems,
  onDelete,
}) => {
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSortedProducts(products);
  }, [products]);

  const handleSelectAll = (e) => {
    setSelectedItems(e.target.checked ? sortedProducts.map((p) => p._id) : []);
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    const sortedArray = [...sortedProducts].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedProducts(sortedArray);
    setSortConfig({ key, direction });
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one product to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} product(s)?`)) {
      setIsDeleting(true);
      try {
        // Delete each selected product
        const deletePromises = selectedItems.map(id => 
          axiosInstance.delete(`/products/${id}`)
        );
        
        await Promise.all(deletePromises);
        
        toast.success(`${selectedItems.length} product(s) deleted successfully`);
        
        // Clear selection and notify parent
        setSelectedItems([]);
        if (onDelete) {
          onDelete(selectedItems);
        }
      } catch (error) {
        console.error("Error deleting products:", error);
        toast.error("Failed to delete some products. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <button
          onClick={handleDeleteSelected}
          disabled={selectedItems.length === 0 || isDeleting}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            selectedItems.length > 0 && !isDeleting
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Trash2 size={16} />
          {isDeleting ? "Deleting..." : `Delete`}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left rounded-tl-lg">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedItems.length === sortedProducts.length &&
                    sortedProducts.length > 0
                  }
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
              </th>
              <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                Sr. No.
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Photo
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Category
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price{" "}
                {sortConfig.key === "price" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Items Sold
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedProducts.map((product, index) => {
              let matchedCategory = null;
              
              if (product.category && typeof product.category === 'object' && product.category.catName) {
                matchedCategory = product.category;
              } else {
                const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
                matchedCategory = category?.find(
                  (cat) => cat._id === categoryId || cat._id.toString() === categoryId?.toString()
                );
              }

              return (
                <tr
                  key={product._id}
                  className={`hover:bg-gray-100 cursor-pointer ${
                    selectedItems.includes(product._id) ? "bg-gray-200" : ""
                  }`}
                  onClick={(e) => {
                    if (e.target.type !== "checkbox" && e.target.tagName !== "BUTTON") {
                      handleSelectItem(product._id);
                    }
                  }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => handleSelectItem(product._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3">
                    <img
                      src={product.img || "https://via.placeholder.com/100"}
                      alt={product.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {matchedCategory ? matchedCategory.catName : "Loading..."}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.itemsSold || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product._id);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pen size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {sortedProducts.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
