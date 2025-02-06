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
                className="w-full h-[9.6rem] object-cover rounded-2xl"
                loading="lazy"
              />

              {/* Add Button / Quantity Controls */}
              <div className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2">
                {quantity === 0 ? (
                  <button
                    className="bg-gray-100 px-4 py-[3px] rounded-xl shadow-sm shadow-gray-500 
                             text-black text-sm font-semibold flex items-center justify-center whitespace-nowrap"
                    onClick={() => handleOrderClick(product)}
                  >
                    Add +
                  </button>

                ) : (
                  <div className="bg-white flex items-center justify-between px-2 py-1 rounded-lg shadow-sm shadow-gray-500 w-auto">
                    <button
                      className="text-black text-lg px-2 leading-none"
                      onClick={() => handleDecrement(product._id)}
                    >
                      −
                    </button>
                    <span className="text-black font-semibold text-sm w-6 text-center">{quantity}</span>
                    <button
                      className="text-black text-lg px-2 leading-none"
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
              <p className="text-[12px] font-bold line-clamp-2 ">{product.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{product.description}</p>
              <p className="font-bold text-[13px]  py-2">₹{product.price}.00</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ProductGrid;
