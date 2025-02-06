import React, { memo } from 'react';
import { useCart } from '@context/CartContext';

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
      {products.map((product) => {
        const isHighlighted = product._id === highlightedProduct;
        const quantity = getProductQuantity(product._id);

        return (
          <div
            key={product._id}
            id={`product-${product._id}`}
            className="flex flex-col rounded-2xl overflow-hidden"
          >
            {/* Image container with "Add" button overlay */}
            <div className="relative">
              <img
                src={product.img || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-44 object-cover rounded-2xl"
                loading="lazy"
              />

              {/* Add Button / Quantity Controls */}
              <div className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2">
                {quantity === 0 ? (
                  <button
                    className="bg-gray-100 px-6 py-[3px] rounded-xl shadow-sm shadow-gray-500 text-black text-sm font-semibold "
                    onClick={() => handleOrderClick(product)}
                  >
                    Add +
                  </button>
                ) : (
                  <div className="bg-white flex items-center px-4 rounded-xl gap-4">
                    <button
                      className="text-black text-[2rem]"
                      onClick={() => handleDecrement(product._id)}
                    >
                      -
                    </button>
                    <span className="text-black mx-2 font-semibold">{quantity}</span>
                    <button
                      className="text-black text-2xl  "
                      onClick={() => handleIncrement(product._id)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-5 flex-grow px-2">
              <p className="text-[14px] font-bold line-clamp-3 ">{product.name}</p>
              <p className="text-[14px] text-gray-500 truncate">{product.description}</p>
              <p className="font-bold text-[16px]  py-2">₹{product.price}.00</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ProductGrid;
