import React, { useState, useEffect } from "react";
import { Pen } from "lucide-react";

const ProductTable = ({
  products = [],
  category = [],
  onEdit,
  selectedItems,
  setSelectedItems,
}) => {
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

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

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
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
            const matchedCategory = category?.find(
              (cat) => cat._id === product.category
            );

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
                  {matchedCategory ? matchedCategory.catName : "Unknown"}
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
  );
};

export default ProductTable;
