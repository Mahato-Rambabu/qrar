import React, { memo } from 'react';
import { useCart } from '../../context/CartContext'; // Import CartContext

const ProductGrid = memo(({ products = [], highlightedProduct }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const getProductQuantity = (productId) => {
    const product = cartItems.find((item) => item._id === productId);
    return product ? product.quantity : 0;
  };

  const handleOrderClick = (product) => {
    addToCart(product);
  };

  const handleIncrement = (productId) => {
    updateQuantity(productId, 'increment');
  };

  const handleDecrement = (productId) => {
    updateQuantity(productId, 'decrement');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const isHighlighted = product._id === highlightedProduct;
        const quantity = getProductQuantity(product._id);

        return (
          <div
            key={product._id}
            id={`product-${product._id}`}
            className={`bg-none flex flex-col justify-between h-full ${
              isHighlighted ? 'rounded-lg bg-pink-200' : 'border-gray-200'
            }`}
          >
            <img
              src={product.img || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="w-full h-32 object-cover rounded-t-lg"
              loading="lazy" // Lazy loading
            />
            <div className="mt-2 flex-grow px-2">
              <p className="text-sm font-medium text-gray-800">{product.name}</p>
              <p className="text-sm text-gray-500 truncate">{product.description}</p>
              <p className="text-gray-700 text-sm py-2">₹{product.price}</p>
            </div>

            {quantity === 0 ? (
              <button
                className="w-full bg-pink-500 text-white text-sm py-2 rounded-b-lg hover:bg-pink-600"
                onClick={() => handleOrderClick(product)}
              >
                Order
              </button>
            ) : (
              <div className="flex items-center justify-between mt-4 border-t py-1 px-2">
                <button
                  className="bg-gray-200 text-gray-700 rounded px-3 hover:bg-gray-300"
                  onClick={() => handleDecrement(product._id)}
                >
                  -
                </button>
                <span className="font-medium text-gray-800">{quantity}</span>
                <button
                  className="bg-gray-200 text-gray-700 rounded px-3 hover:bg-gray-300"
                  onClick={() => handleIncrement(product._id)}
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default ProductGrid;
