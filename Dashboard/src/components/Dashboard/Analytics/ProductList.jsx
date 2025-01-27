import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const ProductList = ({ dateRange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductSales = async () => {
      try {
        const response = await axiosInstance.get(`/orders/product-sales?dateRange=${dateRange}`);
        setProducts(response.data.slice(0, 10)); // Only show top 10 products
      } catch (error) {
        console.error('Error fetching product sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductSales();
  }, [dateRange]);

  const getBadgeStyle = (index) => {
    if (index === 0) return 'bg-yellow-100 text-yellow-600';
    if (index === 1) return 'bg-gray-100 text-gray-600';
    if (index === 2) return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border-2">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Best Selling Products</h3>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <table className="w-full text-sm text-left table-auto">
          <thead className="border-b">
            <tr className="text-gray-600 border-y">
              <th className="py-3 px-4 text-xs font-bold uppercase">Rank</th>
              <th className="py-3 px-4 text-xs font-bold uppercase">Product</th>
              <th className="py-3 px-4 text-xs font-bold uppercase">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className={`border-t hover:bg-gray-100 rounded-lg ${index < 3 ? getBadgeStyle(index) : ''}`}
              >
                <td className="py-3 px-4  font-medium">{index + 1}</td>
                <td className="py-3 px-4 ">{product.productName}</td>
                <td className="py-3 px-4 ">{product.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;
